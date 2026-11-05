import { useAuthStore } from '@/stores/auth'

/** Guards routes that require any authenticated user (e.g. adopters). */
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  if (!auth.initialized) await auth.fetchSession()

  if (!auth.isAuthenticated) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
