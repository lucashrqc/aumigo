import { speciesCreateSchema } from '#shared/schemas'

export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  const input = await useValidatedBody(event, speciesCreateSchema)
  setResponseStatus(event, 201)
  return useCatalogService().createSpecies(input, session.user.id)
})
