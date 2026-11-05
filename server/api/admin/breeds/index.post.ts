import { breedCreateSchema } from '#shared/schemas'

export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  const input = await useValidatedBody(event, breedCreateSchema)
  setResponseStatus(event, 201)
  return useCatalogService().createBreed(input, session.user.id)
})
