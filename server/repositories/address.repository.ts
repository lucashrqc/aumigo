import { asc, eq } from 'drizzle-orm'
import type { Database } from '../database/client'
import { address, city } from '../database/schema'
import type { AddressUpsertInput } from '#shared/schemas'
import type { AddressDto } from '#shared/types'

export interface AddressRepository {
  findByStaffId(staffId: string): Promise<AddressDto | null>
  upsert(staffId: string, data: AddressUpsertInput): Promise<AddressDto>
}

export class DrizzleAddressRepository implements AddressRepository {
  constructor(private readonly db: Database) {}

  async findByStaffId(staffId: string): Promise<AddressDto | null> {
    const [row] = await this.db
      .select({
        id: address.id,
        cityId: address.cityId,
        stateId: city.stateId,
        street: address.street,
        number: address.number,
        neighborhood: address.neighborhood,
        complement: address.complement,
        zipCode: address.zipCode,
      })
      .from(address)
      .innerJoin(city, eq(address.cityId, city.id))
      .where(eq(address.staffId, staffId))
      .orderBy(asc(address.createdAt))
      .limit(1)
    return row ?? null
  }

  async upsert(staffId: string, data: AddressUpsertInput): Promise<AddressDto> {
    const values = {
      cityId: data.cityId,
      street: data.street,
      number: data.number ?? null,
      neighborhood: data.neighborhood ?? null,
      complement: data.complement ?? null,
      zipCode: data.zipCode ?? null,
    }

    const [existing] = await this.db
      .select({ id: address.id })
      .from(address)
      .where(eq(address.staffId, staffId))
      .orderBy(asc(address.createdAt))
      .limit(1)

    if (existing) {
      await this.db
        .update(address)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(address.id, existing.id))
    } else {
      await this.db.insert(address).values({ staffId, ...values })
    }

    const saved = await this.findByStaffId(staffId)
    return saved!
  }
}
