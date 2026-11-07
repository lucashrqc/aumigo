import { profileUpdateSchema } from '#shared/schemas'

/** The current staff member updates their own profile (name + phone). */
export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  const input = await useValidatedBody(event, profileUpdateSchema)
  return useProfileService().updateProfile(session.user.id, input)
})
