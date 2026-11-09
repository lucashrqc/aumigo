<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ invite?: string }>()
const emit = defineEmits<{ (e: 'success'): void }>()

const auth = useAuthStore()
const isStaffInvite = computed(() => Boolean(props.invite))

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
          token: props.invite,
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
    emit('success')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Falha no cadastro'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="submit">
    <div class="flex flex-col gap-2">
      <Label for="register-name" class="text-[14px] font-medium text-forest"
        >Nome</Label
      >
      <Input
        id="register-name"
        v-model="name"
        required
        autocomplete="name"
        placeholder="Seu nome completo"
        class="h-12 rounded-xl border-brand bg-white text-[14px] text-forest placeholder:text-forest/50"
      />
    </div>

    <div v-if="!isStaffInvite" class="flex flex-col gap-2">
      <Label for="register-email" class="text-[14px] font-medium text-forest"
        >E-mail</Label
      >
      <Input
        id="register-email"
        v-model="email"
        type="email"
        required
        autocomplete="email"
        placeholder="voce@exemplo.com"
        class="h-12 rounded-xl border-brand bg-white text-[14px] text-forest placeholder:text-forest/50"
      />
    </div>

    <div v-if="isStaffInvite" class="flex flex-col gap-2">
      <Label for="register-phone" class="text-[14px] font-medium text-forest">
        Telefone (opcional)
      </Label>
      <Input
        id="register-phone"
        v-model="phone"
        autocomplete="tel"
        placeholder="(00) 00000-0000"
        class="h-12 rounded-xl border-brand bg-white text-[14px] text-forest placeholder:text-forest/50"
      />
    </div>

    <div class="flex flex-col gap-2">
      <Label for="register-password" class="text-[14px] font-medium text-forest"
        >Senha</Label
      >
      <div class="relative">
        <Input
          id="register-password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          required
          minlength="8"
          autocomplete="new-password"
          placeholder="Crie uma senha"
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
      <p class="text-[13px] text-forest/60">Use pelo menos 8 caracteres.</p>
    </div>

    <Button
      type="submit"
      :disabled="loading"
      class="h-12 w-full rounded-xl bg-forest text-[14px] font-semibold text-white hover:bg-forest/90"
    >
      {{ isStaffInvite ? 'Aceitar convite' : 'Criar conta' }}
    </Button>
  </form>
</template>
