<script setup lang="ts">
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'public' })
useHead({ title: 'Entrar — Aumor' })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const auth = useAuthStore()
const email = ref('')
const password = ref('')
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
    const redirect = (route.query.redirect as string) || (auth.isStaff ? '/admin' : '/')
    await navigateTo(redirect)
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Falha ao entrar')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm py-8">
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Bem-vindo de volta à Aumor.</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="submit">
          <div class="space-y-2">
            <Label for="email">E-mail</Label>
            <Input id="email" v-model="email" type="email" required autocomplete="email" />
          </div>
          <div class="space-y-2">
            <Label for="password">Senha</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
            />
          </div>
          <Button type="submit" class="w-full" :disabled="loading">Entrar</Button>
        </form>
      </CardContent>
      <CardFooter class="justify-center text-sm text-muted-foreground">
        Não tem conta?
        <NuxtLink to="/register" class="ml-1 underline">Crie uma</NuxtLink>
      </CardFooter>
    </Card>
  </div>
</template>
