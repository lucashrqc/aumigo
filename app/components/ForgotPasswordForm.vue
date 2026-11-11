<script setup lang="ts">
import { authClient } from '@/lib/auth-client'
import { toast } from 'vue-sonner'
import { resolveAuthErrorMessage } from '#shared/utils/auth-error-messages'

const email = ref('')
const loading = ref(false)
const sent = ref(false)

async function submit() {
  loading.value = true
  try {
    const { error } = await authClient.requestPasswordReset({
      email: email.value,
      redirectTo: '/reset-password',
    })
    if (error)
      throw new Error(
        resolveAuthErrorMessage(error, 'Não foi possível enviar o e-mail'),
      )
    sent.value = true
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Falha ao enviar o e-mail')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    v-if="sent"
    class="rounded-xl border border-brand bg-white p-5 text-[14px] leading-normal text-forest"
  >
    Se existir uma conta com esse e-mail, enviamos um link para redefinir a
    senha. Verifique sua caixa de entrada (e o spam).
  </div>

  <form v-else class="flex flex-col gap-5" @submit.prevent="submit">
    <div class="flex flex-col gap-2">
      <Label for="forgot-email" class="text-[14px] font-medium text-forest"
        >E-mail</Label
      >
      <Input
        id="forgot-email"
        v-model="email"
        type="email"
        required
        autocomplete="email"
        placeholder="voce@exemplo.com"
        class="h-12 rounded-xl border-brand bg-white text-[14px] text-forest placeholder:text-forest/50"
      />
    </div>

    <Button
      type="submit"
      :disabled="loading"
      class="h-12 w-full rounded-xl bg-forest text-[14px] font-semibold text-white hover:bg-forest/90"
    >
      Enviar link de redefinição
    </Button>
  </form>
</template>
