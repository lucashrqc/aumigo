import { z } from 'zod'
import { paginationSchema, uuidSchema } from './common'

// --- Vaccine catalog ---
export const vaccineCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).nullish(),
  expirationDate: z.string().date().nullish(),
})
export const vaccineUpdateSchema = vaccineCreateSchema.partial()
export type VaccineCreateInput = z.infer<typeof vaccineCreateSchema>
export type VaccineUpdateInput = z.infer<typeof vaccineUpdateSchema>

export const vaccineListQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(120).optional(),
  // When set, exclude vaccines expired before this date (keeps non-expiring ones).
  validOn: z.string().date().optional(),
})
export type VaccineListQuery = z.infer<typeof vaccineListQuerySchema>

// --- Applied vaccine ---
// Fields shared by standalone application and the nested "create pet with
// vaccines" case — everything except the owning `petId`.
export const appliedVaccineFieldsSchema = z.object({
  vaccineId: uuidSchema,
  vetLicense: z.string().trim().max(60).nullish(),
  batchNumber: z.string().trim().max(60).nullish(),
  applicationDate: z.string().date(),
  nextDoseDate: z.string().date().nullish(),
})
export const appliedVaccineCreateSchema = appliedVaccineFieldsSchema.extend({
  petId: uuidSchema,
})
export const appliedVaccineUpdateSchema = appliedVaccineFieldsSchema.partial()
export type AppliedVaccineFieldsInput = z.infer<typeof appliedVaccineFieldsSchema>
export type AppliedVaccineCreateInput = z.infer<typeof appliedVaccineCreateSchema>
export type AppliedVaccineUpdateInput = z.infer<typeof appliedVaccineUpdateSchema>
