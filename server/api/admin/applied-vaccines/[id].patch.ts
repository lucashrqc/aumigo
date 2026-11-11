import { appliedVaccineUpdateSchema } from '#shared/schemas'

export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  const id = useUuidParam(event, 'id')
  const input = await useValidatedBody(event, appliedVaccineUpdateSchema)
  return useVaccineService().updateApplied(id, input, session.user.id)
})
