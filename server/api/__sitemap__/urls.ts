export default defineSitemapEventHandler(async () => {
  const service = usePetService()
  const pageSize = 100
  const urls: Array<{ loc: string; lastmod: Date }> = []

  let page = 1
  let total = Infinity
  while ((page - 1) * pageSize < total) {
    const result = await service.list({ page, pageSize, status: 'available' })
    total = result.total
    for (const pet of result.items) {
      urls.push({ loc: `/pets/${pet.id}`, lastmod: pet.updatedAt })
    }
    if (result.items.length === 0) break
    page++
  }

  return urls
})
