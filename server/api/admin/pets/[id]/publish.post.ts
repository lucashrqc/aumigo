/** Staff publish a pending pet (status -> available). */
export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  const id = useUuidParam(event, 'id')
  return usePetService().publish(id, session.user.id)
})
