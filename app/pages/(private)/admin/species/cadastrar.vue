<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Cadastrar espécie — Admin' })

const { mutateAsync: createSpecies, isPending: creating } = useCreateSpecies()

async function handleCreate(payload: Parameters<typeof createSpecies>[0]) {
  try {
    await createSpecies(payload)
    toast.success('Espécie criada')
    await navigateTo('/admin/species')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível criar a espécie'))
  }
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center gap-3">
      <Button as-child variant="ghost" size="sm"
        ><NuxtLink to="/admin/species">← Voltar</NuxtLink></Button
      >
      <h1 class="text-2xl font-bold">Cadastrar espécie</h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Nova espécie</CardTitle>
        <CardDescription>Adicione uma espécie ao catálogo.</CardDescription>
      </CardHeader>
      <CardContent>
        <SpeciesForm :submitting="creating" @submit="handleCreate" />
      </CardContent>
    </Card>
  </div>
</template>
