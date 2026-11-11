import { configureZodLocale } from '#shared/utils/zod-locale'

export default defineNuxtPlugin(() => {
  configureZodLocale()
})
