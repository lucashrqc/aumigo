/**
 * Image storage port.
 *
 * v1 stores externally-hosted URLs only (no upload infra, no cost). A future
 * adapter (e.g. Vercel Blob) can accept raw bytes and return a hosted URL
 * without any change to callers — Open/Closed.
 */
export interface ImageStorage {
  /** Validate/normalize an image reference and return the URL to persist. */
  resolveUrl(input: { url: string }): Promise<string>
}

export class UrlImageStorage implements ImageStorage {
  async resolveUrl({ url }: { url: string }): Promise<string> {
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      throw createError({ statusCode: 422, statusMessage: 'Invalid image URL' })
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw createError({ statusCode: 422, statusMessage: 'Image URL must be http(s)' })
    }
    return parsed.toString()
  }
}
