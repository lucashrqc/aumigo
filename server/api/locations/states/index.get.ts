import { stateListQuerySchema } from '#shared/schemas'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const query = useValidatedQuery(event, stateListQuerySchema)
  return useLocationService().listStates(query)
})
