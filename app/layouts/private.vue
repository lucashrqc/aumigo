<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
</script>

<template>
  <SidebarProvider
    class="h-svh"
    :style="{
      '--sidebar-width': 'calc(var(--spacing) * 64)',
      '--header-height': 'calc(var(--spacing) * 12)',
    }"
  >
    <AppSidebar variant="inset" />
    <SidebarInset class="min-h-0 overflow-hidden">
      <SiteHeader />
      <div class="min-h-0 flex-1 overflow-y-auto">
        <div
          class="@container/main flex flex-1 flex-col gap-2 px-4 py-4 md:py-6 lg:px-6"
        >
          <NuxtPage />
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
