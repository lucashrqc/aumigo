/**
 * Provides the Nitro/h3 auto-imported globals that server code relies on, so
 * services and repositories can be unit-tested outside the Nuxt runtime.
 */
interface ErrorOptions {
  statusCode?: number
  statusMessage?: string
  data?: unknown
}

class H3Error extends Error {
  statusCode: number
  statusMessage?: string
  data?: unknown
  constructor(opts: ErrorOptions) {
    super(opts.statusMessage ?? 'Error')
    this.statusCode = opts.statusCode ?? 500
    this.statusMessage = opts.statusMessage
    this.data = opts.data
  }
}

;(globalThis as Record<string, unknown>).createError = (opts: ErrorOptions) => new H3Error(opts)
