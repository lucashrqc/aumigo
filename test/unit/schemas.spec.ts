import { describe, expect, it } from 'vitest'
import {
  adoptionApplicationCreateSchema,
  avatarUpdateSchema,
  petCreateSchema,
  profileUpdateSchema,
} from '../../shared/schemas'

describe('petCreateSchema', () => {
  it('accepts a minimal valid pet and applies defaults', () => {
    const parsed = petCreateSchema.parse({
      name: 'Rex',
      speciesId: '11111111-1111-4111-8111-111111111111',
    })
    expect(parsed.sex).toBe('unknown')
    expect(parsed.status).toBe('pending')
    expect(parsed.neutered).toBe(false)
    expect(parsed.images).toEqual([])
  })

  it('accepts a pet without a name when a coat is given', () => {
    const parsed = petCreateSchema.parse({
      speciesId: '11111111-1111-4111-8111-111111111111',
      coat: 'Caramelo',
    })
    expect(parsed.name).toBeUndefined()
    expect(parsed.coat).toBe('Caramelo')
  })

  it('rejects a pet with neither a name nor a coat', () => {
    const result = petCreateSchema.safeParse({
      speciesId: '11111111-1111-4111-8111-111111111111',
    })
    expect(result.success).toBe(false)
  })
})

describe('adoptionApplicationCreateSchema', () => {
  const uuid = '11111111-1111-4111-8111-111111111111'
  const validPayload = {
    petId: uuid,
    document: '529.982.247-25',
    contactPhone: '11999999999',
    age: 30,
    home: 'house',
    cityId: uuid,
    street: 'Rua das Flores',
    number: '100',
    neighborhood: 'Centro',
    zipCode: '01001-000',
    isRental: false,
    firstPet: true,
    hasFinancialConditions: true,
    acceptedTerms: true,
  }

  it('requires a contact phone', () => {
    const result = adoptionApplicationCreateSchema.safeParse({ petId: uuid })
    expect(result.success).toBe(false)
  })

  it('accepts a full payload with a valid CPF, normalising it to digits', () => {
    const parsed = adoptionApplicationCreateSchema.parse(validPayload)
    expect(parsed.document).toBe('52998224725')
  })

  it('accepts a valid CNPJ, normalising it to digits', () => {
    const parsed = adoptionApplicationCreateSchema.parse({
      ...validPayload,
      document: '11.222.333/0001-81',
    })
    expect(parsed.document).toBe('11222333000181')
  })

  it('accepts a missing document', () => {
    const { document, ...withoutDocument } = validPayload
    void document
    const result = adoptionApplicationCreateSchema.safeParse(withoutDocument)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.document).toBeUndefined()
  })

  it('rejects a document with an invalid checksum', () => {
    const result = adoptionApplicationCreateSchema.safeParse({
      ...validPayload,
      document: '529.982.247-24',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a document of the wrong length', () => {
    const result = adoptionApplicationCreateSchema.safeParse({
      ...validPayload,
      document: '5299822472',
    })
    expect(result.success).toBe(false)
  })
})

describe('profileUpdateSchema', () => {
  it('accepts a name and phone, trimming whitespace', () => {
    const parsed = profileUpdateSchema.parse({ name: '  Ana  ', phone: ' 11999 ' })
    expect(parsed.name).toBe('Ana')
    expect(parsed.phone).toBe('11999')
  })

  it('allows a missing or null phone', () => {
    expect(profileUpdateSchema.parse({ name: 'Ana' }).phone).toBeUndefined()
    expect(profileUpdateSchema.parse({ name: 'Ana', phone: null }).phone).toBeNull()
  })

  it('rejects an empty name', () => {
    expect(profileUpdateSchema.safeParse({ name: '   ' }).success).toBe(false)
  })
})

describe('avatarUpdateSchema', () => {
  it('accepts a valid image URL', () => {
    expect(avatarUpdateSchema.parse({ image: 'https://blob.example/a.jpg' }).image).toBe(
      'https://blob.example/a.jpg',
    )
  })

  it('accepts null to clear the avatar', () => {
    expect(avatarUpdateSchema.parse({ image: null }).image).toBeNull()
  })

  it('rejects a non-URL string', () => {
    expect(avatarUpdateSchema.safeParse({ image: 'not-a-url' }).success).toBe(false)
  })
})
