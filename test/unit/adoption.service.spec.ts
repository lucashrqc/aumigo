import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdoptionService } from '../../server/services/adoption.service'
import type { AdoptionApplicationRepository } from '../../server/repositories/adoption.repository'
import type { PetRepository } from '../../server/repositories/pet.repository'

function makeApplications(): AdoptionApplicationRepository {
  return {
    list: vi.fn(),
    listByAdopter: vi.fn(),
    findById: vi.fn(),
    findOpenByPetAndAdopter: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'app-1', ...data })),
    approve: vi.fn().mockResolvedValue(undefined),
    reject: vi.fn().mockResolvedValue(undefined),
  }
}

function makePets(status: 'available' | 'pending' | 'adopted' = 'available'): PetRepository {
  return {
    list: vi.fn(),
    findById: vi.fn().mockResolvedValue({ id: 'pet-1', active: true, status }),
    create: vi.fn(),
    update: vi.fn(),
    setStatus: vi.fn(),
    softDelete: vi.fn(),
  } as unknown as PetRepository
}

describe('AdoptionService.apply', () => {
  let apps: AdoptionApplicationRepository

  beforeEach(() => {
    apps = makeApplications()
  })

  it('creates an application for an available pet', async () => {
    const service = new AdoptionService(apps, makePets('available'))
    const result = await service.apply(
      { petId: 'pet-1', contactPhone: '+5511999999999' },
      'user-1',
    )
    expect(apps.create).toHaveBeenCalledOnce()
    expect(result.id).toBe('app-1')
  })

  it('rejects applying for an already-adopted pet', async () => {
    const service = new AdoptionService(apps, makePets('adopted'))
    await expect(service.apply({ petId: 'pet-1', contactPhone: '123456' }, 'user-1')).rejects.toThrow(
      /already been adopted/,
    )
    expect(apps.create).not.toHaveBeenCalled()
  })

  it('rejects a duplicate open application', async () => {
    apps.findOpenByPetAndAdopter = vi.fn().mockResolvedValue({ id: 'existing' })
    const service = new AdoptionService(apps, makePets('available'))
    await expect(service.apply({ petId: 'pet-1', contactPhone: '123456' }, 'user-1')).rejects.toThrow(
      /open application/,
    )
  })
})

describe('AdoptionService.review', () => {
  it('approves a pending application and adopts the pet', async () => {
    const apps = makeApplications()
    apps.findById = vi
      .fn()
      .mockResolvedValueOnce({ id: 'app-1', petId: 'pet-1', status: 'pending', pet: { status: 'available' } })
      .mockResolvedValueOnce({ id: 'app-1', status: 'approved' })
    const service = new AdoptionService(apps, makePets('available'))

    const result = await service.review('app-1', { decision: 'approved' }, 'staff-1')
    expect(apps.approve).toHaveBeenCalledWith('app-1', 'pet-1', 'staff-1')
    expect(result.status).toBe('approved')
  })

  it('rejects reviewing an already-reviewed application', async () => {
    const apps = makeApplications()
    apps.findById = vi.fn().mockResolvedValue({ id: 'app-1', petId: 'pet-1', status: 'approved' })
    const service = new AdoptionService(apps, makePets('available'))

    await expect(
      service.review('app-1', { decision: 'rejected' }, 'staff-1'),
    ).rejects.toThrow(/already reviewed/)
  })
})
