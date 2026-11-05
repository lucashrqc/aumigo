import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '../../app/stores/auth'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('treats admin and staff as staff, adopters as not', () => {
    const store = useAuthStore()

    store.setUser({ id: '1', name: 'A', email: 'a@x.com', role: 'adopter' })
    expect(store.isStaff).toBe(false)
    expect(store.isAdmin).toBe(false)
    expect(store.isAuthenticated).toBe(true)

    store.setUser({ id: '2', name: 'S', email: 's@x.com', role: 'staff' })
    expect(store.isStaff).toBe(true)
    expect(store.isAdmin).toBe(false)

    store.setUser({ id: '3', name: 'Ad', email: 'ad@x.com', role: 'admin' })
    expect(store.isStaff).toBe(true)
    expect(store.isAdmin).toBe(true)
  })

  it('is unauthenticated with no user', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.role).toBeNull()
  })
})
