<script setup lang="ts">
import { PawPrint } from 'lucide-vue-next'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

async function logout() {
  await authClient.signOut()
  auth.setUser(null)
  await navigateTo('/')
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="border-b">
      <div class="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <NuxtLink to="/" class="flex items-center gap-2 font-bold">
          <PawPrint class="h-5 w-5" />
          <span>Aumor</span>
        </NuxtLink>

        <nav class="flex items-center gap-2">
          <Button as-child variant="ghost" size="sm">
            <NuxtLink to="/pets">Adopt</NuxtLink>
          </Button>

          <template v-if="auth.isAuthenticated">
            <Button v-if="auth.isStaff" as-child variant="ghost" size="sm">
              <NuxtLink to="/admin">Admin</NuxtLink>
            </Button>
            <Button as-child variant="ghost" size="sm">
              <NuxtLink to="/applications">My applications</NuxtLink>
            </Button>
            <Button variant="outline" size="sm" @click="logout">Sign out</Button>
          </template>
          <template v-else>
            <Button as-child variant="ghost" size="sm">
              <NuxtLink to="/login">Sign in</NuxtLink>
            </Button>
            <Button as-child size="sm">
              <NuxtLink to="/register">Sign up</NuxtLink>
            </Button>
          </template>
        </nav>
      </div>
    </header>

    <main class="container mx-auto flex-1 px-4 py-8">
      <slot />
    </main>

    <footer class="border-t py-6 text-center text-sm text-muted-foreground">
      Aumor — find your new best friend.
    </footer>
  </div>
</template>
