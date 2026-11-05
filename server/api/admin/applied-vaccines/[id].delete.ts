export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = useUuidParam(event, 'id')
  await useVaccineService().removeApplied(id)
  setResponseStatus(event, 204)
  return null
})
