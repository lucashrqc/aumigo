import {
  and,
  count,
  countDistinct,
  eq,
  gte,
  lt,
  sql,
  type SQL,
} from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'
import type { Database } from '../database/client'
import { adoptionApplication, appliedVaccine, pet } from '../database/schema'
import type { AnalyticsQuery } from '#shared/schemas'
import type { AdminAnalyticsDto } from '#shared/types'

export interface AnalyticsRepository {
  overview(query: AnalyticsQuery): Promise<AdminAnalyticsDto>
}

type DateColumn = PgColumn

/** Build the `[from, to]` predicates for a timestamp column (`to` is inclusive). */
function dateRange(
  col: DateColumn,
  from?: string,
  to?: string,
): (SQL | undefined)[] {
  return [
    from ? gte(col, new Date(from)) : undefined,
    to ? lt(col, new Date(new Date(to).getTime() + 86_400_000)) : undefined,
  ]
}

function whereParts(...parts: (SQL | undefined)[]): SQL | undefined {
  const filtered = parts.filter(Boolean) as SQL[]
  return filtered.length ? and(...filtered) : undefined
}

/** Dense list of `YYYY-MM` keys spanning the two dates (inclusive). */
function monthKeys(from: Date, to: Date): string[] {
  const keys: string[] = []
  const cursor = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1),
  )
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1))
  while (cursor <= end) {
    keys.push(
      `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`,
    )
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
  return keys
}

export class DrizzleAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly db: Database) {}

  async overview(query: AnalyticsQuery): Promise<AdminAnalyticsDto> {
    const { from, to, speciesId } = query
    const bySpecies = speciesId ? eq(pet.speciesId, speciesId) : undefined

    const [cards, petsPerMonth] = await Promise.all([
      this.cards(from, to, bySpecies),
      this.petsPerMonth(from, to, bySpecies),
    ])

    return { cards, petsPerMonth }
  }

  private async cards(
    from: string | undefined,
    to: string | undefined,
    bySpecies: SQL | undefined,
  ): Promise<AdminAnalyticsDto['cards']> {
    const [adopted, available, pendingApplications, vaccinated] =
      await Promise.all([
        this.db
          .select({ value: count() })
          .from(pet)
          .where(whereParts(...dateRange(pet.adoptedAt, from, to), bySpecies)),
        this.db
          .select({ value: count() })
          .from(pet)
          .where(
            whereParts(
              eq(pet.active, true),
              ...dateRange(pet.publishedAt, from, to),
              bySpecies,
            ),
          ),
        this.db
          .select({ value: count() })
          .from(adoptionApplication)
          .innerJoin(pet, eq(adoptionApplication.petId, pet.id))
          .where(
            whereParts(
              eq(adoptionApplication.status, 'pending'),
              ...dateRange(adoptionApplication.createdAt, from, to),
              bySpecies,
            ),
          ),
        this.db
          .select({ value: countDistinct(appliedVaccine.petId) })
          .from(appliedVaccine)
          .innerJoin(pet, eq(appliedVaccine.petId, pet.id))
          .where(whereParts(...dateRange(pet.createdAt, from, to), bySpecies)),
      ])

    return {
      adopted: adopted[0]?.value ?? 0,
      available: available[0]?.value ?? 0,
      pendingApplications: pendingApplications[0]?.value ?? 0,
      vaccinated: vaccinated[0]?.value ?? 0,
    }
  }

  private async petsPerMonth(
    from: string | undefined,
    to: string | undefined,
    bySpecies: SQL | undefined,
  ): Promise<AdminAnalyticsDto['petsPerMonth']> {
    const series = (col: DateColumn) => {
      const month = sql<string>`to_char(date_trunc('month', ${col}), 'YYYY-MM')`
      return this.db
        .select({ month, value: count() })
        .from(pet)
        .where(whereParts(...dateRange(col, from, to), bySpecies))
        .groupBy(month)
    }

    const [createdRows, adoptedRows] = await Promise.all([
      series(pet.createdAt),
      series(pet.adoptedAt),
    ])

    const createdMap = new Map(
      createdRows.map((r) => [r.month, Number(r.value)]),
    )
    const adoptedMap = new Map(
      adoptedRows.map((r) => [r.month, Number(r.value)]),
    )

    const months =
      from && to
        ? monthKeys(new Date(from), new Date(to))
        : [...new Set([...createdMap.keys(), ...adoptedMap.keys()])].sort()

    return months.map((month) => ({
      month,
      created: createdMap.get(month) ?? 0,
      adopted: adoptedMap.get(month) ?? 0,
    }))
  }
}
