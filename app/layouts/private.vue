<script setup lang="ts">
import { ClipboardList, Dog, LayoutDashboard, Syringe, Users } from 'lucide-vue-next'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/pets', label: 'Pets', icon: Dog },
  { to: '/admin/vaccines', label: 'Vaccines', icon: Syringe },
  { to: '/admin/applications', label: 'Applications', icon: ClipboardList },
  { to: '/admin/staff', label: 'Staff', icon: Users, adminOnly: true },
]

const visibleNav = computed(() => nav.filter((item) => !item.adminOnly || auth.isAdmin))

async function logout() {
  await authClient.signOut()
  auth.setUser(null)
  await navigateTo('/')
}
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="hidden w-60 shrink-0 border-r bg-muted/30 p-4 md:block">
      <NuxtLink to="/admin" class="mb-6 block px-2 text-lg font-bold">Aumor Admin</NuxtLink>
      <nav class="flex flex-col gap-1">
        <NuxtLink
          v-for="item in visibleNav"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
          active-class="bg-accent font-medium"
        >
          <component :is="item.icon" class="h-4 w-4" />
          {{ item.label }}
        </NuxtLink>
      </nav>
    </aside>

    <div class="flex flex-1 flex-col">
      <header class="flex h-14 items-center justify-between border-b px-4">
        <span class="text-sm text-muted-foreground">
          {{ auth.user?.name }} · {{ auth.role }}
        </span>
        <div class="flex items-center gap-2">
          <Button as-child variant="ghost" size="sm"><NuxtLink to="/">Public site</NuxtLink></Button>
          <Button variant="outline" size="sm" @click="logout">Sign out</Button>
        </div>
      </header>
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
