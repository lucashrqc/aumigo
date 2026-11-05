import { and, desc, eq, isNull } from 'drizzle-orm'
import type { Database } from '../database/client'
import { staffInvitation, staffProfile } from '../database/schema'

export type StaffInvitationRow = typeof staffInvitation.$inferSelect
export type StaffProfileRow = typeof staffProfile.$inferSelect

export interface CreateInvitationData {
  email: string
  role: StaffInvitationRow['role']
  token: string
  expiresAt: Date
  invitedBy: string
}

export interface StaffInvitationRepository {
  list(): Promise<StaffInvitationRow[]>
  create(data: CreateInvitationData): Promise<StaffInvitationRow>
  findValidByToken(token: string): Promise<StaffInvitationRow | null>
  markAccepted(id: string): Promise<void>
}

export class DrizzleStaffInvitationRepository implements StaffInvitationRepository {
  constructor(private readonly db: Database) {}

  list() {
    return this.db.query.staffInvitation.findMany({
      orderBy: desc(staffInvitation.createdAt),
    })
  }

  async create(data: CreateInvitationData) {
    const [row] = await this.db.insert(staffInvitation).values(data).returning()
    return row!
  }

  async findValidByToken(token: string) {
    const row = await this.db.query.staffInvitation.findFirst({
      where: and(eq(staffInvitation.token, token), isNull(staffInvitation.acceptedAt)),
    })
    return row ?? null
  }

  async markAccepted(id: string) {
    await this.db
      .update(staffInvitation)
      .set({ acceptedAt: new Date() })
      .where(eq(staffInvitation.id, id))
  }
}

export interface CreateStaffProfileData {
  userId: string
  name: string
  phone?: string | null
}

export interface StaffProfileRepository {
  findByUserId(userId: string): Promise<StaffProfileRow | null>
  create(data: CreateStaffProfileData): Promise<StaffProfileRow>
}

export class DrizzleStaffProfileRepository implements StaffProfileRepository {
  constructor(private readonly db: Database) {}

  async findByUserId(userId: string) {
    const row = await this.db.query.staffProfile.findFirst({
      where: eq(staffProfile.userId, userId),
    })
    return row ?? null
  }

  async create(data: CreateStaffProfileData) {
    const [row] = await this.db.insert(staffProfile).values(data).returning()
    return row!
  }
}
