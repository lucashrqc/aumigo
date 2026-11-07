import { describe, expect, it, vi } from 'vitest'
import { ProfileService } from '../../server/services/profile.service'
import type { StaffProfileRepository } from '../../server/repositories/staff.repository'
import type { IdentityProvider } from '../../server/services/identity'

function makeProfiles(existing = true): StaffProfileRepository {
  const row = { id: 'sp-1', userId: 'user-1', name: 'Old', phone: null }
  return {
    findByUserId: vi.fn().mockResolvedValue(existing ? row : null),
    create: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'sp-1', ...data })),
    update: vi
      .fn()
      .mockImplementation((userId, data) =>
        Promise.resolve(existing ? { id: 'sp-1', userId, name: 'Old', phone: null, ...data } : null),
      ),
  } as unknown as StaffProfileRepository
}

function makeIdentity(): IdentityProvider {
  return {
    createUser: vi.fn(),
    setRole: vi.fn(),
    updateName: vi.fn().mockResolvedValue(undefined),
  }
}

describe('ProfileService.getProfile', () => {
  it('maps the staff profile to a DTO', async () => {
    const service = new ProfileService(makeProfiles(), makeIdentity())
    const dto = await service.getProfile('user-1')
    expect(dto).toEqual({ id: 'sp-1', name: 'Old', phone: null })
  })

  it('throws 404 when the profile is missing', async () => {
    const service = new ProfileService(makeProfiles(false), makeIdentity())
    await expect(service.getProfile('user-1')).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('ProfileService.updateProfile', () => {
  it('syncs the name to the auth user AND the staff profile', async () => {
    const profiles = makeProfiles()
    const identity = makeIdentity()
    const service = new ProfileService(profiles, identity)

    const dto = await service.updateProfile('user-1', { name: 'Ana', phone: '11999' })

    expect(identity.updateName).toHaveBeenCalledWith('user-1', 'Ana')
    expect(profiles.update).toHaveBeenCalledWith('user-1', { name: 'Ana', phone: '11999' })
    expect(dto).toEqual({ id: 'sp-1', name: 'Ana', phone: '11999' })
  })

  it('normalizes a missing phone to null', async () => {
    const profiles = makeProfiles()
    const service = new ProfileService(profiles, makeIdentity())

    await service.updateProfile('user-1', { name: 'Ana' })

    expect(profiles.update).toHaveBeenCalledWith('user-1', { name: 'Ana', phone: null })
  })

  it('creates the profile when none exists yet', async () => {
    const profiles = makeProfiles(false)
    const service = new ProfileService(profiles, makeIdentity())

    const dto = await service.updateProfile('user-1', { name: 'Ana', phone: '11999' })

    expect(profiles.create).toHaveBeenCalledWith({ userId: 'user-1', name: 'Ana', phone: '11999' })
    expect(dto).toEqual({ id: 'sp-1', name: 'Ana', phone: '11999' })
  })
})
