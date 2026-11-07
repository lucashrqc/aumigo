import { and, asc, count, eq, ilike } from 'drizzle-orm'
import type { Database } from '../database/client'
import { city, state } from '../database/schema'
import type {
  CityListQuery,
  Paginated,
  StateListQuery,
} from '#shared/schemas'
import type { CityDto, StateDto } from '#shared/types'

export interface LocationRepository {
  listStates(query: StateListQuery): Promise<Paginated<StateDto>>
  findStateById(id: string): Promise<StateDto | null>
  findStateByIbgeId(ibgeId: number): Promise<StateDto | null>
  listCities(query: CityListQuery): Promise<Paginated<CityDto>>
  findCityById(id: string): Promise<CityDto | null>
  findCityByIbgeId(ibgeId: number): Promise<CityDto | null>
}

export class DrizzleLocationRepository implements LocationRepository {
  constructor(private readonly db: Database) {}

  async listStates(query: StateListQuery): Promise<Paginated<StateDto>> {
    const where = query.search ? ilike(state.name, `%${query.search}%`) : undefined
    const offset = (query.page - 1) * query.pageSize

    const [items, totalRow] = await Promise.all([
      this.db
        .select({ id: state.id, name: state.name, uf: state.uf })
        .from(state)
        .where(where)
        .orderBy(asc(state.name))
        .limit(query.pageSize)
        .offset(offset),
      this.db.select({ value: count() }).from(state).where(where),
    ])

    return { items, page: query.page, pageSize: query.pageSize, total: totalRow[0]?.value ?? 0 }
  }

  async findStateById(id: string): Promise<StateDto | null> {
    const [row] = await this.db
      .select({ id: state.id, name: state.name, uf: state.uf })
      .from(state)
      .where(eq(state.id, id))
      .limit(1)
    return row ?? null
  }

  async findStateByIbgeId(ibgeId: number): Promise<StateDto | null> {
    const [row] = await this.db
      .select({ id: state.id, name: state.name, uf: state.uf })
      .from(state)
      .where(eq(state.ibgeId, ibgeId))
      .limit(1)
    return row ?? null
  }

  async listCities(query: CityListQuery): Promise<Paginated<CityDto>> {
    const where = and(
      eq(city.stateId, query.stateId),
      query.search ? ilike(city.name, `%${query.search}%`) : undefined,
    )
    const offset = (query.page - 1) * query.pageSize

    const [items, totalRow] = await Promise.all([
      this.db
        .select({ id: city.id, name: city.name, stateId: city.stateId })
        .from(city)
        .where(where)
        .orderBy(asc(city.name))
        .limit(query.pageSize)
        .offset(offset),
      this.db.select({ value: count() }).from(city).where(where),
    ])

    return { items, page: query.page, pageSize: query.pageSize, total: totalRow[0]?.value ?? 0 }
  }

  async findCityById(id: string): Promise<CityDto | null> {
    const [row] = await this.db
      .select({ id: city.id, name: city.name, stateId: city.stateId })
      .from(city)
      .where(eq(city.id, id))
      .limit(1)
    return row ?? null
  }

  async findCityByIbgeId(ibgeId: number): Promise<CityDto | null> {
    const [row] = await this.db
      .select({ id: city.id, name: city.name, stateId: city.stateId })
      .from(city)
      .where(eq(city.ibgeId, ibgeId))
      .limit(1)
    return row ?? null
  }
}
