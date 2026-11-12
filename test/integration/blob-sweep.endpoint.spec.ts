import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { requireCronOrAdmin } from '../../server/utils/session'
import { useValidatedQuery } from '../../server/utils/validation'
import type { BlobSweepReportDto } from '#shared/types'
import type { SweepOptions } from '../../server/services/maintenance.service'

const CRON_SECRET = 'test-secret'

const report: BlobSweepReportDto = {
  dryRun: true,
  minAgeHours: 24,
  scanned: 3,
  referenced: 1,
  orphaned: 2,
  eligible: 1,
  deleted: 0,
  capped: false,
  orphans: [],
}

const sweepBlobs = vi.fn<(o: SweepOptions) => Promise<BlobSweepReportDto>>(() =>
  Promise.resolve(report),
)

interface TestEvent {
  headers: Record<string, string>
  query: Record<string, string>
}

function makeEvent(opts: Partial<TestEvent> = {}): TestEvent {
  return { headers: {}, query: {}, ...opts }
}

type Handler = (event: TestEvent) => Promise<BlobSweepReportDto>
let handler: Handler

beforeAll(async () => {
  const g = globalThis as Record<string, unknown>
  g.defineEventHandler = (h: unknown) => h
  g.getHeader = (event: TestEvent, name: string) => event.headers[name]
  g.getQuery = (event: TestEvent) => event.query
  g.useRuntimeConfig = () => ({ cronSecret: CRON_SECRET })
  g.useValidatedQuery = useValidatedQuery
  g.requireCronOrAdmin = requireCronOrAdmin
  g.useMaintenanceService = () => ({ sweepBlobs })
  g.useAuth = () => ({ api: { getSession: async () => null } })
  handler = (await import('../../server/api/maintenance/blob-sweep.get'))
    .default as Handler
})

afterAll(() => sweepBlobs.mockClear())

function withBearer(secret: string) {
  return makeEvent({ headers: { authorization: `Bearer ${secret}` } })
}

describe('GET /api/maintenance/blob-sweep', () => {
  it('rejects requests without a cron bearer or admin session', async () => {
    await expect(handler(makeEvent())).rejects.toMatchObject({
      statusCode: 401,
    })
    await expect(handler(withBearer('wrong-secret'))).rejects.toMatchObject({
      statusCode: 401,
    })
  })

  it('returns the report for a valid cron bearer', async () => {
    const res = await handler(withBearer(CRON_SECRET))
    expect(res).toEqual(report)
  })

  it('defaults to a dry run (deleteOrphans:false) when delete is absent', async () => {
    sweepBlobs.mockClear()
    await handler(withBearer(CRON_SECRET))
    expect(sweepBlobs).toHaveBeenCalledWith({
      minAgeHours: 24,
      deleteOrphans: false,
    })
  })

  it('passes delete=true and minAgeHours through to the service', async () => {
    sweepBlobs.mockClear()
    await handler(
      makeEvent({
        headers: { authorization: `Bearer ${CRON_SECRET}` },
        query: { delete: 'true', minAgeHours: '0' },
      }),
    )
    expect(sweepBlobs).toHaveBeenCalledWith({
      minAgeHours: 0,
      deleteOrphans: true,
    })
  })
})
