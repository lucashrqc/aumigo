<script setup lang="ts">
import type { ProfileUpdateInput } from '#shared/schemas'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Configurações — Admin' })

const auth = useAuthStore()
const { data: profile, isLoading } = useProfileQuery()
const { mutateAsync: updateProfile, isPending: saving } = useUpdateProfile()

async function handleUpdateProfile(payload: ProfileUpdateInput) {
  try {
    await updateProfile(payload)
    await auth.fetchSession()
    toast.success('Perfil atualizado')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível atualizar o perfil'))
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Configurações</h1>
      <p class="text-muted-foreground text-sm">
        Gerencie suas informações pessoais e preferências.
      </p>
    </div>

    <Tabs default-value="profile" class="gap-6 px-4 py-2">
      <TabsList>
        <TabsTrigger value="profile">Perfil</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" class="space-y-10">
        <section>
          <div class="mb-4">
            <h2 class="text-base font-semibold">Informações pessoais</h2>
            <p class="text-muted-foreground text-sm">
              Atualize seu nome e telefone de contato.
            </p>
          </div>
          <ProfileForm
            :key="profile?.id"
            :initial="profile"
            :email="auth.user?.email"
            :submitting="saving"
            :is-loading="isLoading"
            @submit="handleUpdateProfile"
          />
        </section>

        <Separator />

        <section>
          <div class="mb-4">
            <h2 class="text-base font-semibold">Endereço</h2>
            <p class="text-muted-foreground text-sm">
              Seu endereço de contato. A seleção de estado e cidade estará
              disponível em breve.
            </p>
          </div>
          <AddressForm />
        </section>
      </TabsContent>
    </Tabs>
  </div>
</template>
