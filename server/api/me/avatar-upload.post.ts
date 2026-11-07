import type { HandleUploadBody } from '@vercel/blob/client'

/** Issues a scoped Vercel Blob upload token for the current user's avatar. */
export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = (await readBody(event)) as HandleUploadBody
  return useBlobStorage().handleClientUpload({
    request: toWebRequest(event),
    body,
    pathPrefix: 'avatars/',
    allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maximumSizeInBytes: 2 * 1024 * 1024,
  })
})
