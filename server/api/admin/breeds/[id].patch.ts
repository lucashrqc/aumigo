import { breedUpdateSchema } from '#shared/schemas'

export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  const id = useUuidParam(event, 'id')
  const input = await useValidatedBody(event, breedUpdateSchema)
  return useCatalogService().updateBreed(id, input, session.user.id)
})
