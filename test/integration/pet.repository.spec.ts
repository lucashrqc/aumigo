import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createDatabase } from '../../server/database/client'
import {
  appliedVaccine as appliedVaccineTable,
  pet as petTable,
  species as speciesTable,
  user as userTable,
  vaccine as vaccineTable,
} from '../../server/database/schema'
import { DrizzlePetRepository } from '../../server/repositories/pet.repository'
import { TEST_DATABASE_URL } from '../setup/database'

const db = createDatabase(TEST_DATABASE_URL)
const pets = new DrizzlePetRepository(db)

let staffId: string
let speciesId: string
let vaccineId: string
let vaccineName: string

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
  vaccineName = `Antirrábica-${randomUUID()}`
  const [vac] = await db
    .insert(vaccineTable)
    .values({ name: vaccineName, createdBy: staffId, updatedBy: staffId })
    .returning()
  vaccineId = vac!.id
})

afterAll(async () => {
  await db.delete(appliedVaccineTable)
  await db.delete(petTable)
  await db.delete(vaccineTable)
})

describe('DrizzlePetRepository.create with vaccines', () => {
  it('persists pet and applied vaccines atomically', async () => {
    const created = await pets.create(
      {
        name: 'Bella',
        speciesId,
        sex: 'female',
        neutered: false,
        status: 'pending',
        images: [],
        appliedVaccines: [
          { vaccineId, applicationDate: '2026-01-05', batchNumber: 'B-1' },
        ],
      },
      staffId,
    )

    expect(created.vaccines).toEqual([{ id: vaccineId, name: vaccineName }])

    const rows = await db.query.appliedVaccine.findMany({
      where: eq(appliedVaccineTable.petId, created.id),
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]?.batchNumber).toBe('B-1')
    expect(rows[0]?.createdBy).toBe(staffId)
  })
})
