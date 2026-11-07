<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'pt-BR' },
  titleTemplate: (title) => title || 'Aumor',
})

useSeoMeta({
  description:
    'Aumor é uma plataforma de adoção de pets. Encontre cães e gatos à espera de um novo lar.',
  ogSiteName: 'Aumor',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useSchemaOrg([
  defineOrganization({
    name: 'Aumor',
    description: 'Plataforma de adoção de pets.',
  }),
  defineWebSite({ name: 'Aumor' }),
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
