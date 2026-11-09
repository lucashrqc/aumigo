<script setup lang="ts">
import { ref } from 'vue'
import { Menu, PawPrint } from '@lucide/vue'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const menuOpen = ref(false)

async function logout() {
  menuOpen.value = false
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

        <nav class="hidden items-center gap-2 sm:flex">
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
            <Button variant="outline" size="sm" @click="logout">Sair</Button>
          </template>
          <template v-else>
            <Button as-child variant="ghost" size="sm">
              <NuxtLink to="/login">Entrar</NuxtLink>
            </Button>
            <Button as-child size="sm">
              <NuxtLink to="/register">Cadastrar</NuxtLink>
            </Button>
          </template>
        </nav>

        <div class="sm:hidden">
          <Sheet v-model:open="menuOpen">
            <SheetTrigger as-child>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu class="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" class="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav class="flex flex-col gap-1 px-4 pb-4">
                <Button
                  as-child
                  variant="ghost"
                  class="justify-start"
                  @click="menuOpen = false"
                >
                  <NuxtLink to="/pets">Adotar</NuxtLink>
                </Button>

                <template v-if="auth.isAuthenticated">
                  <Button
                    v-if="auth.isStaff"
                    as-child
                    variant="ghost"
                    class="justify-start"
                    @click="menuOpen = false"
                  >
                    <NuxtLink to="/admin">Admin</NuxtLink>
                  </Button>
                  <Button
                    as-child
                    variant="ghost"
                    class="justify-start"
                    @click="menuOpen = false"
                  >
                    <NuxtLink to="/applications">Minhas candidaturas</NuxtLink>
                  </Button>
                  <Button
                    variant="outline"
                    class="mt-2 justify-start"
                    @click="logout"
                  >
                    Sair
                  </Button>
                </template>
                <template v-else>
                  <Button
                    as-child
                    variant="ghost"
                    class="justify-start"
                    @click="menuOpen = false"
                  >
                    <NuxtLink to="/login">Entrar</NuxtLink>
                  </Button>
                  <Button
                    as-child
                    class="mt-2 justify-start"
                    @click="menuOpen = false"
                  >
                    <NuxtLink to="/register">Cadastrar</NuxtLink>
                  </Button>
                </template>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
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
