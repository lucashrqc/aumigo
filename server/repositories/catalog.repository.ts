import { and, asc, count, eq, ilike } from 'drizzle-orm'
import type { Database } from '../database/client'
import { breed, city, species } from '../database/schema'
import type {
  BreedCreateInput,
  BreedListQuery,
  BreedUpdateInput,
  CityCreateInput,
  Paginated,
  SpeciesCreateInput,
  SpeciesListQuery,
  SpeciesUpdateInput,
} from '#shared/schemas'

export type SpeciesRow = typeof species.$inferSelect
export type BreedRow = typeof breed.$inferSelect
export type CityRow = typeof city.$inferSelect

type AuditUser = { id: string; name: string } | null
export interface SpeciesWithAudit extends SpeciesRow {
  creator: AuditUser
  updater: AuditUser
}
export interface BreedWithAudit extends BreedRow {
  creator: AuditUser
  updater: AuditUser
}

/** Relational `with` clause that joins the staff authors for audit columns. */
const auditWith = {
  creator: { columns: { id: true, name: true } },
  updater: { columns: { id: true, name: true } },
} as const

export interface CatalogRepository {
  listSpecies(): Promise<SpeciesRow[]>
  listSpeciesPaginated(query: SpeciesListQuery): Promise<Paginated<SpeciesWithAudit>>
  findSpeciesById(id: string): Promise<SpeciesRow | null>
  createSpecies(data: SpeciesCreateInput, actorId: string): Promise<SpeciesRow>
  updateSpecies(id: string, data: SpeciesUpdateInput, actorId: string): Promise<SpeciesRow | null>
  deleteSpecies(id: string): Promise<void>
  listBreeds(speciesId?: string): Promise<BreedRow[]>
  listBreedsPaginated(query: BreedListQuery): Promise<Paginated<BreedWithAudit>>
  findBreedById(id: string): Promise<BreedRow | null>
  createBreed(data: BreedCreateInput, actorId: string): Promise<BreedRow>
  updateBreed(id: string, data: BreedUpdateInput, actorId: string): Promise<BreedRow | null>
  deleteBreed(id: string): Promise<void>
  listCities(): Promise<CityRow[]>
  createCity(data: CityCreateInput): Promise<CityRow>
}

export class DrizzleCatalogRepository implements CatalogRepository {
  constructor(private readonly db: Database) {}

  listSpecies() {
    return this.db.query.species.findMany({ orderBy: asc(species.name) })
  }

  async listSpeciesPaginated(query: SpeciesListQuery): Promise<Paginated<SpeciesWithAudit>> {
    const where = query.search ? ilike(species.name, `%${query.search}%`) : undefined
    const offset = (query.page - 1) * query.pageSize

    const [items, totalRow] = await Promise.all([
      this.db.query.species.findMany({
        where,
        with: auditWith,
        orderBy: asc(species.name),
        limit: query.pageSize,
        offset,
      }),
      this.db.select({ value: count() }).from(species).where(where),
    ])

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total: totalRow[0]?.value ?? 0,
    }
  }

  async findSpeciesById(id: string) {
    const row = await this.db.query.species.findFirst({ where: eq(species.id, id) })
    return row ?? null
  }

  async createSpecies(data: SpeciesCreateInput, actorId: string) {
    const [row] = await this.db
      .insert(species)
      .values({ ...data, createdBy: actorId, updatedBy: actorId })
      .returning()
    return row!
  }

  async updateSpecies(id: string, data: SpeciesUpdateInput, actorId: string) {
    const [row] = await this.db
      .update(species)
      .set({ ...data, updatedBy: actorId, updatedAt: new Date() })
      .where(eq(species.id, id))
      .returning()
    return row ?? null
  }

  async deleteSpecies(id: string): Promise<void> {
    await this.db.delete(species).where(eq(species.id, id))
  }

  listBreeds(speciesId?: string) {
    return this.db.query.breed.findMany({
      where: speciesId ? eq(breed.speciesId, speciesId) : undefined,
      orderBy: asc(breed.name),
    })
  }

  async listBreedsPaginated(query: BreedListQuery): Promise<Paginated<BreedWithAudit>> {
    const conditions = [
      query.speciesId ? eq(breed.speciesId, query.speciesId) : undefined,
      query.search ? ilike(breed.name, `%${query.search}%`) : undefined,
    ].filter(Boolean)

    const where = conditions.length ? and(...conditions) : undefined
    const offset = (query.page - 1) * query.pageSize

    const [items, totalRow] = await Promise.all([
      this.db.query.breed.findMany({
        where,
        with: auditWith,
        orderBy: asc(breed.name),
        limit: query.pageSize,
        offset,
      }),
      this.db.select({ value: count() }).from(breed).where(where),
    ])

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total: totalRow[0]?.value ?? 0,
    }
  }

  async findBreedById(id: string) {
    const row = await this.db.query.breed.findFirst({ where: eq(breed.id, id) })
    return row ?? null
  }

  async createBreed(data: BreedCreateInput, actorId: string) {
    const [row] = await this.db
      .insert(breed)
      .values({ ...data, createdBy: actorId, updatedBy: actorId })
      .returning()
    return row!
  }

  async updateBreed(id: string, data: BreedUpdateInput, actorId: string) {
    const [row] = await this.db
      .update(breed)
      .set({ ...data, updatedBy: actorId, updatedAt: new Date() })
      .where(eq(breed.id, id))
      .returning()
    return row ?? null
  }

  async deleteBreed(id: string): Promise<void> {
    await this.db.delete(breed).where(eq(breed.id, id))
  }

  listCities() {
    return this.db.query.city.findMany({ orderBy: asc(city.name) })
  }

  async createCity(data: CityCreateInput) {
    const [row] = await this.db.insert(city).values(data).returning()
    return row!
  }
}
