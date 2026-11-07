/** Admin application stats — aggregate counts for the dashboard cards. */
export default defineEventHandler(async (event) => {
  await requireStaff(event)
  return useAdoptionService().stats()
})
