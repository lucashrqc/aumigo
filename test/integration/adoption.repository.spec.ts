import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createDatabase } from '../../server/database/client'
import {
  adoptionApplication,
  pet as petTable,
  species as speciesTable,
  user as userTable,
} from '../../server/database/schema'
import { DrizzleAdoptionApplicationRepository } from '../../server/repositories/adoption.repository'
import { DrizzlePetRepository } from '../../server/repositories/pet.repository'
import { TEST_DATABASE_URL } from '../setup/database'

const db = createDatabase(TEST_DATABASE_URL)
const pets = new DrizzlePetRepository(db)
const applications = new DrizzleAdoptionApplicationRepository(db)

let staffId: string
let speciesId: string

async function makeUser(role: 'admin' | 'staff' | 'adopter') {
  const id = randomUUID()
  await db.insert(userTable).values({
    id,
    name: `user-${id.slice(0, 6)}`,
    email: `${id}@test.local`,
    emailVerified: true,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return id
}

beforeAll(async () => {
  staffId = await makeUser('staff')
  const [sp] = await db.insert(speciesTable).values({ name: 'Dog' }).returning()
  speciesId = sp!.id
})

afterAll(async () => {
  await db.delete(adoptionApplication)
  await db.delete(petTable)
})

describe('DrizzlePetRepository', () => {
  it('creates a pet with images and reads it back', async () => {
    const created = await pets.create(
      {
        name: 'Rex',
        speciesId,
        breedId: null,
        sex: 'male',
        neutered: true,
        status: 'available',
        images: [{ url: 'https://example.com/rex.jpg', position: 0 }],
      },
      staffId,
    )

    expect(created.name).toBe('Rex')
    expect(created.images).toHaveLength(1)
    expect(created.species?.name).toBe('Dog')

    const found = await pets.findById(created.id)
    expect(found?.id).toBe(created.id)
  })
})

describe('DrizzleAdoptionApplicationRepository.approve', () => {
  it('approves one application, adopts the pet, and rejects competitors', async () => {
    const pet = await pets.create(
      { name: 'Bella', speciesId, sex: 'female', neutered: false, status: 'available', images: [] },
      staffId,
    )
    const adopterA = await makeUser('adopter')
    const adopterB = await makeUser('adopter')

    const appA = await applications.create({
      petId: pet.id,
      adopterUserId: adopterA,
      contactPhone: '111',
    })
    await applications.create({ petId: pet.id, adopterUserId: adopterB, contactPhone: '222' })

    await applications.approve(appA.id, pet.id, staffId)

    const petRow = await db.query.pet.findFirst({ where: eq(petTable.id, pet.id) })
    expect(petRow?.status).toBe('adopted')

    const all = await db.query.adoptionApplication.findMany({
      where: eq(adoptionApplication.petId, pet.id),
    })
    expect(all.find((a) => a.id === appA.id)?.status).toBe('approved')
    expect(all.filter((a) => a.id !== appA.id).every((a) => a.status === 'rejected')).toBe(true)
  })

  it('blocks a duplicate open application via the partial unique index', async () => {
    const pet = await pets.create(
      { name: 'Max', speciesId, sex: 'male', neutered: false, status: 'available', images: [] },
      staffId,
    )
    const adopter = await makeUser('adopter')

    await applications.create({ petId: pet.id, adopterUserId: adopter, contactPhone: '111' })
    await expect(
      applications.create({ petId: pet.id, adopterUserId: adopter, contactPhone: '222' }),
    ).rejects.toThrow()
  })
})
