import type {
  StaffProfileRow,
  StaffProfileRepository,
} from '../repositories/staff.repository'
import type { IdentityProvider } from './identity'
import type { ProfileUpdateInput } from '#shared/schemas'
import type { ProfileDto } from '#shared/types'

function toDto(row: StaffProfileRow): ProfileDto {
  return { id: row.id, name: row.name, phone: row.phone }
}

/**
 * The display name lives in both the BetterAuth `user` row (read by the
 * session/sidebar) and `staff_profile`, so updates write both to keep them in sync.
 */
export class ProfileService {
  constructor(
    private readonly profiles: StaffProfileRepository,
    private readonly identity: IdentityProvider,
  ) {}

  async getProfile(userId: string): Promise<ProfileDto> {
    const profile = await this.profiles.findByUserId(userId)
    if (!profile) {
      throw createError({ statusCode: 404, statusMessage: 'Perfil não encontrado' })
    }
    return toDto(profile)
  }

  async updateProfile(
    userId: string,
    input: ProfileUpdateInput,
  ): Promise<ProfileDto> {
    await this.identity.updateName(userId, input.name)

    const updated = await this.profiles.update(userId, {
      name: input.name,
      phone: input.phone ?? null,
    })
    // Fall back to creating the profile if it doesn't exist yet.
    const profile =
      updated ??
      (await this.profiles.create({
        userId,
        name: input.name,
        phone: input.phone ?? null,
      }))

    return toDto(profile)
  }

  async updateAvatar(userId: string, image: string | null): Promise<void> {
    await this.identity.updateImage(userId, image)
  }
}
