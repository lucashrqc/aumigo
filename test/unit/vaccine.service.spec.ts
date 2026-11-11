import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VaccineService } from '../../server/services/vaccine.service'
import type {
  AppliedVaccineRepository,
  VaccineRepository,
} from '../../server/repositories/vaccine.repository'

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

function makeApplied(): AppliedVaccineRepository {
  return {
    listByPet: vi.fn(),
    findById: vi.fn().mockResolvedValue({ id: 'app-1', petId: 'pet-1' }),
    create: vi.fn(),
    update: vi
      .fn()
      .mockImplementation((id, data) => Promise.resolve({ id, ...data })),
    delete: vi.fn().mockResolvedValue(undefined),
  } as unknown as AppliedVaccineRepository
}

describe('VaccineService.updateApplied', () => {
  let applied: AppliedVaccineRepository

  beforeEach(() => {
    applied = makeApplied()
  })

  it('updates an applied vaccine, stamping the actor', async () => {
    const service = new VaccineService(makeVaccines(), applied)
    const result = await service.updateApplied(
      'app-1',
      { batchNumber: 'LOT-9' },
      'staff-1',
    )
    expect(applied.update).toHaveBeenCalledWith(
      'app-1',
      { batchNumber: 'LOT-9' },
      'staff-1',
    )
    expect(result).toMatchObject({ id: 'app-1', batchNumber: 'LOT-9' })
  })

  it('validates the vaccine when vaccineId changes', async () => {
    const vaccines = makeVaccines(false)
    const service = new VaccineService(vaccines, applied)
    await expect(
      service.updateApplied('app-1', { vaccineId: 'missing' }, 'staff-1'),
    ).rejects.toMatchObject({ statusCode: 422 })
    expect(applied.update).not.toHaveBeenCalled()
  })

  it('404s when the applied record does not exist', async () => {
    applied.update = vi.fn().mockResolvedValue(null)
    const service = new VaccineService(makeVaccines(), applied)
    await expect(
      service.updateApplied('missing', { batchNumber: 'x' }, 'staff-1'),
    ).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('VaccineService.removeApplied', () => {
  it('deletes an existing applied vaccine', async () => {
    const applied = makeApplied()
    const service = new VaccineService(makeVaccines(), applied)
    await service.removeApplied('app-1')
    expect(applied.delete).toHaveBeenCalledWith('app-1')
  })

  it('404s when the applied record does not exist', async () => {
    const applied = makeApplied()
    applied.findById = vi.fn().mockResolvedValue(null)
    const service = new VaccineService(makeVaccines(), applied)
    await expect(service.removeApplied('missing')).rejects.toMatchObject({
      statusCode: 404,
    })
    expect(applied.delete).not.toHaveBeenCalled()
  })
})
