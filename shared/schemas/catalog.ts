import { z } from 'zod'
import { paginationSchema, uuidSchema } from './common'

// --- Species ---
export const speciesCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
})
export const speciesUpdateSchema = speciesCreateSchema.partial()
export type SpeciesCreateInput = z.infer<typeof speciesCreateSchema>
export type SpeciesUpdateInput = z.infer<typeof speciesUpdateSchema>

export const speciesListQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(80).optional(),
})
export type SpeciesListQuery = z.infer<typeof speciesListQuerySchema>

// --- Breed ---
export const breedCreateSchema = z.object({
  speciesId: uuidSchema,
  name: z.string().trim().min(1).max(80),
})
export const breedUpdateSchema = breedCreateSchema.partial()
export type BreedCreateInput = z.infer<typeof breedCreateSchema>
export type BreedUpdateInput = z.infer<typeof breedUpdateSchema>

export const breedListQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(80).optional(),
  speciesId: uuidSchema.optional(),
})
export type BreedListQuery = z.infer<typeof breedListQuerySchema>

// --- City ---
export const cityCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  stateId: uuidSchema,
  ibgeId: z.coerce.number().int().positive().optional(),
})
export const cityUpdateSchema = cityCreateSchema.partial()
export type CityCreateInput = z.infer<typeof cityCreateSchema>
