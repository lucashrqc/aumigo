<script setup lang="ts">
import type { AddressUpsertInput, ProfileUpdateInput } from '#shared/schemas'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Configurações — Admin' })

const auth = useAuthStore()
const { data: profile, isLoading } = useProfileQuery()
const { mutateAsync: updateProfile, isPending: saving } = useUpdateProfile()

const { data: address, isLoading: addressLoading } = useAddressQuery()
const { mutateAsync: updateAddress, isPending: addressSaving } =
  useUpdateAddress()

const avatarSaving = ref(false)

async function saveAvatar(image: string | null) {
  avatarSaving.value = true
  try {
    await $fetch('/api/me/avatar', { method: 'PATCH', body: { image } })
    await auth.fetchSession()
    toast.success('Foto atualizada')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível atualizar a foto'))
  } finally {
    avatarSaving.value = false
  }
}

async function handleUpdateProfile(payload: ProfileUpdateInput) {
  try {
    await updateProfile(payload)
    await auth.fetchSession()
    toast.success('Perfil atualizado')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível atualizar o perfil'))
  }
}

async function handleUpdateAddress(payload: AddressUpsertInput) {
  try {
    await updateAddress(payload)
    toast.success('Endereço atualizado')
  } catch (err) {
    toast.error(
      resolveErrorMessage(err, 'Não foi possível atualizar o endereço'),
    )
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
      <TabsContent value="profile" class="space-y-10">
        <section class="flex flex-col w-fit items-center gap-4">
          <Avatar class="h-32 w-32">
            <AvatarImage
              :src="auth.user?.image ?? ''"
              :alt="auth.user?.name ?? ''"
            />
            <AvatarFallback>
              {{ getInitials(auth.user?.name) }}
            </AvatarFallback>
          </Avatar>
          <div class="flex flex-col items-start gap-1">
            <ImageUploader
              handle-upload-url="/api/me/avatar-upload"
              path-prefix="avatars/"
              label="Alterar foto"
              :max-size-mb="2"
              :disabled="avatarSaving"
              @uploaded="saveAvatar"
            />
            <button
              v-if="auth.user?.image"
              type="button"
              class="text-muted-foreground px-1 text-xs hover:underline"
              :disabled="avatarSaving"
              @click="saveAvatar(null)"
            >
              Remover foto
            </button>
          </div>
        </section>

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
              Seu endereço de contato.
            </p>
          </div>
          <AddressForm
            :key="address?.id"
            :initial="address"
            :submitting="addressSaving"
            :is-loading="addressLoading"
            @submit="handleUpdateAddress"
          />
        </section>
      </TabsContent>
    </Tabs>
  </div>
</template>
