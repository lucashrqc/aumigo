import { z } from 'zod'
import { paginationSchema, uuidSchema } from './common'
import { documentDigits, isValidDocument } from '../utils/document'

export const applicationStatusValues = [
  'pending',
  'approved',
  'rejected',
  'canceled',
] as const

export const homeValues = ['house', 'apartment'] as const
export const enclosureTypeValues = [
  'walled',
  'fenced',
  'fully_enclosed',
  'is_netted',
] as const

/** Adopter-submitted application (from the public site). */
export const adoptionApplicationCreateSchema = z
  .object({
    petId: uuidSchema,
    document: z
      .string()
      .trim()
      .refine((v) => v === '' || isValidDocument(v), 'Informe um CPF ou CNPJ válido')
      .transform((v) => (v === '' ? undefined : documentDigits(v)))
      .optional(),
    contactPhone: z
      .string()
      .trim()
      .regex(/^\d{10,11}$/, 'Informe um telefone válido com DDD'),
    message: z.string().trim().max(1000).optional(),
    age: z.coerce
      .number({ error: 'Informe a idade' })
      .int()
      .min(18, 'Idade mínima 18 anos')
      .max(120, 'Idade inválida'),
    home: z.enum(homeValues, { error: 'Selecione o tipo de moradia' }),
    cityId: uuidSchema,
    street: z.string().trim().min(1, 'Informe a rua').max(200),
    number: z.string().trim().min(1, 'Informe o número').max(30),
    neighborhood: z.string().trim().min(1, 'Informe o bairro').max(120),
    complement: z.string().trim().max(200).optional(),
    zipCode: z.string().trim().min(1, 'Informe o CEP').max(20),
    isRental: z.boolean(),
    allowPets: z.boolean().optional(),
    firstPet: z.boolean(),
    hasFinancialConditions: z.boolean(),
    enclosureType: z.array(z.enum(enclosureTypeValues)).optional(),
    acceptedTerms: z.boolean().refine((v) => v === true, {
      message: 'É necessário aceitar os termos',
    }),
  })
  .superRefine((value, ctx) => {
    if (value.isRental && typeof value.allowPets !== 'boolean') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['allowPets'],
        message: 'Informe se o contrato permite animais',
      })
    }
  })
export type AdoptionApplicationCreateInput = z.infer<typeof adoptionApplicationCreateSchema>

/** Staff decision on an application. */
export const adoptionApplicationReviewSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  rejectReason: z.string().trim().max(1000).optional(),
})
export type AdoptionApplicationReviewInput = z.infer<typeof adoptionApplicationReviewSchema>

export const adoptionApplicationListQuerySchema = paginationSchema.extend({
  status: z.enum(applicationStatusValues).optional(),
  petId: uuidSchema.optional(),
  /** Free-text search across the pet name and the adopter name. */
  search: z.string().trim().max(120).optional(),
})
export type AdoptionApplicationListQuery = z.infer<typeof adoptionApplicationListQuerySchema>
