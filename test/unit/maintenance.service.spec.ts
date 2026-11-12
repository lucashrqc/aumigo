import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MaintenanceService,
  MAX_SWEEP_DELETIONS,
} from '../../server/services/maintenance.service'
import type { BlobObject, BlobStorage } from '../../server/storage/blob-storage'
import type { MaintenanceRepository } from '../../server/repositories/maintenance.repository'

const NOW = new Date('2026-01-10T00:00:00.000Z')

function blobAt(url: string, prefix: string, hoursAgo: number): BlobObject {
  return {
    url,
    pathname: `${prefix}${url.split('/').pop()}`,
    size: 1000,
    uploadedAt: new Date(NOW.getTime() - hoursAgo * 3_600_000),
  }
}

function makeBlob(byPrefix: Record<string, BlobObject[]>): BlobStorage {
  return {
    handleClientUpload: vi.fn(),
    list: vi.fn((prefix: string) => Promise.resolve(byPrefix[prefix] ?? [])),
    delete: vi.fn().mockResolvedValue(undefined),
  }
}

function makeRepo(urls: string[]): MaintenanceRepository {
  return { listReferencedImageUrls: vi.fn().mockResolvedValue(urls) }
}

beforeEach(() => vi.useFakeTimers({ now: NOW }))
afterEach(() => vi.useRealTimers())

describe('MaintenanceService.sweepBlobs', () => {
  it('excludes referenced URLs and flags eligibility by age', async () => {
    const blob = makeBlob({
      'pets/': [
        blobAt('https://b/pets/old.jpg', 'pets/', 48),
        blobAt('https://b/pets/fresh.jpg', 'pets/', 2),
        blobAt('https://b/pets/kept.jpg', 'pets/', 72),
      ],
      'avatars/': [blobAt('https://b/avatars/a.jpg', 'avatars/', 30)],
    })
    const repo = makeRepo(['https://b/pets/kept.jpg'])
    const service = new MaintenanceService(blob, repo)

    const report = await service.sweepBlobs({
      minAgeHours: 24,
      deleteOrphans: false,
    })

    expect(report.scanned).toBe(4)
    expect(report.referenced).toBe(1)
    expect(report.orphaned).toBe(3)
    expect(report.eligible).toBe(2)
    expect(report.orphans.map((o) => o.url)).not.toContain(
      'https://b/pets/kept.jpg',
    )
    const fresh = report.orphans.find((o) => o.url.endsWith('fresh.jpg'))
    expect(fresh?.eligible).toBe(false)
    expect(fresh?.ageHours).toBe(2)
  })

  it('does not delete on dry-run', async () => {
    const blob = makeBlob({
      'pets/': [blobAt('https://b/pets/old.jpg', 'pets/', 48)],
    })
    const service = new MaintenanceService(blob, makeRepo([]))

    const report = await service.sweepBlobs({
      minAgeHours: 24,
      deleteOrphans: false,
    })

    expect(blob.delete).not.toHaveBeenCalled()
    expect(report.deleted).toBe(0)
    expect(report.dryRun).toBe(true)
  })

  it('deletes exactly the eligible orphans when requested', async () => {
    const blob = makeBlob({
      'pets/': [
        blobAt('https://b/pets/old.jpg', 'pets/', 48),
        blobAt('https://b/pets/fresh.jpg', 'pets/', 2),
      ],
    })
    const service = new MaintenanceService(blob, makeRepo([]))

    const report = await service.sweepBlobs({
      minAgeHours: 24,
      deleteOrphans: true,
    })

    expect(blob.delete).toHaveBeenCalledWith(['https://b/pets/old.jpg'])
    expect(report.deleted).toBe(1)
    expect(report.dryRun).toBe(false)
  })

  it('caps deletions at MAX_SWEEP_DELETIONS', async () => {
    const many = Array.from({ length: MAX_SWEEP_DELETIONS + 5 }, (_, i) =>
      blobAt(`https://b/pets/${i}.jpg`, 'pets/', 48),
    )
    const blob = makeBlob({ 'pets/': many })
    const service = new MaintenanceService(blob, makeRepo([]))

    const report = await service.sweepBlobs({
      minAgeHours: 24,
      deleteOrphans: true,
    })

    expect(report.capped).toBe(true)
    expect(report.eligible).toBe(MAX_SWEEP_DELETIONS + 5)
    expect(report.deleted).toBe(MAX_SWEEP_DELETIONS)
    expect(
      (blob.delete as ReturnType<typeof vi.fn>).mock.calls[0][0],
    ).toHaveLength(MAX_SWEEP_DELETIONS)
  })
})
