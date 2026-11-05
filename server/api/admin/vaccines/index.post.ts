import { vaccineCreateSchema } from '#shared/schemas'

export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  const input = await useValidatedBody(event, vaccineCreateSchema)
  setResponseStatus(event, 201)
  return useVaccineService().create(input, session.user.id)
})
