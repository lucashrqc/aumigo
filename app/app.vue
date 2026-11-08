<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'pt-BR' },
  titleTemplate: (title) => title || 'Aumigo',
})

useSeoMeta({
  description:
    'Aumigo é uma plataforma de adoção de pets. Encontre cães e gatos à espera de um novo lar.',
  ogSiteName: 'Aumigo',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useSchemaOrg([
  defineOrganization({
    name: 'Aumigo',
    description: 'Plataforma de adoção de pets.',
  }),
  defineWebSite({ name: 'Aumigo' }),
])
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster />
  <AppDialogProvider />
</template>
