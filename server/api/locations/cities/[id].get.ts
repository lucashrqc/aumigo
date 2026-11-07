export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = useUuidParam(event, 'id')
  return useLocationService().getCityById(id)
})
