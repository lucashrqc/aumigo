<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Cadastrar vacina — Admin' })

const { mutateAsync: createVaccine, isPending: creating } = useCreateVaccine()

async function handleCreate(payload: Parameters<typeof createVaccine>[0]) {
  try {
    await createVaccine(payload)
    toast.success('Vacina criada')
    await navigateTo('/admin/vaccines')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível criar a vacina'))
  }
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center gap-3">
      <Button as-child variant="ghost" size="sm"
        ><NuxtLink to="/admin/vaccines">← Voltar</NuxtLink></Button
      >
      <h1 class="text-2xl font-bold">Cadastrar vacina</h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Nova vacina</CardTitle>
        <CardDescription>Adicione uma vacina ao catálogo.</CardDescription>
      </CardHeader>
      <CardContent>
        <VaccineForm :submitting="creating" @submit="handleCreate" />
      </CardContent>
    </Card>
  </div>
</template>
