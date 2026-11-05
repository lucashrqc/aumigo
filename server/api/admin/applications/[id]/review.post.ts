import { adoptionApplicationReviewSchema } from '#shared/schemas'

/** Staff approve or reject an adoption application. */
export default defineEventHandler(async (event) => {
  const session = await requireStaff(event)
  const id = useUuidParam(event, 'id')
  const input = await useValidatedBody(event, adoptionApplicationReviewSchema)
  return useAdoptionService().review(id, input, session.user.id)
})
