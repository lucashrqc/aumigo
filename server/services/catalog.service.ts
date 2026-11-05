import type { CatalogRepository } from '../repositories/catalog.repository'
import type { BreedCreateInput, CityCreateInput, SpeciesCreateInput } from '#shared/schemas'

export class CatalogService {
  constructor(private readonly catalog: CatalogRepository) {}

  listSpecies() {
    return this.catalog.listSpecies()
  }

  createSpecies(input: SpeciesCreateInput, actorId: string) {
    return this.catalog.createSpecies(input, actorId)
  }

  listBreeds(speciesId?: string) {
    return this.catalog.listBreeds(speciesId)
  }

  createBreed(input: BreedCreateInput, actorId: string) {
    return this.catalog.createBreed(input, actorId)
  }

  listCities() {
    return this.catalog.listCities()
  }

  createCity(input: CityCreateInput) {
    return this.catalog.createCity(input)
  }
}
