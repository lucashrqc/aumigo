<script setup lang="ts">
import { Eye, EyeOff, Heart, PawPrint } from '@lucide/vue'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

definePageMeta({ layout: false })
useHead({ title: 'Entrar — Aumor' })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const auth = useAuthStore()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    const { error } = await authClient.signIn.email({
      email: email.value,
      password: password.value,
    })
    if (error) throw new Error(error.message || 'Credenciais inválidas')
    await auth.fetchSession()
    const redirect =
      (route.query.redirect as string) || (auth.isStaff ? '/admin' : '/')
    await navigateTo(redirect)
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Falha ao entrar')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-white text-forest lg:flex lg:gap-6 lg:p-6">
    <div
      class="flex min-h-screen flex-1 flex-col px-6 py-8 lg:min-h-0 lg:px-10 lg:py-7"
    >
      <NuxtLink to="/" class="flex items-center gap-2.5">
        <PawPrint class="size-7.5 text-forest" />
        <span class="text-[30px] tracking-[-1.4px] text-forest">aumor</span>
      </NuxtLink>

      <div class="flex flex-1 flex-col justify-center py-10">
        <div class="mx-auto w-full max-w-100">
          <div class="flex flex-col gap-3">
            <h1 class="text-[32px] font-semibold tracking-[-1px] text-forest">
              Entrar
            </h1>
            <p class="text-[15px] leading-normal text-forest/70">
              Bem-vindo de volta à Aumor.
            </p>
          </div>

          <form class="mt-8 flex flex-col gap-5" @submit.prevent="submit">
            <div class="flex flex-col gap-2">
              <Label for="email" class="text-[14px] font-medium text-forest"
                >E-mail</Label
              >
              <Input
                id="email"
                v-model="email"
                type="email"
                required
                autocomplete="email"
                placeholder="voce@exemplo.com"
                class="h-12 rounded-xl border-brand bg-white text-[14px] text-forest placeholder:text-forest/50"
              />
            </div>

            <div class="flex flex-col gap-2">
              <Label for="password" class="text-[14px] font-medium text-forest"
                >Senha</Label
              >
              <div class="relative">
                <Input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="current-password"
                  placeholder="Digite sua senha"
                  class="h-12 rounded-xl border-brand bg-white pr-11 text-[14px] text-forest placeholder:text-forest/50"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-3 flex items-center text-forest/70 transition-colors hover:text-forest"
                  :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                  @click="showPassword = !showPassword"
                >
                  <component
                    :is="showPassword ? EyeOff : Eye"
                    class="size-4.5"
                  />
                </button>
              </div>
            </div>

            <div class="mt-3 flex flex-col gap-6">
              <Button
                type="submit"
                :disabled="loading"
                class="h-12 w-full rounded-xl bg-forest text-[14px] font-semibold text-white hover:bg-forest/90"
              >
                Entrar
              </Button>
              <p class="text-center text-[14px] text-forest">
                Não tem conta?
                <NuxtLink to="/register" class="font-semibold underline"
                  >Crie uma.</NuxtLink
                >
              </p>
            </div>
          </form>
        </div>
      </div>

      <AuthStory class="mt-10 lg:hidden" />

      <footer
        class="mt-8 flex items-center justify-between text-[12px] text-forest/60 lg:mt-0"
      >
        <span>© 2026 Aumor</span>
        <span class="flex items-center gap-1.5">
          <Heart class="size-3" />
          O amor encontra um lar.
        </span>
      </footer>
    </div>

    <AuthStory class="hidden w-132 shrink-0 self-stretch lg:flex" />
  </div>
</template>
