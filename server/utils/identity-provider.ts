import { resolveAuthErrorMessage } from '#shared/utils/auth-error-messages'
import { APIError } from 'better-auth/api'
import { eq } from 'drizzle-orm'
import { user } from '../database/schema'
import type { IdentityProvider } from '../services/identity'

/** BetterAuth-backed implementation of the IdentityProvider port. */
export class BetterAuthIdentityProvider implements IdentityProvider {
  async createUser(input: { email: string; password: string; name: string }) {
    try {
      const result = await useAuth().api.signUpEmail({
        body: { email: input.email, password: input.password, name: input.name },
      })
      return { id: result.user.id }
    } catch (err) {
      if (err instanceof APIError) {
        throw createError({
          statusCode: err.statusCode,
          statusMessage: resolveAuthErrorMessage(
            { code: err.body?.code, message: err.message },
            'Não foi possível criar o usuário',
          ),
        })
      }
      throw err
    }
  }

  async setRole(userId: string, role: 'admin' | 'staff' | 'adopter') {
    await useDb().update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, userId))
  }

  async updateName(userId: string, name: string) {
    await useDb().update(user).set({ name, updatedAt: new Date() }).where(eq(user.id, userId))
  }

  async updateImage(userId: string, image: string | null) {
    await useDb().update(user).set({ image, updatedAt: new Date() }).where(eq(user.id, userId))
  }
}
