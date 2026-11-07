import { z } from 'zod'
import { paginationSchema, uuidSchema } from './common'

export const stateListQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional(),
})
export type StateListQuery = z.infer<typeof stateListQuerySchema>

export const cityListQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional(),
  stateId: uuidSchema,
})
export type CityListQuery = z.infer<typeof cityListQuerySchema>

export const ibgeResolveQuerySchema = z.object({
  stateIbgeId: z.coerce.number().int().positive(),
  cityIbgeId: z.coerce.number().int().positive().optional(),
})
export type IbgeResolveQuery = z.infer<typeof ibgeResolveQuerySchema>
