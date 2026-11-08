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

/** Postgres unique violation — a row with the same unique field already exists. */
function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === '23505'
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
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Espécie não encontrada' })
    return row
  }

  async createSpecies(input: SpeciesCreateInput, actorId: string) {
    try {
      return await this.catalog.createSpecies(input, actorId)
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw createError({ statusCode: 409, statusMessage: 'Espécie já cadastrada' })
      }
      throw err
    }
  }

  async updateSpecies(id: string, input: SpeciesUpdateInput, actorId: string) {
    try {
      const updated = await this.catalog.updateSpecies(id, input, actorId)
      if (!updated) throw createError({ statusCode: 404, statusMessage: 'Espécie não encontrada' })
      return updated
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw createError({ statusCode: 409, statusMessage: 'Espécie já cadastrada' })
      }
      throw err
    }
  }

  async removeSpecies(id: string): Promise<void> {
    await this.getSpeciesById(id)
    try {
      await this.catalog.deleteSpecies(id)
    } catch (err) {
      if (isForeignKeyViolation(err)) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Espécie ainda está em uso por raças ou pets',
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
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Raça não encontrada' })
    return row
  }

  async createBreed(input: BreedCreateInput, actorId: string) {
    try {
      return await this.catalog.createBreed(input, actorId)
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw createError({ statusCode: 409, statusMessage: 'Raça já cadastrada para esta espécie' })
      }
      throw err
    }
  }

  async updateBreed(id: string, input: BreedUpdateInput, actorId: string) {
    try {
      const updated = await this.catalog.updateBreed(id, input, actorId)
      if (!updated) throw createError({ statusCode: 404, statusMessage: 'Raça não encontrada' })
      return updated
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw createError({ statusCode: 409, statusMessage: 'Raça já cadastrada para esta espécie' })
      }
      throw err
    }
  }

  async removeBreed(id: string): Promise<void> {
    await this.getBreedById(id)
    try {
      await this.catalog.deleteBreed(id)
    } catch (err) {
      if (isForeignKeyViolation(err)) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Raça ainda está em uso por pets',
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
