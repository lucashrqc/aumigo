import { asc, desc, eq } from 'drizzle-orm'
import type { Database } from '../database/client'
import { appliedVaccine, vaccine } from '../database/schema'
import type {
  AppliedVaccineCreateInput,
  VaccineCreateInput,
  VaccineUpdateInput,
} from '#shared/schemas'

export type VaccineRow = typeof vaccine.$inferSelect
export type AppliedVaccineRow = typeof appliedVaccine.$inferSelect

export interface VaccineRepository {
  list(): Promise<VaccineRow[]>
  findById(id: string): Promise<VaccineRow | null>
  create(data: VaccineCreateInput, actorId: string): Promise<VaccineRow>
  update(id: string, data: VaccineUpdateInput, actorId: string): Promise<VaccineRow | null>
}

export class DrizzleVaccineRepository implements VaccineRepository {
  constructor(private readonly db: Database) {}

  list() {
    return this.db.query.vaccine.findMany({ orderBy: asc(vaccine.name) })
  }

  async findById(id: string) {
    const row = await this.db.query.vaccine.findFirst({ where: eq(vaccine.id, id) })
    return row ?? null
  }

  async create(data: VaccineCreateInput, actorId: string) {
    const [row] = await this.db
      .insert(vaccine)
      .values({ ...data, createdBy: actorId, updatedBy: actorId })
      .returning()
    return row!
  }

  async update(id: string, data: VaccineUpdateInput, actorId: string) {
    const [row] = await this.db
      .update(vaccine)
      .set({ ...data, updatedBy: actorId, updatedAt: new Date() })
      .where(eq(vaccine.id, id))
      .returning()
    return row ?? null
  }
}

export interface AppliedVaccineRepository {
  listByPet(petId: string): Promise<AppliedVaccineRow[]>
  create(data: AppliedVaccineCreateInput, actorId: string): Promise<AppliedVaccineRow>
  delete(id: string): Promise<void>
}

export class DrizzleAppliedVaccineRepository implements AppliedVaccineRepository {
  constructor(private readonly db: Database) {}

  listByPet(petId: string) {
    return this.db.query.appliedVaccine.findMany({
      where: eq(appliedVaccine.petId, petId),
      orderBy: desc(appliedVaccine.applicationDate),
    })
  }

  async create(data: AppliedVaccineCreateInput, actorId: string) {
    const [row] = await this.db
      .insert(appliedVaccine)
      .values({ ...data, createdBy: actorId, updatedBy: actorId })
      .returning()
    return row!
  }

  async delete(id: string) {
    await this.db.delete(appliedVaccine).where(eq(appliedVaccine.id, id))
  }
}
