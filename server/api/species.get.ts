/** Public species list (used for filtering on the public site). */
export default defineEventHandler(() => {
  return useCatalogService().listSpecies()
})
