<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'
import { authClient } from '@/lib/auth-client'
import { toast } from 'vue-sonner'

const props = defineProps<{ token: string }>()
const emit = defineEmits<{ (e: 'success'): void }>()

const password = ref('')
const confirm = ref('')
const showPassword = ref(false)
const loading = ref(false)

async function submit() {
  if (password.value !== confirm.value) {
    toast.error('As senhas não coincidem')
    return
  }
  loading.value = true
  try {
    const { error } = await authClient.resetPassword({
      newPassword: password.value,
      token: props.token,
    })
    if (error)
      throw new Error(
        error.message || 'Link inválido ou expirado. Solicite um novo.',
      )
    emit('success')
  } catch (err) {
    toast.error(
      err instanceof Error ? err.message : 'Falha ao redefinir a senha',
    )
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="submit">
    <div class="flex flex-col gap-2">
      <Label for="reset-password" class="text-[14px] font-medium text-forest"
        >Nova senha</Label
      >
      <div class="relative">
        <Input
          id="reset-password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          required
          minlength="8"
          autocomplete="new-password"
          placeholder="Mínimo de 8 caracteres"
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

    <div class="flex flex-col gap-2">
      <Label for="reset-confirm" class="text-[14px] font-medium text-forest"
        >Confirmar nova senha</Label
      >
      <Input
        id="reset-confirm"
        v-model="confirm"
        :type="showPassword ? 'text' : 'password'"
        required
        minlength="8"
        autocomplete="new-password"
        placeholder="Repita a nova senha"
        class="h-12 rounded-xl border-brand bg-white text-[14px] text-forest placeholder:text-forest/50"
      />
    </div>

    <Button
      type="submit"
      :disabled="loading"
      class="h-12 w-full rounded-xl bg-forest text-[14px] font-semibold text-white hover:bg-forest/90"
    >
      Redefinir senha
    </Button>
  </form>
</template>
