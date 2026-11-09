<script setup lang="ts">
import { Heart, PawPrint } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'

definePageMeta({ layout: false })
useHead({ title: 'Criar conta — Aumigo' })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const auth = useAuthStore()

const inviteToken = computed(() => (route.query.invite as string) || '')
const isStaffInvite = computed(() => inviteToken.value.length > 0)

async function onSuccess() {
  if (!auth.isAuthenticated) {
    toast.success('Conta criada. Faça login.')
    await navigateTo('/login')
    return
  }
  await navigateTo(auth.isStaff ? '/admin' : '/')
}
</script>

<template>
  <div class="min-h-screen bg-white text-forest lg:flex lg:gap-6 lg:p-6">
    <div
      class="flex min-h-screen flex-1 flex-col px-6 py-8 lg:min-h-0 lg:px-10 lg:py-7"
    >
      <NuxtLink to="/" class="flex items-center gap-2.5">
        <PawPrint class="size-[30px] text-forest" />
        <span class="text-[30px] tracking-[-1.4px] text-forest">aumigo</span>
      </NuxtLink>

      <div class="flex flex-1 flex-col justify-center py-10">
        <div class="mx-auto w-full max-w-[400px]">
          <div class="flex flex-col gap-3">
            <h1 class="text-[32px] font-semibold tracking-[-1px] text-forest">
              {{ isStaffInvite ? 'Junte-se à equipe Aumigo' : 'Crie sua conta' }}
            </h1>
            <p class="text-[15px] leading-[1.5] text-forest/70">
              {{
                isStaffInvite
                  ? 'Conclua seu cadastro de staff a partir do convite.'
                  : 'Cadastre-se para adotar um pet.'
              }}
            </p>
          </div>

          <RegisterForm
            class="mt-8"
            :invite="inviteToken || undefined"
            @success="onSuccess"
          />

          <p class="mt-6 text-center text-[14px] text-forest">
            Já tem conta?
            <NuxtLink to="/login" class="font-semibold underline"
              >Entre aqui.</NuxtLink
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

    <AuthStory class="hidden w-[528px] shrink-0 self-stretch lg:flex" />
  </div>
</template>
