/** Staff mark a pet as adopted; open applications are auto-rejected. */
export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  const id = useUuidParam(event, 'id')
  return usePetService().markAdopted(id, session.user.id)
})
