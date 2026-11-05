import { and, asc, count, desc, eq, ilike } from 'drizzle-orm'
import type { Database } from '../database/client'
import { pet, petImage } from '../database/schema'
import type { Paginated, PetCreateInput, PetListQuery, PetUpdateInput } from '#shared/schemas'

export type PetRow = typeof pet.$inferSelect
export type PetImageRow = typeof petImage.$inferSelect

export interface PetWithRelations extends PetRow {
  species: { id: string; name: string } | null
  breed: { id: string; name: string } | null
  images: PetImageRow[]
}

export interface PetRepository {
  list(query: PetListQuery): Promise<Paginated<PetWithRelations>>
  findById(id: string): Promise<PetWithRelations | null>
  create(data: PetCreateInput, actorId: string): Promise<PetWithRelations>
  update(id: string, data: PetUpdateInput, actorId: string): Promise<PetWithRelations | null>
  setStatus(id: string, status: PetRow['status'], actorId: string): Promise<void>
  softDelete(id: string, actorId: string): Promise<void>
}

/** Serialize domain input into Drizzle column values. */
function toColumns(data: Partial<PetCreateInput>) {
  const { images: _images, weight, ...rest } = data
  return {
    ...rest,
    ...(weight !== undefined ? { weight: weight === null ? null : String(weight) } : {}),
  }
}

export class DrizzlePetRepository implements PetRepository {
  constructor(private readonly db: Database) {}

  async list(query: PetListQuery): Promise<Paginated<PetWithRelations>> {
    const conditions = [
      query.status ? eq(pet.status, query.status) : eq(pet.active, true),
      query.speciesId ? eq(pet.speciesId, query.speciesId) : undefined,
      query.search ? ilike(pet.name, `%${query.search}%`) : undefined,
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

  async findById(id: string): Promise<PetWithRelations | null> {
    const row = await this.db.query.pet.findFirst({
      where: eq(pet.id, id),
      with: {
        species: { columns: { id: true, name: true } },
        breed: { columns: { id: true, name: true } },
        images: { orderBy: asc(petImage.position) },
      },
    })
    return (row as PetWithRelations) ?? null
  }

  async create(data: PetCreateInput, actorId: string): Promise<PetWithRelations> {
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
            data.images.map((img) => ({ petId: id, url: img.url, position: img.position })),
          )
        }
      }
    })
    return this.findById(id)
  }

  async setStatus(id: string, status: PetRow['status'], actorId: string): Promise<void> {
    await this.db
      .update(pet)
      .set({ status, updatedBy: actorId, updatedAt: new Date() })
      .where(eq(pet.id, id))
  }

  async softDelete(id: string, actorId: string): Promise<void> {
    await this.db
      .update(pet)
      .set({ active: false, updatedBy: actorId, updatedAt: new Date() })
      .where(eq(pet.id, id))
  }
}
