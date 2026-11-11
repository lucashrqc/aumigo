import { configureZodLocale } from '#shared/utils/zod-locale'

export default defineNitroPlugin(() => {
  configureZodLocale()
})
