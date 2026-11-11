<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { Menu, PawPrint } from '@lucide/vue'
import { ref } from 'vue'

const auth = useAuthStore()
const menuOpen = ref(false)
const signOut = useLogout()

async function logout() {
  menuOpen.value = false
  await signOut()
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
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
            to="/pets"
            class="text-[14px] font-medium text-forest sm:block"
            >Adotar</NuxtLink
          >
          <template v-if="auth.isAuthenticated">
            <NuxtLink
              to="/applications"
              class="text-[14px] font-medium text-forest sm:block"
            >
              Minhas candidaturas
            </NuxtLink>
            <NuxtLink
              v-if="auth.isStaff"
              to="/admin"
              class="text-[14px] font-medium text-forest sm:block"
            >
              Admin
            </NuxtLink>
            <button
              type="button"
              class="inline-flex h-8 items-center rounded-lg bg-forest px-5.5 text-[14px] font-semibold text-white transition-colors hover:bg-forest/90"
              @click="logout"
            >
              Sair
            </button>
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
