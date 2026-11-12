import { del, list } from '@vercel/blob'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

type ClientUploadResult = Awaited<ReturnType<typeof handleUpload>>

export interface ClientUploadRequest {
  request: Request
  body: HandleUploadBody
  pathPrefix: string
  allowedContentTypes: string[]
  maximumSizeInBytes: number
}

/** A blob listed from storage, used by the orphan sweep. */
export interface BlobObject {
  url: string
  pathname: string
  size: number
  uploadedAt: Date
}

/**
 * Blob storage port for client-direct uploads. The browser uploads bytes
 * straight to the provider; this only issues a short-lived, scoped token.
 * VercelBlobStorage talks to Vercel Blob; DisabledBlobStorage is the fallback
 * when no token is configured — the composition root picks one.
 */
export interface BlobStorage {
  handleClientUpload(input: ClientUploadRequest): Promise<ClientUploadResult>
  /** All blobs under a prefix (paginated internally). */
  list(prefix: string): Promise<BlobObject[]>
  /** Delete blobs by URL; no-op on an empty array. */
  delete(urls: string[]): Promise<void>
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
        return {
          allowedContentTypes,
          maximumSizeInBytes,
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {},
    })
  }

  async list(prefix: string): Promise<BlobObject[]> {
    const out: BlobObject[] = []
    let cursor: string | undefined
    do {
      const res = await list({ token: this.token, prefix, cursor, limit: 1000 })
      for (const b of res.blobs) {
        out.push({
          url: b.url,
          pathname: b.pathname,
          size: b.size,
          uploadedAt: b.uploadedAt,
        })
      }
      cursor = res.hasMore ? res.cursor : undefined
    } while (cursor)
    return out
  }

  async delete(urls: string[]): Promise<void> {
    if (!urls.length) return
    await del(urls, { token: this.token })
  }
}

export class DisabledBlobStorage implements BlobStorage {
  async handleClientUpload(): Promise<never> {
    throw this.disabled()
  }

  async list(): Promise<never> {
    throw this.disabled()
  }

  async delete(): Promise<never> {
    throw this.disabled()
  }

  private disabled() {
    return createError({
      statusCode: 501,
      statusMessage: 'Upload de arquivos não está configurado',
    })
  }
}
