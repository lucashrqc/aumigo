import type { LocationRepository } from '../repositories/location.repository'
import type {
  CityListQuery,
  IbgeResolveQuery,
  StateListQuery,
} from '#shared/schemas'
import type { IbgeResolveDto } from '#shared/types'

export class LocationService {
  constructor(private readonly locations: LocationRepository) {}

  listStates(query: StateListQuery) {
    return this.locations.listStates(query)
  }

  async getStateById(id: string) {
    const row = await this.locations.findStateById(id)
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Estado não encontrado' })
    return row
  }

  listCities(query: CityListQuery) {
    return this.locations.listCities(query)
  }

  async getCityById(id: string) {
    const row = await this.locations.findCityById(id)
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Cidade não encontrada' })
    return row
  }

  async resolveByIbge(query: IbgeResolveQuery): Promise<IbgeResolveDto> {
    const [state, city] = await Promise.all([
      this.locations.findStateByIbgeId(query.stateIbgeId),
      query.cityIbgeId
        ? this.locations.findCityByIbgeId(query.cityIbgeId)
        : Promise.resolve(null),
    ])
    return { state, city }
  }
}
