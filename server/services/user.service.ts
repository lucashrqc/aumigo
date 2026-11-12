import type { UserRepository } from '../repositories/user.repository'
import type { UserListQuery } from '#shared/schemas'

/** Postgres foreign-key violation — the row is still referenced elsewhere. */
function isForeignKeyViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === '23503'
}

export class UserService {
  constructor(private readonly users: UserRepository) {}

  list(query: UserListQuery) {
    return this.users.list(query)
  }

  /**
   * Delete a user. Sessions, accounts and adoption applications cascade; audit
   * references (created/updated/reviewed by…) are nulled. Deleting the current
   * admin is blocked, and a lingering foreign key surfaces as a 409.
   */
  async remove(id: string, actorId: string): Promise<void> {
    if (id === actorId) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Você não pode excluir o seu próprio usuário',
      })
    }

    const existing = await this.users.findById(id)
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado' })
    }

    try {
      await this.users.delete(id)
    } catch (err) {
      if (isForeignKeyViolation(err)) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Usuário ainda possui registros vinculados',
        })
      }
      throw err
    }
  }
}
