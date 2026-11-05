import { useAuthStore } from '@/stores/auth'

/** Hydrate the auth store once per request/app load (server + client). */
export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  if (!auth.initialized) {
    await auth.fetchSession()
  }
})
