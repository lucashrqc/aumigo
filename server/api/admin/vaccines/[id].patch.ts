import { vaccineUpdateSchema } from '#shared/schemas'

export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  const id = useUuidParam(event, 'id')
  const input = await useValidatedBody(event, vaccineUpdateSchema)
  return useVaccineService().update(id, input, session.user.id)
})
