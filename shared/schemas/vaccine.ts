import { z } from 'zod'
import { uuidSchema } from './common'

// --- Vaccine catalog ---
export const vaccineCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).nullish(),
  expirationDate: z.string().date().nullish(),
})
export const vaccineUpdateSchema = vaccineCreateSchema.partial()
export type VaccineCreateInput = z.infer<typeof vaccineCreateSchema>
export type VaccineUpdateInput = z.infer<typeof vaccineUpdateSchema>

// --- Applied vaccine ---
export const appliedVaccineCreateSchema = z.object({
  petId: uuidSchema,
  vaccineId: uuidSchema,
  vetLicense: z.string().trim().max(60).nullish(),
  batchNumber: z.string().trim().max(60).nullish(),
  applicationDate: z.string().date(),
  nextDoseDate: z.string().date().nullish(),
})
export const appliedVaccineUpdateSchema = appliedVaccineCreateSchema.partial().omit({ petId: true })
export type AppliedVaccineCreateInput = z.infer<typeof appliedVaccineCreateSchema>
