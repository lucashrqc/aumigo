import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { sql } from 'drizzle-orm'
import pg from 'pg'

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgresql://aumigo:aumigo@localhost:5432/aumigo_test'

/**
 * Vitest globalSetup: resets the test schema and applies all migrations once
 * before the integration suite runs.
 */
export default async function setup() {
  process.env.DATABASE_URL = TEST_DATABASE_URL
  const pool = new pg.Pool({ connectionString: TEST_DATABASE_URL })
  const db = drizzle(pool)

  // Drop the Drizzle migration journal (schema "drizzle") too, so migrations
  // are re-applied from scratch rather than seen as already applied.
  await db.execute(
    sql`DROP SCHEMA IF EXISTS drizzle CASCADE; DROP SCHEMA public CASCADE; CREATE SCHEMA public;`,
  )
  await migrate(db, { migrationsFolder: './server/database/migrations' })

  await pool.end()
}
