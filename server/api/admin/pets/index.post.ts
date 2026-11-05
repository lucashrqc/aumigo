import { petCreateSchema } from '#shared/schemas'

export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  const input = await useValidatedBody(event, petCreateSchema)
  setResponseStatus(event, 201)
  return usePetService().create(input, session.user.id)
})
