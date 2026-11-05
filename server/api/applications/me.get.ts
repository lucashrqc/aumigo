/** The current adopter's own applications. */
export default defineEventHandler(async (event) => {
  const session = await requireUser(event)
  return useAdoptionService().listForAdopter(session.user.id)
})
