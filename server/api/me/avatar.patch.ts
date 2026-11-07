import { avatarUpdateSchema } from '#shared/schemas'

/** The current user sets or clears their avatar image URL. */
export default defineEventHandler(async (event) => {
  const session = await requireUser(event)
  const { image } = await useValidatedBody(event, avatarUpdateSchema)
  await useProfileService().updateAvatar(session.user.id, image)
  return { image }
})
