import { useAuthStore } from '@/stores/auth'

/** Guards private/admin routes: staff or admin only. */
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  if (!auth.initialized) await auth.fetchSession()

  if (!auth.isAuthenticated) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
  if (!auth.isStaff) {
    return navigateTo('/')
  }
})
