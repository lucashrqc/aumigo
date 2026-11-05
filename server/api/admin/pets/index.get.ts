import { petListQuerySchema } from '#shared/schemas'

/** Admin pet listing — all statuses. */
export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const query = useValidatedQuery(event, petListQuerySchema)
  return usePetService().list(query)
})
