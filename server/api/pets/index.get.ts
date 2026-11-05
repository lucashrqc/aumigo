import { petListQuerySchema } from '#shared/schemas'

/** Public pet listing — only available pets. */
export default defineEventHandler(async (event) => {
  const query = useValidatedQuery(event, petListQuerySchema)
  return usePetService().list({ ...query, status: 'available' })
})
