import { and, asc, count, desc, eq, gte, ilike, lt, sql } from 'drizzle-orm'
import type { Database } from '../database/client'
import { appliedVaccine, pet, petImage } from '../database/schema'
import type {
  Paginated,
  PetCreateInput,
  PetListQuery,
  PetUpdateInput,
} from '#shared/schemas'
import type { PetStatsDto } from '#shared/types'

export type PetRow = typeof pet.$inferSelect
export type PetImageRow = typeof petImage.$inferSelect

export interface PetWithRelations extends PetRow {
  species: { id: string; name: string } | null
  breed: { id: string; name: string } | null
  creator?: { id: string; name: string } | null
  updater?: { id: string; name: string } | null
  images: PetImageRow[]
  vaccines?: { id: string; name: string }[]
}

/** Options for pet queries. `withCreator` joins the staff author/editor (admin only). */
export interface PetListOptions {
  withCreator?: boolean
}

export interface PetRepository {
  list(
    query: PetListQuery,
    options?: PetListOptions,
  ): Promise<Paginated<PetWithRelations>>
  stats(): Promise<PetStatsDto>
  findById(id: string): Promise<PetWithRelations | null>
  create(data: PetCreateInput, actorId: string): Promise<PetWithRelations>
  update(
    id: string,
    data: PetUpdateInput,
    actorId: string,
  ): Promise<PetWithRelations | null>
  setStatus(
    id: string,
    status: PetRow['status'],
    actorId: string,
  ): Promise<void>
  /** Publish a pet: status 'available' + published audit stamp. */
  publish(id: string, actorId: string): Promise<void>
  /** Unpublish a pet: status 'pending' + unpublished audit stamp. */
  unpublish(id: string, actorId: string): Promise<void>
  softDelete(id: string, actorId: string): Promise<void>
}

/** Collapse a pet's applied-vaccine rows into the distinct vaccines received. */
export function distinctVaccines(
  applied: { vaccine: { id: string; name: string } | null }[],
): { id: string; name: string }[] {
  const seen = new Set<string>()
  const result: { id: string; name: string }[] = []
  for (const { vaccine } of applied) {
    if (!vaccine || seen.has(vaccine.id)) continue
    seen.add(vaccine.id)
    result.push(vaccine)
  }
  return result
}

/** Serialize domain input into Drizzle column values. */
function toColumns(data: Partial<PetCreateInput>) {
  const { images: _images, appliedVaccines: _appliedVaccines, weight, ...rest } =
    data
  return {
    ...rest,
    ...(weight !== undefined
      ? { weight: weight === null ? null : String(weight) }
      : {}),
  }
}

export class DrizzlePetRepository implements PetRepository {
  constructor(private readonly db: Database) {}

  async list(
    query: PetListQuery,
    options: PetListOptions = {},
  ): Promise<Paginated<PetWithRelations>> {
    const conditions = [
      eq(pet.active, true),
      query.status ? eq(pet.status, query.status) : undefined,
      query.speciesId ? eq(pet.speciesId, query.speciesId) : undefined,
      query.search ? ilike(pet.name, `%${query.search}%`) : undefined,
      query.from ? gte(pet.createdAt, new Date(query.from)) : undefined,
      query.to
        ? lt(pet.createdAt, new Date(new Date(query.to).getTime() + 86_400_000))
        : undefined,
    ].filter(Boolean)

    const where = conditions.length ? and(...conditions) : undefined
    const offset = (query.page - 1) * query.pageSize

    const [items, totalRow] = await Promise.all([
      this.db.query.pet.findMany({
        where,
        with: {
          species: { columns: { id: true, name: true } },
          breed: { columns: { id: true, name: true } },
          images: { orderBy: asc(petImage.position) },
          ...(options.withCreator
            ? {
                creator: { columns: { id: true, name: true } },
                updater: { columns: { id: true, name: true } },
              }
            : {}),
        },
        orderBy: desc(pet.createdAt),
        limit: query.pageSize,
        offset,
      }),
      this.db.select({ value: count() }).from(pet).where(where),
    ])

    return {
      items: items as PetWithRelations[],
      page: query.page,
      pageSize: query.pageSize,
      total: totalRow[0]?.value ?? 0,
    }
  }

  async stats(): Promise<PetStatsDto> {
    const [row] = await this.db
      .select({
        available: count(sql`CASE WHEN ${pet.status} = 'available' THEN 1 END`),
        adopted: count(sql`CASE WHEN ${pet.status} = 'adopted' THEN 1 END`),
        neutered: count(sql`CASE WHEN ${pet.neutered} THEN 1 END`),
      })
      .from(pet)
      .where(eq(pet.active, true))

    return {
      available: row?.available ?? 0,
      adopted: row?.adopted ?? 0,
      neutered: row?.neutered ?? 0,
    }
  }

  async findById(id: string): Promise<PetWithRelations | null> {
    const row = await this.db.query.pet.findFirst({
      where: eq(pet.id, id),
      with: {
        species: { columns: { id: true, name: true } },
        breed: { columns: { id: true, name: true } },
        images: { orderBy: asc(petImage.position) },
        appliedVaccines: {
          orderBy: desc(appliedVaccine.applicationDate),
          with: { vaccine: { columns: { id: true, name: true } } },
        },
      },
    })
    if (!row) return null

    const { appliedVaccines, ...rest } = row
    return { ...rest, vaccines: distinctVaccines(appliedVaccines) }
  }

  async create(
    data: PetCreateInput,
    actorId: string,
  ): Promise<PetWithRelations> {
    const id = await this.db.transaction(async (tx) => {
      const [created] = await tx
        .insert(pet)
        .values({
          ...toColumns(data),
          name: data.name,
          speciesId: data.speciesId,
          createdBy: actorId,
          updatedBy: actorId,
        })
        .returning({ id: pet.id })

      const newId = created!.id
      if (data.images.length) {
        await tx.insert(petImage).values(
          data.images.map((img) => ({
            petId: newId,
            url: img.url,
            position: img.position,
          })),
        )
      }
      if (data.appliedVaccines.length) {
        await tx.insert(appliedVaccine).values(
          data.appliedVaccines.map((v) => ({
            ...v,
            petId: newId,
            createdBy: actorId,
            updatedBy: actorId,
          })),
        )
      }
      return newId
    })

    return (await this.findById(id))!
  }

  async update(
    id: string,
    data: PetUpdateInput,
    actorId: string,
  ): Promise<PetWithRelations | null> {
    await this.db.transaction(async (tx) => {
      await tx
        .update(pet)
        .set({ ...toColumns(data), updatedBy: actorId, updatedAt: new Date() })
        .where(eq(pet.id, id))

      if (data.images !== undefined) {
        await tx.delete(petImage).where(eq(petImage.petId, id))
        if (data.images.length) {
          await tx.insert(petImage).values(
            data.images.map((img) => ({
              petId: id,
              url: img.url,
              position: img.position,
            })),
          )
        }
      }
    })
    return this.findById(id)
  }

  async setStatus(
    id: string,
    status: PetRow['status'],
    actorId: string,
  ): Promise<void> {
    await this.db
      .update(pet)
      .set({ status, updatedBy: actorId, updatedAt: new Date() })
      .where(eq(pet.id, id))
  }

  async publish(id: string, actorId: string): Promise<void> {
    const now = new Date()
    await this.db
      .update(pet)
      .set({
        status: 'available',
        publishedAt: now,
        publishedBy: actorId,
        updatedBy: actorId,
        updatedAt: now,
      })
      .where(eq(pet.id, id))
  }

  async unpublish(id: string, actorId: string): Promise<void> {
    const now = new Date()
    await this.db
      .update(pet)
      .set({
        status: 'pending',
        unpublishedAt: now,
        unpublishedBy: actorId,
        updatedBy: actorId,
        updatedAt: now,
      })
      .where(eq(pet.id, id))
  }

  async softDelete(id: string, actorId: string): Promise<void> {
    await this.db
      .update(pet)
      .set({ active: false, updatedBy: actorId, updatedAt: new Date() })
      .where(eq(pet.id, id))
  }
}
