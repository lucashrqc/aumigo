<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: species, isLoading } = useSpeciesByIdQuery(id)
useHead(() => ({ title: species.value ? `${species.value.name} — Admin` : 'Espécie — Admin' }))

const { mutateAsync: updateSpecies, isPending: saving } = useUpdateSpecies()

async function handleUpdate(payload: Parameters<typeof updateSpecies>[0]['body']) {
  try {
    await updateSpecies({ id: id.value, body: payload })
    toast.success('Espécie atualizada')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível atualizar a espécie'))
  }
}
</script>

<template>
  <div v-if="isLoading" class="text-muted-foreground">Carregando…</div>
  <div v-else-if="!species" class="text-muted-foreground">Espécie não encontrada.</div>

  <div v-else class="space-y-8">
    <div class="flex items-center gap-3">
      <Button as-child variant="ghost" size="sm"
        ><NuxtLink to="/admin/species">← Voltar</NuxtLink></Button
      >
      <h1 class="text-2xl font-bold">{{ species.name }}</h1>
    </div>

    <Card>
      <CardHeader><CardTitle>Detalhes</CardTitle></CardHeader>
      <CardContent>
        <SpeciesForm :initial="species" :submitting="saving" @submit="handleUpdate" />
      </CardContent>
    </Card>
  </div>
</template>
