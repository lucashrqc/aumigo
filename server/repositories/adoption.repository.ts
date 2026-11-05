import { and, count, desc, eq, ne } from 'drizzle-orm'
import type { Database } from '../database/client'
import { adoptionApplication, pet } from '../database/schema'
import type { AdoptionApplicationListQuery, Paginated } from '#shared/schemas'

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
}

const withRelations = {
  pet: { columns: { id: true, name: true, status: true } },
  adopter: { columns: { id: true, name: true, email: true } },
} as const

export class DrizzleAdoptionApplicationRepository implements AdoptionApplicationRepository {
  constructor(private readonly db: Database) {}

  async list(query: AdoptionApplicationListQuery) {
    const conditions = [
      query.status ? eq(adoptionApplication.status, query.status) : undefined,
      query.petId ? eq(adoptionApplication.petId, query.petId) : undefined,
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
        .set({ status: 'rejected', reviewedBy: reviewerId, reviewedAt, updatedAt: reviewedAt })
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
      .set({ status: 'rejected', reviewedBy: reviewerId, reviewedAt, updatedAt: reviewedAt })
      .where(eq(adoptionApplication.id, applicationId))
  }
}
