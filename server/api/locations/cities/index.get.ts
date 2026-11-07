import { cityListQuerySchema } from '#shared/schemas'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const query = useValidatedQuery(event, cityListQuerySchema)
  return useLocationService().listCities(query)
})
