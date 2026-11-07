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
