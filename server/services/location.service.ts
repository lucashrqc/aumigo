import type { LocationRepository } from '../repositories/location.repository'
import type { CityListQuery, StateListQuery } from '#shared/schemas'

export class LocationService {
  constructor(private readonly locations: LocationRepository) {}

  listStates(query: StateListQuery) {
    return this.locations.listStates(query)
  }

  async getStateById(id: string) {
    const row = await this.locations.findStateById(id)
    if (!row) throw createError({ statusCode: 404, statusMessage: 'State not found' })
    return row
  }

  listCities(query: CityListQuery) {
    return this.locations.listCities(query)
  }

  async getCityById(id: string) {
    const row = await this.locations.findCityById(id)
    if (!row) throw createError({ statusCode: 404, statusMessage: 'City not found' })
    return row
  }
}
