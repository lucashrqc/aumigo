<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

const emit = defineEmits<{ (e: 'success'): void }>()

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
    emit('success')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Falha ao entrar')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="submit">
    <div class="flex flex-col gap-2">
      <Label for="login-email" class="text-[14px] font-medium text-forest"
        >E-mail</Label
      >
      <Input
        id="login-email"
        v-model="email"
        type="email"
        required
        autocomplete="email"
        placeholder="voce@exemplo.com"
        class="h-12 rounded-xl border-brand bg-white text-[14px] text-forest placeholder:text-forest/50"
      />
    </div>

    <div class="flex flex-col gap-2">
      <Label for="login-password" class="text-[14px] font-medium text-forest"
        >Senha</Label
      >
      <div class="relative">
        <Input
          id="login-password"
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
          <component :is="showPassword ? EyeOff : Eye" class="size-4.5" />
        </button>
      </div>
    </div>

    <Button
      type="submit"
      :disabled="loading"
      class="h-12 w-full rounded-xl bg-forest text-[14px] font-semibold text-white hover:bg-forest/90"
    >
      Entrar
    </Button>
  </form>
</template>
