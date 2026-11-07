import { addressUpsertSchema } from '#shared/schemas'

/** The current staff member sets their own contact address (upsert). */
export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  const input = await useValidatedBody(event, addressUpsertSchema)
  return useAddressService().upsertAddress(session.user.id, input)
})
