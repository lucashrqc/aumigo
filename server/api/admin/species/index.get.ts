import { speciesListQuerySchema } from '#shared/schemas'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const query = useValidatedQuery(event, speciesListQuerySchema)
  return useCatalogService().listSpeciesPaginated(query)
})
