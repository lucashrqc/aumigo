/** Staff unpublish a pet (status -> pending); an adopted pet is also reverted. */
export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  const id = useUuidParam(event, 'id')
  return usePetService().unpublish(id, session.user.id)
})
