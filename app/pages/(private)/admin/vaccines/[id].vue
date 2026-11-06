<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: vaccine, isLoading } = useVaccineQuery(id)
useHead(() => ({ title: vaccine.value ? `${vaccine.value.name} — Admin` : 'Vacina — Admin' }))

const { mutateAsync: updateVaccine, isPending: saving } = useUpdateVaccine()

async function handleUpdate(payload: Parameters<typeof updateVaccine>[0]['body']) {
  try {
    await updateVaccine({ id: id.value, body: payload })
    toast.success('Vacina atualizada')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível atualizar a vacina'))
  }
}
</script>

<template>
  <div v-if="isLoading" class="text-muted-foreground">Carregando…</div>
  <div v-else-if="!vaccine" class="text-muted-foreground">Vacina não encontrada.</div>

  <div v-else class="space-y-8">
    <div class="flex items-center gap-3">
      <Button as-child variant="ghost" size="sm"
        ><NuxtLink to="/admin/vaccines">← Voltar</NuxtLink></Button
      >
      <h1 class="text-2xl font-bold">{{ vaccine.name }}</h1>
    </div>

    <Card>
      <CardHeader><CardTitle>Detalhes</CardTitle></CardHeader>
      <CardContent>
        <VaccineForm :initial="vaccine" :submitting="saving" @submit="handleUpdate" />
      </CardContent>
    </Card>
  </div>
</template>
