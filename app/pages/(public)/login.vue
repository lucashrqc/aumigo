<script setup lang="ts">
import { Heart, PawPrint } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'

definePageMeta({ layout: false })
useHead({ title: 'Entrar — Aumigo' })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const auth = useAuthStore()

async function onSuccess() {
  const redirect =
    (route.query.redirect as string) || (auth.isStaff ? '/admin' : '/')
  await navigateTo(redirect)
}
</script>

<template>
  <div class="min-h-screen bg-white text-forest lg:flex lg:gap-6 lg:p-6">
    <div
      class="flex min-h-screen flex-1 flex-col px-6 py-8 lg:min-h-0 lg:px-10 lg:py-7"
    >
      <NuxtLink to="/" class="flex items-center gap-2.5">
        <PawPrint class="size-7.5 text-forest" />
        <span class="text-[30px] tracking-[-1.4px] text-forest">Aumigo</span>
      </NuxtLink>

      <div class="flex flex-1 flex-col justify-center py-10">
        <div class="mx-auto w-full max-w-100">
          <div class="flex flex-col gap-3">
            <h1 class="text-[32px] font-semibold tracking-[-1px] text-forest">
              Entrar
            </h1>
            <p class="text-[15px] leading-normal text-forest/70">
              Bem-vindo de volta à Aumigo.
            </p>
          </div>

          <LoginForm class="mt-8" @success="onSuccess" />

          <p class="mt-6 text-center text-[14px] text-forest">
            Não tem conta?
            <NuxtLink to="/register" class="font-semibold underline"
              >Crie uma.</NuxtLink
            >
          </p>
        </div>
      </div>

      <AuthStory class="mt-10 lg:hidden" />

      <footer
        class="mt-8 flex items-center justify-between text-[12px] text-forest/60 lg:mt-0"
      >
        <span>© 2026 Aumigo</span>
        <span class="flex items-center gap-1.5">
          <Heart class="size-3" />
          O amor encontra um lar.
        </span>
      </footer>
    </div>

    <AuthStory class="hidden w-132 shrink-0 self-stretch lg:flex" />
  </div>
</template>
