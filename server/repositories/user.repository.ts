import { and, count, desc, eq, ilike, or } from 'drizzle-orm'
import type { Database } from '../database/client'
import { user } from '../database/schema'
import type { Paginated, UserListQuery } from '#shared/schemas'

export type UserRow = typeof user.$inferSelect

export interface UserRepository {
  list(query: UserListQuery): Promise<Paginated<UserRow>>
  findById(id: string): Promise<UserRow | null>
  delete(id: string): Promise<void>
}

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async list(query: UserListQuery): Promise<Paginated<UserRow>> {
    const conditions = [
      query.search
        ? or(
            ilike(user.name, `%${query.search}%`),
            ilike(user.email, `%${query.search}%`),
          )
        : undefined,
      query.role ? eq(user.role, query.role) : undefined,
    ].filter(Boolean)

    const where = conditions.length ? and(...conditions) : undefined
    const offset = (query.page - 1) * query.pageSize

    const [items, totalRow] = await Promise.all([
      this.db.query.user.findMany({
        where,
        orderBy: desc(user.createdAt),
        limit: query.pageSize,
        offset,
      }),
      this.db.select({ value: count() }).from(user).where(where),
    ])

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total: totalRow[0]?.value ?? 0,
    }
  }

  async findById(id: string) {
    const row = await this.db.query.user.findFirst({ where: eq(user.id, id) })
    return row ?? null
  }

  async delete(id: string) {
    await this.db.delete(user).where(eq(user.id, id))
  }
}
