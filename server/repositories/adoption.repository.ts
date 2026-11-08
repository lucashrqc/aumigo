import {
  and,
  count,
  desc,
  eq,
  exists,
  ilike,
  ne,
  notExists,
  notInArray,
  or,
  sql,
} from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import type { Database } from '../database/client'
import { adoptionApplication, pet, user } from '../database/schema'
import type { AdoptionApplicationListQuery, Paginated } from '#shared/schemas'
import type { AdoptionApplicationStatsDto } from '#shared/types'

/** Standard reason stored on applications auto-rejected when a pet is adopted. */
export const ADOPTED_REJECT_REASON =
  'Este pet já foi adotado, mas você ainda pode aplicar para outros pets.'

export type AdoptionApplicationRow = typeof adoptionApplication.$inferSelect

export interface AdoptionApplicationWithRelations extends AdoptionApplicationRow {
  pet: { id: string; name: string; status: string } | null
  adopter: { id: string; name: string; email: string } | null
}

export interface CreateApplicationData {
  petId: string
  adopterUserId: string
  contactPhone: string
  message?: string
}

export interface AdoptionApplicationRepository {
  list(query: AdoptionApplicationListQuery): Promise<Paginated<AdoptionApplicationWithRelations>>
  stats(): Promise<AdoptionApplicationStatsDto>
  listByAdopter(adopterUserId: string): Promise<AdoptionApplicationWithRelations[]>
  findById(id: string): Promise<AdoptionApplicationWithRelations | null>
  findOpenByPetAndAdopter(
    petId: string,
    adopterUserId: string,
  ): Promise<AdoptionApplicationRow | null>
  create(data: CreateApplicationData): Promise<AdoptionApplicationRow>
  /** Approve an application: mark it approved, adopt the pet, reject siblings. */
  approve(applicationId: string, petId: string, reviewerId: string): Promise<void>
  /** Reject a single application. */
  reject(applicationId: string, reviewerId: string): Promise<void>
  /** Mark the pet adopted and auto-reject its still-open applications. */
  markPetAdopted(petId: string, actorId: string): Promise<void>
  /** Undo an adoption at the pet level: pet back to pending, re-open applications. */
  revertPetAdoption(petId: string, actorId: string): Promise<void>
  /** Cancel an application; free the pet and re-open siblings when it was the approved one. */
  cancelApplication(applicationId: string, actorId: string): Promise<void>
}

const withRelations = {
  pet: { columns: { id: true, name: true, status: true } },
  adopter: { columns: { id: true, name: true, email: true } },
} as const

export class DrizzleAdoptionApplicationRepository implements AdoptionApplicationRepository {
  constructor(private readonly db: Database) {}

  async list(query: AdoptionApplicationListQuery) {
    const search = query.search?.trim()
    const conditions = [
      query.status ? eq(adoptionApplication.status, query.status) : undefined,
      query.petId ? eq(adoptionApplication.petId, query.petId) : undefined,
      search
        ? or(
            exists(
              this.db
                .select({ one: sql`1` })
                .from(pet)
                .where(
                  and(eq(pet.id, adoptionApplication.petId), ilike(pet.name, `%${search}%`)),
                ),
            ),
            exists(
              this.db
                .select({ one: sql`1` })
                .from(user)
                .where(
                  and(
                    eq(user.id, adoptionApplication.adopterUserId),
                    ilike(user.name, `%${search}%`),
                  ),
                ),
            ),
          )
        : undefined,
    ].filter(Boolean)
    const where = conditions.length ? and(...conditions) : undefined
    const offset = (query.page - 1) * query.pageSize

    const [items, totalRow] = await Promise.all([
      this.db.query.adoptionApplication.findMany({
        where,
        with: withRelations,
        orderBy: desc(adoptionApplication.createdAt),
        limit: query.pageSize,
        offset,
      }),
      this.db.select({ value: count() }).from(adoptionApplication).where(where),
    ])

    return {
      items: items as AdoptionApplicationWithRelations[],
      page: query.page,
      pageSize: query.pageSize,
      total: totalRow[0]?.value ?? 0,
    }
  }

  async stats(): Promise<AdoptionApplicationStatsDto> {
    const [row] = await this.db
      .select({
        total: count(),
        pending: count(sql`CASE WHEN ${adoptionApplication.status} = 'pending' THEN 1 END`),
        approved: count(sql`CASE WHEN ${adoptionApplication.status} = 'approved' THEN 1 END`),
        rejected: count(sql`CASE WHEN ${adoptionApplication.status} = 'rejected' THEN 1 END`),
      })
      .from(adoptionApplication)

    return {
      total: row?.total ?? 0,
      pending: row?.pending ?? 0,
      approved: row?.approved ?? 0,
      rejected: row?.rejected ?? 0,
    }
  }

  listByAdopter(adopterUserId: string) {
    return this.db.query.adoptionApplication.findMany({
      where: eq(adoptionApplication.adopterUserId, adopterUserId),
      with: withRelations,
      orderBy: desc(adoptionApplication.createdAt),
    }) as Promise<AdoptionApplicationWithRelations[]>
  }

  async findById(id: string) {
    const row = await this.db.query.adoptionApplication.findFirst({
      where: eq(adoptionApplication.id, id),
      with: withRelations,
    })
    return (row as AdoptionApplicationWithRelations) ?? null
  }

  async findOpenByPetAndAdopter(petId: string, adopterUserId: string) {
    const row = await this.db.query.adoptionApplication.findFirst({
      where: and(
        eq(adoptionApplication.petId, petId),
        eq(adoptionApplication.adopterUserId, adopterUserId),
        eq(adoptionApplication.status, 'pending'),
      ),
    })
    return row ?? null
  }

  async create(data: CreateApplicationData) {
    const [row] = await this.db.insert(adoptionApplication).values(data).returning()
    return row!
  }

  async approve(applicationId: string, petId: string, reviewerId: string) {
    await this.db.transaction(async (tx) => {
      const reviewedAt = new Date()
      await tx
        .update(adoptionApplication)
        .set({ status: 'approved', reviewedBy: reviewerId, reviewedAt, updatedAt: reviewedAt })
        .where(eq(adoptionApplication.id, applicationId))

      // Auto-reject the other open applications for the same pet.
      await tx
        .update(adoptionApplication)
        .set({
          status: 'rejected',
          reviewedBy: reviewerId,
          reviewedAt,
          rejectedBy: reviewerId,
          rejectedAt: reviewedAt,
          updatedAt: reviewedAt,
        })
        .where(
          and(
            eq(adoptionApplication.petId, petId),
            eq(adoptionApplication.status, 'pending'),
            ne(adoptionApplication.id, applicationId),
          ),
        )

      await tx
        .update(pet)
        .set({ status: 'adopted', updatedBy: reviewerId, updatedAt: reviewedAt })
        .where(eq(pet.id, petId))
    })
  }

  async reject(applicationId: string, reviewerId: string) {
    const reviewedAt = new Date()
    await this.db
      .update(adoptionApplication)
      .set({
        status: 'rejected',
        reviewedBy: reviewerId,
        reviewedAt,
        rejectedBy: reviewerId,
        rejectedAt: reviewedAt,
        updatedAt: reviewedAt,
      })
      .where(eq(adoptionApplication.id, applicationId))
  }

  async markPetAdopted(petId: string, actorId: string) {
    await this.db.transaction(async (tx) => {
      const now = new Date()
      await tx
        .update(adoptionApplication)
        .set({
          status: 'rejected',
          rejectedBy: actorId,
          rejectedAt: now,
          rejectReason: ADOPTED_REJECT_REASON,
          updatedAt: now,
        })
        .where(
          and(
            eq(adoptionApplication.petId, petId),
            notInArray(adoptionApplication.status, ['approved', 'canceled']),
          ),
        )

      await tx
        .update(pet)
        .set({ status: 'adopted', adoptedBy: actorId, adoptedAt: now, updatedBy: actorId, updatedAt: now })
        .where(eq(pet.id, petId))
    })
  }

  async revertPetAdoption(petId: string, actorId: string) {
    await this.db.transaction(async (tx) => {
      const now = new Date()
      await tx
        .update(pet)
        .set({ status: 'pending', canceledBy: actorId, canceledAt: now, updatedBy: actorId, updatedAt: now })
        .where(eq(pet.id, petId))

      await tx
        .update(adoptionApplication)
        .set({ status: 'pending', reviewedBy: null, reviewedAt: null, updatedAt: now })
        .where(
          and(
            eq(adoptionApplication.petId, petId),
            eq(adoptionApplication.status, 'approved'),
          ),
        )

      await tx
        .update(adoptionApplication)
        .set(this.reopenRejectedValues(now))
        .where(this.reopenRejectedWhere(petId))
    })
  }

  async cancelApplication(applicationId: string, actorId: string) {
    await this.db.transaction(async (tx) => {
      const now = new Date()
      const app = await tx.query.adoptionApplication.findFirst({
        where: eq(adoptionApplication.id, applicationId),
        with: { pet: { columns: { id: true, status: true } } },
      })
      if (!app) return

      await tx
        .update(adoptionApplication)
        .set({ status: 'canceled', canceledBy: actorId, canceledAt: now, updatedAt: now })
        .where(eq(adoptionApplication.id, applicationId))

      if (app.status === 'approved' && app.pet?.status === 'adopted') {
        await tx
          .update(pet)
          .set({ status: 'available', updatedBy: actorId, updatedAt: now })
          .where(eq(pet.id, app.petId))

        await tx
          .update(adoptionApplication)
          .set(this.reopenRejectedValues(now))
          .where(this.reopenRejectedWhere(app.petId))
      }
    })
  }

  /** Column values that re-open a rejected application back to 'pending'. */
  private reopenRejectedValues(now: Date) {
    return {
      status: 'pending' as const,
      reviewedBy: null,
      reviewedAt: null,
      rejectedBy: null,
      rejectedAt: null,
      rejectReason: null,
      updatedAt: now,
    }
  }

  /**
   * Match a pet's rejected applications, skipping adopters who already hold a
   * pending application for the pet so the partial unique index
   * `adoption_application_open_uq` is never violated.
   */
  private reopenRejectedWhere(petId: string) {
    const open = alias(adoptionApplication, 'open_app')
    return and(
      eq(adoptionApplication.petId, petId),
      eq(adoptionApplication.status, 'rejected'),
      notExists(
        this.db
          .select({ one: sql`1` })
          .from(open)
          .where(
            and(
              eq(open.petId, adoptionApplication.petId),
              eq(open.adopterUserId, adoptionApplication.adopterUserId),
              eq(open.status, 'pending'),
            ),
          ),
      ),
    )
  }
}
