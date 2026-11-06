import { vaccineListQuerySchema } from '#shared/schemas'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const query = useValidatedQuery(event, vaccineListQuerySchema)
  return useVaccineService().list(query)
})
