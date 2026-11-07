export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = useUuidParam(event, 'id')
  await useCatalogService().removeBreed(id)
  setResponseStatus(event, 204)
  return null
})
