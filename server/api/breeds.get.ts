import { z } from 'zod'

const querySchema = z.object({ speciesId: z.string().uuid().optional() })

/** Public breed list, optionally filtered by species. */
export default defineEventHandler((event) => {
  const { speciesId } = useValidatedQuery(event, querySchema)
  return useCatalogService().listBreeds(speciesId)
})
