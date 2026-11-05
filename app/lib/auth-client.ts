import { createAuthClient } from 'better-auth/vue'
import { adminClient } from 'better-auth/client/plugins'

/**
 * BetterAuth browser client. baseURL defaults to the current origin (auth is
 * mounted at same-origin /api/auth), so no explicit URL is needed.
 */
export const authClient = createAuthClient({
  plugins: [adminClient()],
})

export type AppRole = 'admin' | 'staff' | 'adopter'
