import { z } from 'zod'

export const invitationRoleValues = ['admin', 'staff'] as const

/** Admin creates an invitation for an employee email. */
export const invitationCreateSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(invitationRoleValues).default('staff'),
})
export type InvitationCreateInput = z.infer<typeof invitationCreateSchema>

/** Employee registers by consuming an invitation token. */
export const invitationAcceptSchema = z.object({
  token: z.string().trim().min(10),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(200),
  phone: z.string().trim().max(30).optional(),
})
export type InvitationAcceptInput = z.infer<typeof invitationAcceptSchema>
