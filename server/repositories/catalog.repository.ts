import { asc, eq } from 'drizzle-orm'
import type { Database } from '../database/client'
import { breed, city, species } from '../database/schema'
import type {
  BreedCreateInput,
  CityCreateInput,
  SpeciesCreateInput,
} from '#shared/schemas'

export type SpeciesRow = typeof species.$inferSelect
export type BreedRow = typeof breed.$inferSelect
export type CityRow = typeof city.$inferSelect

export interface CatalogRepository {
  listSpecies(): Promise<SpeciesRow[]>
  createSpecies(data: SpeciesCreateInput, actorId: string): Promise<SpeciesRow>
  listBreeds(speciesId?: string): Promise<BreedRow[]>
  createBreed(data: BreedCreateInput, actorId: string): Promise<BreedRow>
  listCities(): Promise<CityRow[]>
  createCity(data: CityCreateInput): Promise<CityRow>
}

export class DrizzleCatalogRepository implements CatalogRepository {
  constructor(private readonly db: Database) {}

  listSpecies() {
    return this.db.query.species.findMany({ orderBy: asc(species.name) })
  }

  async createSpecies(data: SpeciesCreateInput, actorId: string) {
    const [row] = await this.db
      .insert(species)
      .values({ ...data, createdBy: actorId, updatedBy: actorId })
      .returning()
    return row!
  }

  listBreeds(speciesId?: string) {
    return this.db.query.breed.findMany({
      where: speciesId ? eq(breed.speciesId, speciesId) : undefined,
      orderBy: asc(breed.name),
    })
  }

  async createBreed(data: BreedCreateInput, actorId: string) {
    const [row] = await this.db
      .insert(breed)
      .values({ ...data, createdBy: actorId, updatedBy: actorId })
      .returning()
    return row!
  }

  listCities() {
    return this.db.query.city.findMany({ orderBy: asc(city.name) })
  }

  async createCity(data: CityCreateInput) {
    const [row] = await this.db.insert(city).values(data).returning()
    return row!
  }
}
