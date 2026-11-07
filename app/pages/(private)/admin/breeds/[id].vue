<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: breed, isLoading } = useBreedByIdQuery(id)
useHead(() => ({ title: breed.value ? `${breed.value.name} — Admin` : 'Raça — Admin' }))

const { mutateAsync: updateBreed, isPending: saving } = useUpdateBreed()

async function handleUpdate(payload: Parameters<typeof updateBreed>[0]['body']) {
  try {
    await updateBreed({ id: id.value, body: payload })
    toast.success('Raça atualizada')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível atualizar a raça'))
  }
}
</script>

<template>
  <div v-if="isLoading" class="text-muted-foreground">Carregando…</div>
  <div v-else-if="!breed" class="text-muted-foreground">Raça não encontrada.</div>

  <div v-else class="space-y-8">
    <div class="flex items-center gap-3">
      <Button as-child variant="ghost" size="sm"
        ><NuxtLink to="/admin/breeds">← Voltar</NuxtLink></Button
      >
      <h1 class="text-2xl font-bold">{{ breed.name }}</h1>
    </div>

    <Card>
      <CardHeader><CardTitle>Detalhes</CardTitle></CardHeader>
      <CardContent>
        <BreedForm :initial="breed" :submitting="saving" @submit="handleUpdate" />
      </CardContent>
    </Card>
  </div>
</template>
