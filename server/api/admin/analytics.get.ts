import { analyticsQuerySchema } from '#shared/schemas'

/** Admin dashboard analytics — KPI cards + pets per month, filtered by date/species. */
export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const query = useValidatedQuery(event, analyticsQuerySchema)
  return useAnalyticsService().overview(query)
})
