<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: pet, isLoading } = useAdminPetQuery(id)
useHead(() => ({
  title: pet.value ? `${pet.value.name} — Admin` : 'Pet — Admin',
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
const vaccineOptions = useVaccineOptions()
const { mutateAsync: applyVaccine, isPending: applying } = useApplyVaccine()

const vax = reactive({
  vaccineId: '',
  applicationDate: '',
  nextDoseDate: '',
  vetLicense: '',
  batchNumber: '',
})

async function recordVaccine() {
  try {
    await applyVaccine({
      petId: id.value,
      vaccineId: vax.vaccineId,
      applicationDate: vax.applicationDate,
      nextDoseDate: vax.nextDoseDate || null,
      vetLicense: vax.vetLicense || null,
      batchNumber: vax.batchNumber || null,
    })
    toast.success('Vacina registrada')
    vax.vaccineId = ''
    vax.applicationDate = ''
    vax.nextDoseDate = ''
    vax.vetLicense = ''
    vax.batchNumber = ''
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível registrar a vacina'))
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
      <h1 class="text-2xl font-bold">{{ pet.name }}</h1>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="a in applied ?? []" :key="a.id">
              <TableCell>{{ vaccineName(a.vaccineId) }}</TableCell>
              <TableCell>{{ a.applicationDate }}</TableCell>
              <TableCell>{{ a.nextDoseDate ?? '—' }}</TableCell>
              <TableCell>{{ a.batchNumber ?? '—' }}</TableCell>
            </TableRow>
            <TableEmpty v-if="!applied?.length" :colspan="4"
              >Nenhuma vacina registrada ainda.</TableEmpty
            >
          </TableBody>
        </Table>

        <form
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          @submit.prevent="recordVaccine"
        >
          <div>
            <Label>Vacina</Label>
            <AsyncCombobox
              v-model="vax.vaccineId"
              :items="vaccineOptions.items"
              :is-fetching="vaccineOptions.isFetching"
              :is-fetching-next-page="vaccineOptions.isFetchingNextPage"
              :has-next-page="vaccineOptions.hasNextPage"
              :resolve-by-id="vaccineOptions.resolveById"
              option-value="id"
              option-label="name"
              placeholder="Selecione a vacina"
              search-placeholder="Buscar vacina…"
              @search="vaccineOptions.setSearch"
              @can-load-more="vaccineOptions.loadMore"
            />
          </div>
          <div>
            <Label>Data de aplicação</Label>
            <Input v-model="vax.applicationDate" type="date" required />
          </div>
          <div>
            <Label>Próxima dose</Label>
            <Input v-model="vax.nextDoseDate" type="date" />
          </div>
          <div>
            <Label>CRMV do veterinário</Label>
            <Input v-model="vax.vetLicense" />
          </div>
          <div>
            <Label>Número do lote</Label>
            <Input v-model="vax.batchNumber" />
          </div>
          <div class="flex items-end">
            <Button type="submit" :disabled="applying || !vax.vaccineId"
              >Registrar vacina</Button
            >
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
