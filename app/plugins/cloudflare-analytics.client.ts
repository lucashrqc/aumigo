export default defineNuxtPlugin(() => {
  if (import.meta.dev) return

  const token = useRuntimeConfig().public.cfAnalyticsToken
  if (!token) return

  useHead({
    script: [
      {
        src: 'https://static.cloudflareinsights.com/beacon.min.js',
        defer: true,
        'data-cf-beacon': JSON.stringify({ token }),
      },
    ],
  })
})
