export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = useUuidParam(event, 'id')
  return useCatalogService().getSpeciesById(id)
})
