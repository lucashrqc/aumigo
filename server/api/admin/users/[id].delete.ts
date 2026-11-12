export default defineEventHandler(async (event) => {
  const session = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Identificador inválido' })
  }
  await useUserService().remove(id, session.user.id)
  setResponseStatus(event, 204)
  return null
})
