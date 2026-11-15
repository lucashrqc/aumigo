<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { LogOut, Menu, PawPrint } from '@lucide/vue'
import { ref } from 'vue'

const auth = useAuthStore()
const route = useRoute()
const menuOpen = ref(false)
const signOut = useLogout()

async function logout() {
  menuOpen.value = false
  await signOut()
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white">
    <header class="px-6 md:px-10 lg:px-20">
      <div
        class="mx-auto flex h-22 max-w-7xl items-center justify-between lg:h-26"
      >
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <PawPrint class="size-7 text-forest" />
          <span class="text-[30px] tracking-[-1.4px] text-forest">Aumigo</span>
        </NuxtLink>

        <nav class="hidden items-center gap-4 lg:gap-6 sm:flex">
          <NuxtLink
            v-if="route.name !== 'pets'"
            to="/pets"
            class="text-[14px] font-medium text-forest sm:block"
            >Encontre um pet</NuxtLink
          >
          <template v-if="auth.isAuthenticated">
            <UserMenu use-light-theme />
          </template>
          <template v-else>
            <Button
              as-child
              variant="ghost"
              size="sm"
              class="text-forest! hover:bg-cream-soft! hover:text-forest!"
            >
              <NuxtLink to="/login">Entrar</NuxtLink>
            </Button>
            <Button
              as-child
              size="sm"
              class="bg-forest text-white hover:bg-forest hover:text-white"
            >
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
            <SheetContent
              side="right"
              class="w-72 border-brand bg-white text-forest"
            >
              <SheetHeader class="flex flex-row mt-4 pb-0">
                <UserMenu use-light-theme informative />
              </SheetHeader>
              <nav class="flex flex-col gap-1 px-4 pb-4">
                <Button
                  as-child
                  variant="ghost"
                  class="justify-start text-forest! hover:bg-cream-soft! hover:text-forest!"
                  @click="menuOpen = false"
                >
                  <NuxtLink to="/pets">Adotar</NuxtLink>
                </Button>

                <template v-if="auth.isAuthenticated">
                  <Button
                    v-if="auth.isStaff"
                    as-child
                    variant="ghost"
                    class="justify-start text-forest! hover:bg-cream-soft! hover:text-forest!"
                    @click="menuOpen = false"
                  >
                    <NuxtLink to="/admin">Admin</NuxtLink>
                  </Button>
                  <Button
                    as-child
                    variant="ghost"
                    class="justify-start text-forest! hover:bg-cream-soft! hover:text-forest!"
                    @click="menuOpen = false"
                  >
                    <NuxtLink to="/applications">Minhas candidaturas</NuxtLink>
                  </Button>
                  <Button
                    variant="outline"
                    class="mt-2 justify-start border-red-100 text-red-400! hover:bg-red-50!"
                    @click="logout"
                  >
                    <LogOut class="text-red-600 dark:text-red-400" />
                    Sair
                  </Button>
                </template>
                <template v-else>
                  <Button
                    as-child
                    variant="ghost"
                    class="justify-start text-forest! hover:bg-cream-soft! hover:text-forest!"
                    @click="menuOpen = false"
                  >
                    <NuxtLink to="/login">Entrar</NuxtLink>
                  </Button>
                  <Button
                    as-child
                    class="mt-2 justify-start bg-forest! text-white! hover:bg-forest/90!"
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

    <LandingFooter v-if="route.meta.footer" />
  </div>
</template>
