<script setup lang="ts">
import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'public' })
useHead({ title: 'Sign in — Aumor' })

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
    if (error) throw new Error(error.message || 'Invalid credentials')
    await auth.fetchSession()
    const redirect = (route.query.redirect as string) || (auth.isStaff ? '/admin' : '/')
    await navigateTo(redirect)
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Sign in failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm py-8">
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Welcome back to Aumor.</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="submit">
          <div>
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" required autocomplete="email" />
          </div>
          <div>
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
            />
          </div>
          <Button type="submit" class="w-full" :disabled="loading">Sign in</Button>
        </form>
      </CardContent>
      <CardFooter class="justify-center text-sm text-muted-foreground">
        No account?
        <NuxtLink to="/register" class="ml-1 underline">Create one</NuxtLink>
      </CardFooter>
    </Card>
  </div>
</template>
