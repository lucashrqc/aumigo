<script setup lang="ts">
import { Trash2 } from '@lucide/vue'
import type { AppliedVaccineFieldsInput } from '#shared/schemas'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Cadastrar pet — Admin' })

const { mutateAsync: createPet, isPending: creating } = useCreatePet()
const { data: vaccines } = useVaccinesQuery()

// Vaccines collected locally and persisted atomically with the pet on submit.
const draftVaccines = ref<AppliedVaccineFieldsInput[]>([])
const vaccineFormKey = ref(0)

function addVaccine(payload: AppliedVaccineFieldsInput) {
  draftVaccines.value.push(payload)
  vaccineFormKey.value++
}

function removeVaccine(index: number) {
  draftVaccines.value.splice(index, 1)
}

const vaccineName = (vaccineId: string) =>
  vaccines.value?.find((v) => v.id === vaccineId)?.name ?? vaccineId

async function handleCreate(payload: Parameters<typeof createPet>[0]) {
  try {
    await createPet({ ...payload, appliedVaccines: draftVaccines.value })
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
      <Button as-child variant="ghost" size="sm"
        ><NuxtLink to="/admin/pets">← Voltar</NuxtLink></Button
      >
      <h1 class="text-2xl font-bold">Cadastrar pet</h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Vacinas (opcional)</CardTitle>
        <CardDescription
          >Adicione vacinas já aplicadas — elas serão registradas junto com o
          pet ao salvar.</CardDescription
        >
      </CardHeader>
      <CardContent class="space-y-6">
        <Table v-if="draftVaccines.length">
          <TableHeader>
            <TableRow>
              <TableHead>Vacina</TableHead>
              <TableHead>Aplicada</TableHead>
              <TableHead>Próxima dose</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead class="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="(v, index) in draftVaccines" :key="index">
              <TableCell>{{ vaccineName(v.vaccineId) }}</TableCell>
              <TableCell>{{ formatDate(v.applicationDate) }}</TableCell>
              <TableCell>{{ formatDate(v.nextDoseDate) }}</TableCell>
              <TableCell>{{ v.batchNumber ?? '—' }}</TableCell>
              <TableCell class="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  class="text-destructive"
                  aria-label="Remover"
                  @click="removeVaccine(index)"
                >
                  <Trash2 class="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <AppliedVaccineForm
          :key="vaccineFormKey"
          submit-label="Adicionar vacina"
          @submit="addVaccine"
        />
      </CardContent>
    </Card>

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
