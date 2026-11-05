/** BetterAuth request handler mounted at /api/auth/**. */
export default defineEventHandler((event) => {
  return useAuth().handler(toWebRequest(event))
})
