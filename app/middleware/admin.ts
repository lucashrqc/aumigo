import { useAuthStore } from '@/stores/auth'

/** Guards admin-only routes (e.g. staff management). */
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  if (!auth.initialized) await auth.fetchSession()

  if (!auth.isAuthenticated) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
  if (!auth.isAdmin) {
    return navigateTo('/admin')
  }
})
