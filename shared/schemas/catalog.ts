import { z } from 'zod'
import { uuidSchema } from './common'

// --- Species ---
export const speciesCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
})
export const speciesUpdateSchema = speciesCreateSchema.partial()
export type SpeciesCreateInput = z.infer<typeof speciesCreateSchema>

// --- Breed ---
export const breedCreateSchema = z.object({
  speciesId: uuidSchema,
  name: z.string().trim().min(1).max(80),
})
export const breedUpdateSchema = breedCreateSchema.partial()
export type BreedCreateInput = z.infer<typeof breedCreateSchema>

// --- City ---
export const cityCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  state: z.string().trim().min(2).max(60),
  ibgeCode: z.string().trim().max(20).optional(),
})
export const cityUpdateSchema = cityCreateSchema.partial()
export type CityCreateInput = z.infer<typeof cityCreateSchema>
