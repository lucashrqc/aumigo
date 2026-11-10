import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  adoptionApplication,
  city as cityTable,
  pet as petTable,
  species as speciesTable,
  state as stateTable,
  user as userTable,
} from '../../server/database/schema'
import { DrizzlePetRepository } from '../../server/repositories/pet.repository'
import { startApplicationsEndpoint, type ApplicationsEndpoint } from './helpers/endpoint'

let endpoint: ApplicationsEndpoint
let pets: DrizzlePetRepository

let adopterId: string
let speciesId: string
let cityId: string

const VALID_CPF = '529.982.247-25'
const VALID_CNPJ = '11.222.333/0001-81'

async function makeUser(role: 'admin' | 'staff' | 'adopter') {
  const id = randomUUID()
  await endpoint.db.insert(userTable).values({
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

async function makeAvailablePet() {
  const pet = await pets.create(
    { name: 'Rex', speciesId, sex: 'male', neutered: false, status: 'available', images: [] },
    adopterId,
  )
  return pet.id
}

function validBody(petId: string, overrides: Record<string, unknown> = {}) {
  return {
    petId,
    document: VALID_CPF,
    contactPhone: '+55 11 99999-9999',
    age: 30,
    home: 'house',
    cityId,
    street: 'Rua das Flores',
    number: '100',
    neighborhood: 'Centro',
    zipCode: '01001-000',
    isRental: false,
    firstPet: true,
    hasFinancialConditions: true,
    acceptedTerms: true,
    ...overrides,
  }
}

beforeAll(async () => {
  endpoint = await startApplicationsEndpoint()
  pets = new DrizzlePetRepository(endpoint.db)

  adopterId = await makeUser('adopter')
  const [sp] = await endpoint.db
    .insert(speciesTable)
    .values({ name: `species-${randomUUID().slice(0, 8)}` })
    .returning()
  speciesId = sp!.id
  const [st] = await endpoint.db
    .insert(stateTable)
    .values({ ibgeId: 33, name: 'Rio de Janeiro', uf: 'RJ' })
    .returning()
  const [ct] = await endpoint.db
    .insert(cityTable)
    .values({ stateId: st!.id, name: 'Rio de Janeiro', ibgeId: 3304557 })
    .returning()
  cityId = ct!.id
})

afterAll(async () => {
  await endpoint.db.delete(adoptionApplication)
  await endpoint.db.delete(petTable)
  await endpoint.close()
})

describe('POST /api/applications — happy path', () => {
  it('accepts a valid CPF, persisting it as digits', async () => {
    const petId = await makeAvailablePet()
    const res = await endpoint.post(validBody(petId), adopterId)

    expect(res.status).toBe(200)
    expect((res.json as { document: string }).document).toBe('52998224725')

    const row = await endpoint.db.query.adoptionApplication.findFirst({
      where: eq(adoptionApplication.petId, petId),
    })
    expect(row?.document).toBe('52998224725')
  })

  it('accepts a valid CNPJ, persisting it as digits', async () => {
    const petId = await makeAvailablePet()
    const res = await endpoint.post(validBody(petId, { document: VALID_CNPJ }), adopterId)

    expect(res.status).toBe(200)
    expect((res.json as { document: string }).document).toBe('11222333000181')
  })
})

describe('POST /api/applications — document validation', () => {
  const cases: Record<string, unknown> = {
    'a missing document': undefined,
    'an invalid CPF checksum': '529.982.247-24',
    'an invalid CNPJ checksum': '11.222.333/0001-80',
    'a wrong-length value': '5299822472',
    'a blank value': '   ',
  }

  for (const [label, value] of Object.entries(cases)) {
    it(`rejects ${label} with a 422 document field error`, async () => {
      const petId = await makeAvailablePet()
      const body = validBody(petId)
      if (value === undefined) delete (body as Record<string, unknown>).document
      else body.document = value as string

      const res = await endpoint.post(body, adopterId)
      expect(res.status).toBe(422)
      const data = (res.json as { data: { fieldErrors: Record<string, string[]> } }).data
      expect(data.fieldErrors.document).toBeTruthy()
    })
  }
})

describe('POST /api/applications — required fields mirror the form', () => {
  const requiredKeys = [
    'contactPhone',
    'age',
    'home',
    'cityId',
    'street',
    'number',
    'neighborhood',
    'zipCode',
    'isRental',
    'firstPet',
    'hasFinancialConditions',
  ]

  for (const key of requiredKeys) {
    it(`rejects a missing ${key} with 422`, async () => {
      const petId = await makeAvailablePet()
      const { [key]: _omitted, ...body } = validBody(petId) as Record<string, unknown>
      void _omitted

      const res = await endpoint.post(body, adopterId)
      expect(res.status).toBe(422)
      const data = (res.json as { data: { fieldErrors: Record<string, string[]> } }).data
      expect(data.fieldErrors[key]).toBeTruthy()
    })
  }

  it('rejects an age under 18 with 422', async () => {
    const petId = await makeAvailablePet()
    const res = await endpoint.post(validBody(petId, { age: 16 }), adopterId)
    expect(res.status).toBe(422)
  })

  it('rejects acceptedTerms that is not true with 422', async () => {
    const petId = await makeAvailablePet()
    const res = await endpoint.post(validBody(petId, { acceptedTerms: false }), adopterId)
    expect(res.status).toBe(422)
    const data = (res.json as { data: { fieldErrors: Record<string, string[]> } }).data
    expect(data.fieldErrors.acceptedTerms).toBeTruthy()
  })

  it('requires allowPets when the home is rented', async () => {
    const petId = await makeAvailablePet()
    const res = await endpoint.post(validBody(petId, { isRental: true }), adopterId)
    expect(res.status).toBe(422)
    const data = (res.json as { data: { fieldErrors: Record<string, string[]> } }).data
    expect(data.fieldErrors.allowPets).toBeTruthy()
  })
})

describe('POST /api/applications — auth and business rules', () => {
  it('rejects an unauthenticated request with 401', async () => {
    const petId = await makeAvailablePet()
    const res = await endpoint.post(validBody(petId))
    expect(res.status).toBe(401)
  })

  it('returns 404 for an unknown pet', async () => {
    const res = await endpoint.post(validBody(randomUUID()), adopterId)
    expect(res.status).toBe(404)
  })

  it('returns 409 for an already-adopted pet', async () => {
    const pet = await pets.create(
      { name: 'Bella', speciesId, sex: 'female', neutered: false, status: 'adopted', images: [] },
      adopterId,
    )
    const res = await endpoint.post(validBody(pet.id), adopterId)
    expect(res.status).toBe(409)
  })

  it('returns 409 for a duplicate open application', async () => {
    const petId = await makeAvailablePet()
    const first = await endpoint.post(validBody(petId), adopterId)
    expect(first.status).toBe(200)
    const second = await endpoint.post(validBody(petId), adopterId)
    expect(second.status).toBe(409)
  })
})
