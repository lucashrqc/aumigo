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

const petFieldsSchema = z.object({
  name: z.string().trim().min(1).max(120).nullish(),
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

// A pet must be identifiable: it needs either a given name or, failing that,
// a coat (pelagem) that stands in for the name across the app.
const hasNameOrCoat = (data: { name?: string | null; coat?: string | null }) =>
  Boolean(data.name?.trim() || data.coat?.trim())
const nameOrCoatMessage = 'Informe o nome ou a pelagem do pet'

export const petCreateSchema = petFieldsSchema.refine(hasNameOrCoat, {
  path: ['coat'],
  message: nameOrCoatMessage,
})
export type PetCreateInput = z.infer<typeof petCreateSchema>

// Status is never set through the generic create/update form — new pets are
// always 'pending' and transitions go through the dedicated action endpoints.
// Vaccines are managed individually, not through the pet update payload.
export const petUpdateSchema = petFieldsSchema
  .omit({ status: true, appliedVaccines: true })
  .partial()
  // Only enforce the name-or-coat rule when the name is part of this update,
  // so a partial patch that doesn't touch the name isn't wrongly rejected.
  .refine((data) => !('name' in data) || hasNameOrCoat(data), {
    path: ['coat'],
    message: nameOrCoatMessage,
  })
export type PetUpdateInput = z.infer<typeof petUpdateSchema>

export const petListQuerySchema = paginationSchema.extend({
  status: z.enum(petStatusValues).optional(),
  speciesId: uuidSchema.optional(),
  search: z.string().trim().max(120).optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
})
export type PetListQuery = z.infer<typeof petListQuerySchema>
