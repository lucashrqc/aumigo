import type { H3Event } from 'h3'
import type { Auth } from './auth'

export type AuthSession = NonNullable<Awaited<ReturnType<Auth['api']['getSession']>>>
export type AuthUser = AuthSession['user']

/** Returns the current session, or null when unauthenticated. */
export function getAuthSession(event: H3Event) {
  return useAuth().api.getSession({ headers: event.headers })
}

/** Requires an authenticated user (any role). Throws 401 otherwise. */
export async function requireUser(event: H3Event): Promise<AuthSession> {
  const session = await getAuthSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return session
}

const STAFF_ROLES = new Set(['admin', 'staff'])

/** Requires a staff or admin user. Throws 401/403 otherwise. */
export async function requireStaff(event: H3Event): Promise<AuthSession> {
  const session = await requireUser(event)
  if (!STAFF_ROLES.has(session.user.role ?? '')) {
    throw createError({ statusCode: 403, statusMessage: 'Staff access required' })
  }
  return session
}

/** Requires an admin user. Throws 401/403 otherwise. */
export async function requireAdmin(event: H3Event): Promise<AuthSession> {
  const session = await requireUser(event)
  if (session.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
  return session
}
