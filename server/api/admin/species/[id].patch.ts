import { speciesUpdateSchema } from '#shared/schemas'

export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  const id = useUuidParam(event, 'id')
  const input = await useValidatedBody(event, speciesUpdateSchema)
  return useCatalogService().updateSpecies(id, input, session.user.id)
})
