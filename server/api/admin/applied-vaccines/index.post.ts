import { appliedVaccineCreateSchema } from '#shared/schemas'

export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  const input = await useValidatedBody(event, appliedVaccineCreateSchema)
  setResponseStatus(event, 201)
  return useVaccineService().applyToPet(input, session.user.id)
})
