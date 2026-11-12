import { isNotNull } from 'drizzle-orm'
import type { Database } from '../database/client'
import { petImage, user } from '../database/schema'

/** Reads the blob URLs referenced by DB rows, for the orphan sweep diff. */
export interface MaintenanceRepository {
  listReferencedImageUrls(): Promise<string[]>
}

export class DrizzleMaintenanceRepository implements MaintenanceRepository {
  constructor(private readonly db: Database) {}

  async listReferencedImageUrls(): Promise<string[]> {
    const pets = await this.db.select({ url: petImage.url }).from(petImage)
    const avatars = await this.db
      .select({ url: user.image })
      .from(user)
      .where(isNotNull(user.image))
    return [
      ...pets.map((r) => r.url),
      ...avatars.map((r) => r.url).filter((url): url is string => !!url),
    ]
  }
}
