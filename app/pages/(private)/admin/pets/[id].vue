<script setup lang="ts">
import AppliedVaccineEditDialog from '@/components/AppliedVaccineEditDialog.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { Pencil, Trash2 } from '@lucide/vue'
import type { AppliedVaccineFieldsInput } from '#shared/schemas'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: pet, isLoading } = useAdminPetQuery(id)
useHead(() => ({
  title: pet.value ? `${petDisplayName(pet.value)} — Admin` : 'Pet — Admin',
}))

const { mutateAsync: updatePet, isPending: saving } = useUpdatePet()

async function handleUpdate(payload: Parameters<typeof updatePet>[0]['body']) {
  try {
    await updatePet({ id: id.value, body: payload })
    toast.success('Pet atualizado')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível atualizar o pet'))
  }
}

// --- Vaccination records ---
const { data: applied } = usePetVaccinesQuery(id)
const { data: vaccines } = useVaccinesQuery()
const { mutateAsync: applyVaccine } = useApplyVaccine()
const { mutateAsync: updateApplied } = useUpdateAppliedVaccine()
const { mutateAsync: deleteApplied } = useDeleteAppliedVaccine()

const dialog = useDialog()
// Remount the add form after a successful registration to clear its fields.
const formKey = ref(0)

async function handleApply(payload: AppliedVaccineFieldsInput) {
  try {
    await applyVaccine({ petId: id.value, ...payload })
    toast.success('Vacina registrada')
    formKey.value++
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível registrar a vacina'))
  }
}

async function handleEdit(row: AppliedVaccineDto) {
  const payload = await dialog.open<AppliedVaccineFieldsInput | undefined>(
    AppliedVaccineEditDialog,
    {
      dialogProps: {
        title: 'Editar registro de vacina',
        description: 'Atualize os dados da vacina aplicada.',
        class: 'max-w-2xl',
      },
      props: { initial: row },
    },
  )
  if (!payload) return
  try {
    await updateApplied({ id: row.id, petId: id.value, body: payload })
    toast.success('Registro atualizado')
  } catch (err) {
    toast.error(
      resolveErrorMessage(err, 'Não foi possível atualizar o registro'),
    )
  }
}

async function handleRemove(row: AppliedVaccineDto) {
  const ok = await dialog.open<boolean>(ConfirmDialog, {
    dialogProps: { class: 'max-w-md' },
    props: {
      title: 'Remover registro de vacina',
      description: `Remover o registro de ${vaccineName(row.vaccineId)}?`,
      confirmText: 'Remover',
      destructive: true,
    },
  })
  if (!ok) return
  try {
    await deleteApplied({ id: row.id, petId: id.value })
    toast.success('Registro removido')
  } catch (err) {
    toast.error(resolveErrorMessage(err))
  }
}

const vaccineName = (vaccineId: string) =>
  vaccines.value?.find((v) => v.id === vaccineId)?.name ?? vaccineId
</script>

<template>
  <div v-if="isLoading" class="text-muted-foreground">Carregando…</div>
  <div v-else-if="!pet" class="text-muted-foreground">Pet não encontrado.</div>

  <div v-else class="space-y-8">
    <div class="flex items-center gap-3">
      <Button as-child variant="ghost" size="sm"
        ><NuxtLink to="/admin/pets">← Voltar</NuxtLink></Button
      >
      <h1 class="text-2xl font-bold">{{ petDisplayName(pet) }}</h1>
    </div>

    <Card>
      <CardHeader><CardTitle>Detalhes</CardTitle></CardHeader>
      <CardContent>
        <PetForm :initial="pet" :submitting="saving" @submit="handleUpdate" />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Registros de vacinação</CardTitle>
        <CardDescription
          >Acompanhe as vacinas aplicadas neste pet.</CardDescription
        >
      </CardHeader>
      <CardContent class="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vacina</TableHead>
              <TableHead>Aplicada</TableHead>
              <TableHead>Próxima dose</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead class="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="a in applied ?? []" :key="a.id">
              <TableCell>{{ vaccineName(a.vaccineId) }}</TableCell>
              <TableCell>{{ formatDate(a.applicationDate) }}</TableCell>
              <TableCell>{{ formatDate(a.nextDoseDate) }}</TableCell>
              <TableCell>{{ a.batchNumber ?? '—' }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar"
                    @click="handleEdit(a)"
                  >
                    <Pencil class="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="text-destructive"
                    aria-label="Remover"
                    @click="handleRemove(a)"
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableEmpty v-if="!applied?.length" :colspan="5"
              >Nenhuma vacina registrada ainda.</TableEmpty
            >
          </TableBody>
        </Table>

        <AppliedVaccineForm :key="formKey" @submit="handleApply" />
      </CardContent>
    </Card>
  </div>
</template>
