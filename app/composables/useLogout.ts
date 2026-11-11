import { useQueryClient } from '@tanstack/vue-query'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/stores/auth'

/**
 * Sign out, reset the auth store, and drop all cached queries so no previous
 * user's data (e.g. their applications) lingers after logout.
 */
export function useLogout() {
  const auth = useAuthStore()
  const qc = useQueryClient()
  return async (redirectTo = '/') => {
    await authClient.signOut()
    auth.setUser(null)
    qc.clear()
    await navigateTo(redirectTo)
  }
}
