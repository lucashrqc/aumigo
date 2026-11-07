import { breedListQuerySchema } from '#shared/schemas'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const query = useValidatedQuery(event, breedListQuerySchema)
  return useCatalogService().listBreedsPaginated(query)
})
