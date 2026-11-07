import type { CatalogRepository } from '../repositories/catalog.repository'
import type {
  BreedCreateInput,
  BreedListQuery,
  BreedUpdateInput,
  CityCreateInput,
  SpeciesCreateInput,
  SpeciesListQuery,
  SpeciesUpdateInput,
} from '#shared/schemas'

/** Postgres foreign-key violation — the row is still referenced elsewhere. */
function isForeignKeyViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === '23503'
}

export class CatalogService {
  constructor(private readonly catalog: CatalogRepository) {}

  listSpecies() {
    return this.catalog.listSpecies()
  }

  listSpeciesPaginated(query: SpeciesListQuery) {
    return this.catalog.listSpeciesPaginated(query)
  }

  async getSpeciesById(id: string) {
    const row = await this.catalog.findSpeciesById(id)
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Species not found' })
    return row
  }

  createSpecies(input: SpeciesCreateInput, actorId: string) {
    return this.catalog.createSpecies(input, actorId)
  }

  async updateSpecies(id: string, input: SpeciesUpdateInput, actorId: string) {
    const updated = await this.catalog.updateSpecies(id, input, actorId)
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Species not found' })
    return updated
  }

  async removeSpecies(id: string): Promise<void> {
    await this.getSpeciesById(id)
    try {
      await this.catalog.deleteSpecies(id)
    } catch (err) {
      if (isForeignKeyViolation(err)) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Species is still in use by breeds or pets',
        })
      }
      throw err
    }
  }

  listBreeds(speciesId?: string) {
    return this.catalog.listBreeds(speciesId)
  }

  listBreedsPaginated(query: BreedListQuery) {
    return this.catalog.listBreedsPaginated(query)
  }

  async getBreedById(id: string) {
    const row = await this.catalog.findBreedById(id)
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Breed not found' })
    return row
  }

  createBreed(input: BreedCreateInput, actorId: string) {
    return this.catalog.createBreed(input, actorId)
  }

  async updateBreed(id: string, input: BreedUpdateInput, actorId: string) {
    const updated = await this.catalog.updateBreed(id, input, actorId)
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Breed not found' })
    return updated
  }

  async removeBreed(id: string): Promise<void> {
    await this.getBreedById(id)
    try {
      await this.catalog.deleteBreed(id)
    } catch (err) {
      if (isForeignKeyViolation(err)) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Breed is still in use by pets',
        })
      }
      throw err
    }
  }

  listCities() {
    return this.catalog.listCities()
  }

  createCity(input: CityCreateInput) {
    return this.catalog.createCity(input)
  }
}
