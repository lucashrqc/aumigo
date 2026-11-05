import { adoptionApplicationListQuerySchema } from '#shared/schemas'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const query = useValidatedQuery(event, adoptionApplicationListQuerySchema)
  return useAdoptionService().list(query)
})
