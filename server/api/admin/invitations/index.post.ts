import { invitationCreateSchema } from '#shared/schemas'

/** Admin invites an employee by email. */
export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event)
  const input = await useValidatedBody(event, invitationCreateSchema)
  setResponseStatus(event, 201)
  return useStaffService().invite(input, session.user.id)
})
