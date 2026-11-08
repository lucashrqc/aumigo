<script setup lang="ts">
import { Eye, EyeOff, Heart, PawPrint } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/stores/auth'

definePageMeta({ layout: false })
useHead({ title: 'Criar conta — Aumigo' })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const auth = useAuthStore()

const inviteToken = computed(() => (route.query.invite as string) || '')
const isStaffInvite = computed(() => inviteToken.value.length > 0)

const name = ref('')
const email = ref('')
const password = ref('')
const phone = ref('')
const showPassword = ref(false)
const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    if (isStaffInvite.value) {
      const api = useRequestFetch()
      await api('/api/invitations/accept', {
        method: 'POST',
        body: {
          token: inviteToken.value,
          name: name.value,
          password: password.value,
          phone: phone.value || undefined,
        },
      })
    } else {
      const { error } = await authClient.signUp.email({
        name: name.value,
        email: email.value,
        password: password.value,
      })
      if (error)
        throw new Error(error.message || 'Não foi possível criar a conta')
    }

    await auth.fetchSession()
    if (!auth.isAuthenticated) {
      toast.success('Conta criada. Faça login.')
      await navigateTo('/login')
      return
    }
    await navigateTo(auth.isStaff ? '/admin' : '/')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Falha no cadastro'))
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

          <form class="mt-8 flex flex-col gap-5" @submit.prevent="submit">
            <div class="flex flex-col gap-2">
              <Label for="name" class="text-[14px] font-medium text-forest"
                >Nome</Label
              >
              <Input
                id="name"
                v-model="name"
                required
                autocomplete="name"
                placeholder="Seu nome completo"
                class="h-12 rounded-[8px] border-brand bg-white text-[14px] text-forest placeholder:text-forest/50"
              />
            </div>

            <div v-if="!isStaffInvite" class="flex flex-col gap-2">
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
                class="h-12 rounded-[8px] border-brand bg-white text-[14px] text-forest placeholder:text-forest/50"
              />
            </div>

            <div v-if="isStaffInvite" class="flex flex-col gap-2">
              <Label for="phone" class="text-[14px] font-medium text-forest">
                Telefone (opcional)
              </Label>
              <Input
                id="phone"
                v-model="phone"
                autocomplete="tel"
                placeholder="(00) 00000-0000"
                class="h-12 rounded-[8px] border-brand bg-white text-[14px] text-forest placeholder:text-forest/50"
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
                  minlength="8"
                  autocomplete="new-password"
                  placeholder="Crie uma senha"
                  class="h-12 rounded-[8px] border-brand bg-white pr-11 text-[14px] text-forest placeholder:text-forest/50"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-3 flex items-center text-forest/70 transition-colors hover:text-forest"
                  :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                  @click="showPassword = !showPassword"
                >
                  <component
                    :is="showPassword ? EyeOff : Eye"
                    class="size-[18px]"
                  />
                </button>
              </div>
              <p class="text-[13px] text-forest/60">
                Use pelo menos 8 caracteres.
              </p>
            </div>

            <div class="mt-3 flex flex-col gap-6">
              <Button
                type="submit"
                :disabled="loading"
                class="h-12 w-full rounded-[8px] bg-forest text-[14px] font-semibold text-white hover:bg-forest/90"
              >
                {{ isStaffInvite ? 'Aceitar convite' : 'Criar conta' }}
              </Button>
              <p class="text-center text-[14px] text-forest">
                Já tem conta?
                <NuxtLink to="/login" class="font-semibold underline"
                  >Entre aqui.</NuxtLink
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
