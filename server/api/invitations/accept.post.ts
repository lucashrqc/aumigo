import { invitationAcceptSchema } from '#shared/schemas'

/** Public: employee accepts a staff invitation and creates their account. */
export default defineEventHandler(async (event) => {
  const input = await useValidatedBody(event, invitationAcceptSchema)
  return useStaffService().acceptInvitation(input)
})
