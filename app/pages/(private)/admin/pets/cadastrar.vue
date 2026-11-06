<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Cadastrar pet — Admin' })

const { mutateAsync: createPet, isPending: creating } = useCreatePet()

async function handleCreate(payload: Parameters<typeof createPet>[0]) {
  try {
    await createPet(payload)
    toast.success('Pet criado')
    await navigateTo('/admin/pets')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível criar o pet'))
  }
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center gap-3">
      <Button as-child variant="ghost" size="sm"><NuxtLink to="/admin/pets">← Voltar</NuxtLink></Button>
      <h1 class="text-2xl font-bold">Cadastrar pet</h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Novo pet</CardTitle>
        <CardDescription>Adicione um pet ao catálogo de adoção.</CardDescription>
      </CardHeader>
      <CardContent>
        <PetForm :submitting="creating" @submit="handleCreate" />
      </CardContent>
    </Card>
  </div>
</template>
