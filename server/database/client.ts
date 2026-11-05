import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless'
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres'
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless'
import pg from 'pg'
import * as schema from './schema'

export type Database = ReturnType<typeof createDatabase>

const isNeon = (url: string) => /neon\.tech/i.test(url)

/**
 * Build a Drizzle client for the given connection string.
 *
 * - Neon (prod/Vercel): WebSocket Pool driver — supports transactions.
 * - Local/CI Postgres: node-postgres Pool.
 *
 * Node 22+ ships a global `WebSocket`, which the Neon driver needs.
 */
export function createDatabase(connectionString: string) {
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }

  if (isNeon(connectionString)) {
    if (!neonConfig.webSocketConstructor && typeof globalThis.WebSocket !== 'undefined') {
      neonConfig.webSocketConstructor = globalThis.WebSocket as unknown as typeof WebSocket
    }
    const pool = new NeonPool({ connectionString })
    return drizzleNeon({ client: pool, schema})
  }

  const pool = new pg.Pool({ connectionString })
  return drizzleNode({ client: pool, schema})
}
