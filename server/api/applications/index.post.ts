import { adoptionApplicationCreateSchema } from '#shared/schemas'

/** Logged-in adopter submits an adoption application. */
export default defineEventHandler(async (event) => {
  const session = await requireUser(event)
  const input = await useValidatedBody(event, adoptionApplicationCreateSchema)
  return useAdoptionService().apply(input, session.user.id)
})
