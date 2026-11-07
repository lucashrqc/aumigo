/** The current staff member's contact address, or null if none set. */
export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  return useAddressService().getAddress(session.user.id)
})
