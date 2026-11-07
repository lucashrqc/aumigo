import type { HandleUploadBody } from '@vercel/blob/client'

/** Issues a scoped Vercel Blob upload token for staff uploading pet photos. */
export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const body = (await readBody(event)) as HandleUploadBody
  return useBlobStorage().handleClientUpload({
    request: toWebRequest(event),
    body,
    pathPrefix: 'pets/',
    allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maximumSizeInBytes: 5 * 1024 * 1024,
  })
})
