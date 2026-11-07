/** The current staff member's own profile. */
export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  return useProfileService().getProfile(session.user.id)
})
