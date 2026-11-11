import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PetService } from '../../server/services/pet.service'
import type { PetRepository } from '../../server/repositories/pet.repository'
import type { VaccineRepository } from '../../server/repositories/vaccine.repository'
import type { AdoptionApplicationRepository } from '../../server/repositories/adoption.repository'
import type { ImageStorage } from '../../server/storage/image-storage'
import type { PetCreateInput } from '#shared/schemas'

function makePets(): PetRepository {
  return {
    list: vi.fn(),
    stats: vi.fn(),
    findById: vi.fn(),
    create: vi
      .fn()
      .mockImplementation((data) => Promise.resolve({ id: 'pet-1', ...data })),
    update: vi.fn(),
    setStatus: vi.fn(),
    publish: vi.fn(),
    unpublish: vi.fn(),
    softDelete: vi.fn(),
  } as unknown as PetRepository
}

const images: ImageStorage = {
  resolveUrl: vi.fn().mockImplementation(({ url }) => Promise.resolve(url)),
} as unknown as ImageStorage

const applications = {} as AdoptionApplicationRepository

function makeVaccines(exists = true): VaccineRepository {
  return {
    list: vi.fn(),
    findById: vi
      .fn()
      .mockResolvedValue(exists ? { id: 'vac-1', name: 'V8' } : null),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  } as unknown as VaccineRepository
}

function petInput(overrides: Partial<PetCreateInput> = {}): PetCreateInput {
  return {
    name: 'Rex',
    speciesId: 'sp-1',
    sex: 'male',
    neutered: false,
    status: 'pending',
    images: [],
    appliedVaccines: [],
    ...overrides,
  } as PetCreateInput
}

describe('PetService.create with vaccines', () => {
  let pets: PetRepository

  beforeEach(() => {
    pets = makePets()
  })

  it('validates each vaccine and forwards them to the repository', async () => {
    const vaccines = makeVaccines()
    const service = new PetService(pets, images, applications, vaccines)
    const input = petInput({
      appliedVaccines: [
        { vaccineId: 'vac-1', applicationDate: '2026-01-10' },
      ],
    })

    await service.create(input, 'staff-1')

    expect(vaccines.findById).toHaveBeenCalledWith('vac-1')
    expect(pets.create).toHaveBeenCalledWith(
      expect.objectContaining({
        appliedVaccines: [
          expect.objectContaining({ vaccineId: 'vac-1' }),
        ],
      }),
      'staff-1',
    )
  })

  it('rejects an unknown vaccine before touching the repository', async () => {
    const vaccines = makeVaccines(false)
    const service = new PetService(pets, images, applications, vaccines)
    const input = petInput({
      appliedVaccines: [
        { vaccineId: 'missing', applicationDate: '2026-01-10' },
      ],
    })

    await expect(service.create(input, 'staff-1')).rejects.toMatchObject({
      statusCode: 422,
    })
    expect(pets.create).not.toHaveBeenCalled()
  })

  it('creates a pet without vaccines', async () => {
    const vaccines = makeVaccines()
    const service = new PetService(pets, images, applications, vaccines)

    await service.create(petInput(), 'staff-1')

    expect(vaccines.findById).not.toHaveBeenCalled()
    expect(pets.create).toHaveBeenCalledOnce()
  })
})
