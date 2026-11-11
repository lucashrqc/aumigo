/** Adopter cancels their own pending application. */
export default defineEventHandler(async (event) => {
  const session = await requireUser(event)
  const id = useUuidParam(event, 'id')
  return useAdoptionService().cancelOwnApplication(id, session.user.id)
})
