import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createDatabase } from '../../server/database/client'
import {
  appliedVaccine as appliedVaccineTable,
  pet as petTable,
  species as speciesTable,
  user as userTable,
  vaccine as vaccineTable,
} from '../../server/database/schema'
import { DrizzleAppliedVaccineRepository } from '../../server/repositories/vaccine.repository'
import { DrizzlePetRepository } from '../../server/repositories/pet.repository'
import { TEST_DATABASE_URL } from '../setup/database'

const db = createDatabase(TEST_DATABASE_URL)
const pets = new DrizzlePetRepository(db)
const applied = new DrizzleAppliedVaccineRepository(db)

let staffId: string
let speciesId: string
let vaccineId: string
let petId: string

beforeAll(async () => {
  staffId = randomUUID()
  await db.insert(userTable).values({
    id: staffId,
    name: 'staff',
    email: `${staffId}@test.local`,
    emailVerified: true,
    role: 'staff',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  const [sp] = await db
    .insert(speciesTable)
    .values({ name: `Species-${randomUUID()}` })
    .returning()
  speciesId = sp!.id
  const [vac] = await db
    .insert(vaccineTable)
    .values({ name: `V8-${randomUUID()}`, createdBy: staffId, updatedBy: staffId })
    .returning()
  vaccineId = vac!.id
  const pet = await pets.create(
    { name: 'Rex', speciesId, sex: 'male', neutered: false, status: 'available', images: [], appliedVaccines: [] },
    staffId,
  )
  petId = pet.id
})

afterAll(async () => {
  await db.delete(appliedVaccineTable)
  await db.delete(petTable)
  await db.delete(vaccineTable)
})

describe('DrizzleAppliedVaccineRepository', () => {
  it('creates, reads, updates and deletes an applied vaccine', async () => {
    const created = await applied.create(
      { petId, vaccineId, applicationDate: '2026-01-10', batchNumber: 'LOT-1' },
      staffId,
    )
    expect(created.batchNumber).toBe('LOT-1')

    const list = await applied.listByPet(petId)
    expect(list.map((r) => r.id)).toContain(created.id)

    const updated = await applied.update(
      created.id,
      { batchNumber: 'LOT-2', nextDoseDate: '2027-01-10' },
      staffId,
    )
    expect(updated?.batchNumber).toBe('LOT-2')
    expect(updated?.nextDoseDate).toBe('2027-01-10')

    const found = await applied.findById(created.id)
    expect(found?.batchNumber).toBe('LOT-2')

    await applied.delete(created.id)
    expect(await applied.findById(created.id)).toBeNull()
  })

  it('returns null when updating a missing record', async () => {
    const result = await applied.update(randomUUID(), { batchNumber: 'x' }, staffId)
    expect(result).toBeNull()
  })
})
