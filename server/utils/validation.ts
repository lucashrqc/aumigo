import type { H3Event } from 'h3'
import type { ZodType } from 'zod'

/** Parse and validate the request body, throwing 422 with field errors. */
export async function useValidatedBody<T>(event: H3Event, schema: ZodType<T>): Promise<T> {
  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Falha na validação',
      data: result.error.flatten(),
    })
  }
  return result.data
}

/** Parse and validate the query string, throwing 422 with field errors. */
export function useValidatedQuery<T>(event: H3Event, schema: ZodType<T>): T {
  const result = schema.safeParse(getQuery(event))
  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Falha na validação',
      data: result.error.flatten(),
    })
  }
  return result.data
}

/** Read and validate a UUID route param, throwing 400 when malformed. */
export function useUuidParam(event: H3Event, name: string): string {
  const value = getRouterParam(event, name)
  if (!value || !/^[0-9a-f-]{36}$/i.test(value)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Identificador inválido',
    })
  }
  return value
}
