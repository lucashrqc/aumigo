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

  it('rejects a pet without a name', () => {
    const result = petCreateSchema.safeParse({
      speciesId: '11111111-1111-4111-8111-111111111111',
    })
    expect(result.success).toBe(false)
  })
})

describe('adoptionApplicationCreateSchema', () => {
  it('requires a contact phone', () => {
    const result = adoptionApplicationCreateSchema.safeParse({
      petId: '11111111-1111-4111-8111-111111111111',
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
