<script setup lang="ts">
import { PawPrint } from '@lucide/vue'
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
      <div
        class="container mx-auto flex h-16 items-center justify-between gap-4 px-4"
      >
        <NuxtLink to="/" class="flex items-center gap-2 font-bold">
          <PawPrint class="h-5 w-5" />
          <span>Aumigo</span>
        </NuxtLink>

        <nav class="flex items-center gap-2">
          <Button as-child variant="ghost" size="sm">
            <NuxtLink to="/pets">Adotar</NuxtLink>
          </Button>

          <template v-if="auth.isAuthenticated">
            <Button v-if="auth.isStaff" as-child variant="ghost" size="sm">
              <NuxtLink to="/admin">Admin</NuxtLink>
            </Button>
            <Button as-child variant="ghost" size="sm">
              <NuxtLink to="/applications">Minhas candidaturas</NuxtLink>
            </Button>
            <Button variant="outline" size="xs" @click="logout">Sair</Button>
          </template>
          <template v-else>
            <Button as-child variant="ghost" size="sm">
              <NuxtLink to="/login">Entrar</NuxtLink>
            </Button>
            <Button as-child size="xs">
              <NuxtLink to="/register">Cadastrar</NuxtLink>
            </Button>
          </template>
        </nav>
      </div>
    </header>

    <main class="container mx-auto flex-1 px-4 py-8">
      <slot />
    </main>

    <footer class="border-t py-6 text-center text-sm text-muted-foreground">
      Aumigo — encontre seu novo melhor amigo.
    </footer>
  </div>
</template>
