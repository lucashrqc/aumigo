import { z } from 'zod'
import { uuidSchema } from './common'

export const analyticsQuerySchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  speciesId: uuidSchema.optional(),
})
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>
