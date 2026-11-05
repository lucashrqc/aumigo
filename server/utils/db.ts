import { createDatabase, type Database } from '../database/client'

let _db: Database | undefined

/**
 * Lazily-created, process-wide Drizzle client for the Nuxt/Nitro runtime.
 * Reused across requests (and serverless invocations) to avoid exhausting
 * database connections.
 */
export function useDb(): Database {
  if (!_db) {
    const { databaseUrl } = useRuntimeConfig()
    _db = createDatabase(databaseUrl)
  }
  return _db
}
