import type { AddressRepository } from '../repositories/address.repository'
import type { StaffProfileRepository } from '../repositories/staff.repository'
import type { AddressUpsertInput } from '#shared/schemas'
import type { AddressDto } from '#shared/types'

/**
 * Addresses hang off the staff member's profile (`address.staffId`), so every
 * call resolves the caller's `staff_profile` first. The settings page edits a
 * single address, so writes upsert the member's existing row.
 */
export class AddressService {
  constructor(
    private readonly addresses: AddressRepository,
    private readonly profiles: StaffProfileRepository,
  ) {}

  async getAddress(userId: string): Promise<AddressDto | null> {
    const staffId = await this.resolveStaffId(userId)
    return this.addresses.findByStaffId(staffId)
  }

  async upsertAddress(
    userId: string,
    input: AddressUpsertInput,
  ): Promise<AddressDto> {
    const staffId = await this.resolveStaffId(userId)
    return this.addresses.upsert(staffId, input)
  }

  private async resolveStaffId(userId: string): Promise<string> {
    const profile = await this.profiles.findByUserId(userId)
    if (!profile) {
      throw createError({ statusCode: 404, statusMessage: 'Profile not found' })
    }
    return profile.id
  }
}
