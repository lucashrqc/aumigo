import { z } from 'zod'

/** Sets Zod's global error map to Brazilian Portuguese (shared by server and client). */
export function configureZodLocale() {
  z.config(z.locales.ptBR())
}
