/** Extracts a human-friendly message from a Nuxt/$fetch error. */
export function resolveErrorMessage(err: unknown, fallback = 'Algo deu errado'): string {
  if (err && typeof err === 'object') {
    const e = err as { data?: { statusMessage?: string; message?: string }; statusMessage?: string }
    return e.data?.statusMessage || e.data?.message || e.statusMessage || fallback
  }
  return fallback
}
