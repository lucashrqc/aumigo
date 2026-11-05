<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const { data: pet, isLoading } = useAdminPetQuery(id)
useHead(() => ({ title: pet.value ? `${pet.value.name} — Admin` : 'Pet — Admin' }))

const { mutateAsync: updatePet, isPending: saving } = useUpdatePet()

async function handleUpdate(payload: Parameters<typeof updatePet>[0]['body']) {
  try {
    await updatePet({ id: id.value, body: payload })
    toast.success('Pet updated')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Could not update pet'))
  }
}

// --- Vaccination records ---
const { data: applied } = usePetVaccinesQuery(id)
const { data: vaccines } = useVaccinesQuery()
const { mutateAsync: applyVaccine, isPending: applying } = useApplyVaccine()

const vax = reactive({ vaccineId: '', applicationDate: '', nextDoseDate: '', vetLicense: '', batchNumber: '' })

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
    toast.success('Vaccine recorded')
    vax.vaccineId = ''
    vax.applicationDate = ''
    vax.nextDoseDate = ''
    vax.vetLicense = ''
    vax.batchNumber = ''
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Could not record vaccine'))
  }
}

const vaccineName = (vaccineId: string) => vaccines.value?.find((v) => v.id === vaccineId)?.name ?? vaccineId
</script>

<template>
  <div v-if="isLoading" class="text-muted-foreground">Loading…</div>
  <div v-else-if="!pet" class="text-muted-foreground">Pet not found.</div>

  <div v-else class="space-y-8">
    <div class="flex items-center gap-3">
      <Button as-child variant="ghost" size="sm"><NuxtLink to="/admin/pets">← Back</NuxtLink></Button>
      <h1 class="text-2xl font-bold">{{ pet.name }}</h1>
    </div>

    <Card>
      <CardHeader><CardTitle>Details</CardTitle></CardHeader>
      <CardContent>
        <PetForm :initial="pet" :submitting="saving" @submit="handleUpdate" />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Vaccination records</CardTitle>
        <CardDescription>Track applied vaccines for this pet.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vaccine</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Next dose</TableHead>
              <TableHead>Batch</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="a in applied ?? []" :key="a.id">
              <TableCell>{{ vaccineName(a.vaccineId) }}</TableCell>
              <TableCell>{{ a.applicationDate }}</TableCell>
              <TableCell>{{ a.nextDoseDate ?? '—' }}</TableCell>
              <TableCell>{{ a.batchNumber ?? '—' }}</TableCell>
            </TableRow>
            <TableEmpty v-if="!applied?.length" :colspan="4">No vaccines recorded yet.</TableEmpty>
          </TableBody>
        </Table>

        <form class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" @submit.prevent="recordVaccine">
          <div>
            <Label>Vaccine</Label>
            <Select v-model="vax.vaccineId">
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="v in vaccines ?? []" :key="v.id" :value="v.id">{{ v.name }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Application date</Label>
            <Input v-model="vax.applicationDate" type="date" required />
          </div>
          <div>
            <Label>Next dose</Label>
            <Input v-model="vax.nextDoseDate" type="date" />
          </div>
          <div>
            <Label>Vet license (CRMV)</Label>
            <Input v-model="vax.vetLicense" />
          </div>
          <div>
            <Label>Batch number</Label>
            <Input v-model="vax.batchNumber" />
          </div>
          <div class="flex items-end">
            <Button type="submit" :disabled="applying || !vax.vaccineId">Record vaccine</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
