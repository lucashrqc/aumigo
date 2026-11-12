import { z } from 'zod'
import { paginationSchema } from './common'

export const userRoleValues = ['admin', 'staff', 'adopter'] as const

/** Admin user listing — paginated, searchable by name/email. */
export const userListQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(120).optional(),
  role: z.enum(userRoleValues).optional(),
})
export type UserListQuery = z.infer<typeof userListQuerySchema>
