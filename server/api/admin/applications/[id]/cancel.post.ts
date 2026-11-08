/** Staff cancel an adoption application; a canceled approval frees the pet. */
export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  const id = useUuidParam(event, 'id')
  return useAdoptionService().cancelApplication(id, session.user.id)
})
