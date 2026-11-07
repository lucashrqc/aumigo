<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Cadastrar raça — Admin' })

const { mutateAsync: createBreed, isPending: creating } = useCreateBreed()

async function handleCreate(payload: Parameters<typeof createBreed>[0]) {
  try {
    await createBreed(payload)
    toast.success('Raça criada')
    await navigateTo('/admin/breeds')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível criar a raça'))
  }
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center gap-3">
      <Button as-child variant="ghost" size="sm"
        ><NuxtLink to="/admin/breeds">← Voltar</NuxtLink></Button
      >
      <h1 class="text-2xl font-bold">Cadastrar raça</h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Nova raça</CardTitle>
        <CardDescription>Adicione uma raça ao catálogo.</CardDescription>
      </CardHeader>
      <CardContent>
        <BreedForm :submitting="creating" @submit="handleCreate" />
      </CardContent>
    </Card>
  </div>
</template>
