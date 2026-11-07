import { ibgeResolveQuerySchema } from '#shared/schemas'

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const query = useValidatedQuery(event, ibgeResolveQuerySchema)
  return useLocationService().resolveByIbge(query)
})
