import { upload } from '@vercel/blob/client'

interface UploadImageOptions {
  pathPrefix: string
  handleUploadUrl: string
}

export async function uploadImage(
  file: File,
  { pathPrefix, handleUploadUrl }: UploadImageOptions,
): Promise<string> {
  const result = await upload(`${pathPrefix}${Date.now()}-${file.name}`, file, {
    access: 'public',
    handleUploadUrl,
  })
  return result.url
}
