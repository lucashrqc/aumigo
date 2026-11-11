import { z } from 'zod'
import { paginationSchema, uuidSchema } from './common'
import { appliedVaccineFieldsSchema } from './vaccine'

export const petSexValues = ['male', 'female', 'unknown'] as const
export const petSizeValues = ['small', 'medium', 'large'] as const
export const petStatusValues = ['available', 'pending', 'adopted'] as const

export const MAX_PET_IMAGES = 5

export const petImageInputSchema = z.object({
  url: z.string().url(),
  position: z.number().int().min(0).default(0),
})

export const petCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  speciesId: uuidSchema,
  breedId: uuidSchema.nullish(),
  description: z.string().trim().max(2000).nullish(),
  weight: z.number().positive().max(9999).nullish(),
  size: z.enum(petSizeValues).nullish(),
  coat: z.string().trim().max(80).nullish(),
  sex: z.enum(petSexValues).default('unknown'),
  specialNeeds: z.string().trim().max(2000).nullish(),
  neutered: z.boolean().default(false),
  birthDate: z.string().date().nullish(),
  status: z.enum(petStatusValues).default('pending'),
  images: z.array(petImageInputSchema).max(MAX_PET_IMAGES).default([]),
  // Optional vaccines registered together with a new pet (persisted atomically).
  appliedVaccines: z.array(appliedVaccineFieldsSchema).max(30).default([]),
})
export type PetCreateInput = z.infer<typeof petCreateSchema>

// Status is never set through the generic create/update form — new pets are
// always 'pending' and transitions go through the dedicated action endpoints.
// Vaccines are managed individually, not through the pet update payload.
export const petUpdateSchema = petCreateSchema
  .omit({ status: true, appliedVaccines: true })
  .partial()
export type PetUpdateInput = z.infer<typeof petUpdateSchema>

export const petListQuerySchema = paginationSchema.extend({
  status: z.enum(petStatusValues).optional(),
  speciesId: uuidSchema.optional(),
  search: z.string().trim().max(120).optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
})
export type PetListQuery = z.infer<typeof petListQuerySchema>
