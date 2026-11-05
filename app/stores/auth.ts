import { defineStore } from 'pinia'
import type { AppRole } from '@/lib/auth-client'

interface SessionUser {
  id: string
  name: string
  email: string
  role: AppRole
  image?: string | null
}

/**
 * App-wide authentication state. BetterAuth owns the session; this store is the
 * single place the UI reads the current user, role, and derived permissions.
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as SessionUser | null,
    initialized: false,
  }),
  getters: {
    isAuthenticated: (state) => state.user !== null,
    role: (state) => state.user?.role ?? null,
    isStaff: (state) => state.user?.role === 'staff' || state.user?.role === 'admin',
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    /** Load the session from the server, forwarding cookies during SSR. */
    async fetchSession() {
      const requestFetch = useRequestFetch()
      try {
        const data = await requestFetch<{ user: SessionUser | null } | null>(
          '/api/auth/get-session',
        )
        this.user = data?.user ?? null
      } catch {
        this.user = null
      } finally {
        this.initialized = true
      }
    },
    setUser(user: SessionUser | null) {
      this.user = user
    },
  },
})
