/** Public pet detail. */
export default defineEventHandler(async (event) => {
  const id = useUuidParam(event, 'id')
  const pet = await usePetService().getById(id)
  if (!pet.active) {
    throw createError({ statusCode: 404, statusMessage: 'Pet not found' })
  }
  return pet
})
