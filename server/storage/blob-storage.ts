import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

type ClientUploadResult = Awaited<ReturnType<typeof handleUpload>>

export interface ClientUploadRequest {
  request: Request
  body: HandleUploadBody
  pathPrefix: string
  allowedContentTypes: string[]
  maximumSizeInBytes: number
}

/**
 * Blob storage port for client-direct uploads. The browser uploads bytes
 * straight to the provider; this only issues a short-lived, scoped token.
 * VercelBlobStorage talks to Vercel Blob; DisabledBlobStorage is the fallback
 * when no token is configured — the composition root picks one.
 */
export interface BlobStorage {
  handleClientUpload(input: ClientUploadRequest): Promise<ClientUploadResult>
}

export class VercelBlobStorage implements BlobStorage {
  constructor(private readonly token: string) {}

  handleClientUpload({
    request,
    body,
    pathPrefix,
    allowedContentTypes,
    maximumSizeInBytes,
  }: ClientUploadRequest): Promise<ClientUploadResult> {
    return handleUpload({
      body,
      request,
      token: this.token,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(pathPrefix)) {
          throw createError({
            statusCode: 422,
            statusMessage: 'Caminho de upload inválido',
          })
        }
        return { allowedContentTypes, maximumSizeInBytes, addRandomSuffix: true }
      },
      onUploadCompleted: async () => {},
    })
  }
}

export class DisabledBlobStorage implements BlobStorage {
  async handleClientUpload(): Promise<never> {
    throw createError({
      statusCode: 501,
      statusMessage: 'Upload de arquivos não está configurado',
    })
  }
}
