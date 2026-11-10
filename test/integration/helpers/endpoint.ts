import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createDatabase, type Database } from '../../../server/database/client'
import { DrizzleAdoptionApplicationRepository } from '../../../server/repositories/adoption.repository'
import { DrizzlePetRepository } from '../../../server/repositories/pet.repository'
import { AdoptionService } from '../../../server/services/adoption.service'
import { useUuidParam, useValidatedBody } from '../../../server/utils/validation'
import { TEST_DATABASE_URL } from '../../setup/database'

/**
 * Boots the real `POST /api/applications` Nitro route over HTTP so the endpoint
 * can be exercised through its full validation → service → repository → Postgres
 * chain. Only the two edges a unit DB test cannot reach are faked: the Nitro
 * auto-imports the route relies on (wired to the real service here) and the
 * session (`requireUser` reads an `x-test-user-id` header instead of a cookie).
 */

interface TestEvent {
  _body: unknown
  _userId: string | null
}

interface HttpError {
  statusCode?: number
  statusMessage?: string
  data?: unknown
}

function unauthorized(): Error & HttpError {
  return Object.assign(new Error('Unauthorized'), { statusCode: 401 })
}

function installRouteGlobals(service: AdoptionService) {
  const g = globalThis as Record<string, unknown>
  g.defineEventHandler = (handler: unknown) => handler
  g.readBody = async (event: TestEvent) => event._body
  g.useValidatedBody = useValidatedBody
  g.useUuidParam = useUuidParam
  g.useAdoptionService = () => service
  g.requireUser = async (event: TestEvent) => {
    if (!event._userId) throw unauthorized()
    return { user: { id: event._userId } }
  }
}

export interface EndpointResponse {
  status: number
  json: unknown
}

export interface ApplicationsEndpoint {
  db: Database
  post: (body: unknown, userId?: string) => Promise<EndpointResponse>
  close: () => Promise<void>
}

export async function startApplicationsEndpoint(): Promise<ApplicationsEndpoint> {
  const db = createDatabase(TEST_DATABASE_URL)
  const service = new AdoptionService(
    new DrizzleAdoptionApplicationRepository(db),
    new DrizzlePetRepository(db),
  )
  installRouteGlobals(service)

  const handler = (
    await import('../../../server/api/applications/index.post')
  ).default as (event: TestEvent) => Promise<unknown>

  const server: Server = createServer((req, res) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk as Buffer))
    req.on('end', async () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      let body: unknown
      try {
        body = raw ? JSON.parse(raw) : undefined
      } catch {
        body = raw
      }
      const header = req.headers['x-test-user-id']
      const userId = Array.isArray(header) ? (header[0] ?? null) : (header ?? null)
      try {
        const result = await handler({ _body: body, _userId: userId })
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify(result ?? null))
      } catch (err) {
        const e = err as HttpError
        res.writeHead(e.statusCode ?? 500, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ statusMessage: e.statusMessage, data: e.data }))
      }
    })
  })

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address() as AddressInfo
  const url = `http://127.0.0.1:${port}/api/applications`

  async function post(body: unknown, userId?: string): Promise<EndpointResponse> {
    const headers: Record<string, string> = { 'content-type': 'application/json' }
    if (userId) headers['x-test-user-id'] = userId
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
    const json = await res.json().catch(() => null)
    return { status: res.status, json }
  }

  async function close(): Promise<void> {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    )
  }

  return { db, post, close }
}
