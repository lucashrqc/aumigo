export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  const id = useUuidParam(event, 'id')
  await useVaccineService().remove(id, session.user.id)
  setResponseStatus(event, 204)
  return null
})
