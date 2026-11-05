import { describe, expect, it } from 'vitest'
import { adoptionApplicationCreateSchema, petCreateSchema } from '../../shared/schemas'

describe('petCreateSchema', () => {
  it('accepts a minimal valid pet and applies defaults', () => {
    const parsed = petCreateSchema.parse({
      name: 'Rex',
      speciesId: '11111111-1111-4111-8111-111111111111',
    })
    expect(parsed.sex).toBe('unknown')
    expect(parsed.status).toBe('available')
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
