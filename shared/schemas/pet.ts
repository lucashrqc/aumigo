import { z } from 'zod'
import { paginationSchema, uuidSchema } from './common'

export const petSexValues = ['male', 'female', 'unknown'] as const
export const petSizeValues = ['small', 'medium', 'large'] as const
export const petStatusValues = ['available', 'pending', 'adopted'] as const

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
  status: z.enum(petStatusValues).default('available'),
  images: z.array(petImageInputSchema).max(12).default([]),
})
export type PetCreateInput = z.infer<typeof petCreateSchema>

export const petUpdateSchema = petCreateSchema.partial()
export type PetUpdateInput = z.infer<typeof petUpdateSchema>

export const petListQuerySchema = paginationSchema.extend({
  status: z.enum(petStatusValues).optional(),
  speciesId: uuidSchema.optional(),
  search: z.string().trim().max(120).optional(),
})
export type PetListQuery = z.infer<typeof petListQuerySchema>
