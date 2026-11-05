import { cityCreateSchema } from '#shared/schemas'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const input = await useValidatedBody(event, cityCreateSchema)
  setResponseStatus(event, 201)
  return useCatalogService().createCity(input)
})
