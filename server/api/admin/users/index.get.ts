import { userListQuerySchema } from '#shared/schemas'

/** Admin user listing — all roles, paginated and searchable. */
export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const query = useValidatedQuery(event, userListQuerySchema)
  return useUserService().list(query)
})
