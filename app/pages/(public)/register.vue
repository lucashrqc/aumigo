<script setup lang="ts">
import { toast } from 'vue-sonner'
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/stores/auth'

definePageMeta({ layout: 'public' })
useHead({ title: 'Criar conta — Aumor' })

const route = useRoute()
const auth = useAuthStore()

const inviteToken = computed(() => (route.query.invite as string) || '')
const isStaffInvite = computed(() => inviteToken.value.length > 0)

const name = ref('')
const email = ref('')
const password = ref('')
const phone = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    if (isStaffInvite.value) {
      // Staff registration consumes the invitation server-side (sets the role).
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
      if (error) throw new Error(error.message || 'Não foi possível criar a conta')
    }

    await auth.fetchSession()
    if (!auth.isAuthenticated) {
      // Staff invite path does not auto-login; send them to sign in.
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
  <div class="mx-auto max-w-sm py-8">
    <Card>
      <CardHeader>
        <CardTitle>{{ isStaffInvite ? 'Junte-se à equipe Aumor' : 'Crie sua conta' }}</CardTitle>
        <CardDescription>
          {{
            isStaffInvite
              ? 'Conclua seu cadastro de staff a partir do convite.'
              : 'Cadastre-se para adotar um pet.'
          }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="submit">
          <div>
            <Label for="name">Nome</Label>
            <Input id="name" v-model="name" required autocomplete="name" />
          </div>
          <div v-if="!isStaffInvite">
            <Label for="email">E-mail</Label>
            <Input id="email" v-model="email" type="email" required autocomplete="email" />
          </div>
          <div v-if="isStaffInvite">
            <Label for="phone">Telefone (opcional)</Label>
            <Input id="phone" v-model="phone" autocomplete="tel" />
          </div>
          <div>
            <Label for="password">Senha</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              required
              minlength="8"
              autocomplete="new-password"
            />
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ isStaffInvite ? 'Aceitar convite' : 'Criar conta' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
