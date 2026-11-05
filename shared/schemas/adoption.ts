import { z } from 'zod'
import { paginationSchema, uuidSchema } from './common'

export const applicationStatusValues = ['pending', 'approved', 'rejected'] as const

/** Adopter-submitted application (from the public site). */
export const adoptionApplicationCreateSchema = z.object({
  petId: uuidSchema,
  contactPhone: z.string().trim().min(5).max(30),
  message: z.string().trim().max(1000).optional(),
})
export type AdoptionApplicationCreateInput = z.infer<typeof adoptionApplicationCreateSchema>

/** Staff decision on an application. */
export const adoptionApplicationReviewSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
})
export type AdoptionApplicationReviewInput = z.infer<typeof adoptionApplicationReviewSchema>

export const adoptionApplicationListQuerySchema = paginationSchema.extend({
  status: z.enum(applicationStatusValues).optional(),
  petId: uuidSchema.optional(),
})
export type AdoptionApplicationListQuery = z.infer<typeof adoptionApplicationListQuerySchema>
