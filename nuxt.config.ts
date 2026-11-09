import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    'shadcn-nuxt',
    '@nuxtjs/seo',
  ],

  css: [
    '~/assets/css/tailwind.css',
    'vue-sonner/style.css',
    'vue-advanced-cropper/dist/style.css',
  ],

  build: {
    transpile: ['gsap', 'lenis'],
  },

  vite: {
    plugins: [tailwindcss()],
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: 'Aumigo',
  },

  ogImage: { enabled: false },

  robots: {
    disallow: ['/admin', '/applications', '/login', '/register'],
  },

  sitemap: {
    exclude: ['/admin/**', '/applications', '/login', '/register'],
    sources: ['/api/__sitemap__/urls'],
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },

  shadcn: {
    prefix: '',
    componentDir: '~/components/ui',
  },

  app: {
    head: {
      script: [
        {
          innerHTML: "document.documentElement.classList.add('js')",
          tagPosition: 'head',
        },
      ],
    },
  },

  runtimeConfig: {
    // Server-only. Defaults read from process.env so names stay friendly.
    databaseUrl: process.env.DATABASE_URL || '',
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || '',
    betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    resendApiKey: process.env.RESEND_API_KEY || '',
    resendFromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    blobReadWriteToken: process.env.BLOB_READ_WRITE_TOKEN || '',
    public: {
      authBaseUrl:
        process.env.NUXT_PUBLIC_AUTH_BASE_URL ||
        process.env.BETTER_AUTH_URL ||
        'http://localhost:3000',
      cfAnalyticsToken: process.env.NUXT_PUBLIC_CF_ANALYTICS_TOKEN || '',
      respectReducedMotion:
        process.env.NUXT_PUBLIC_RESPECT_REDUCED_MOTION === 'true',
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  future: {
    compatibilityVersion: 4,
  },
})
