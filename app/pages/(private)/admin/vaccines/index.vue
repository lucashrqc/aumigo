<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Vaccines — Admin' })

const { data: vaccines, isLoading } = useVaccinesQuery()
const { mutateAsync: createVaccine, isPending } = useCreateVaccine()

const form = reactive({ name: '', description: '', expirationDate: '' })

async function submit() {
  try {
    await createVaccine({
      name: form.name,
      description: form.description || null,
      expirationDate: form.expirationDate || null,
    })
    form.name = ''
    form.description = ''
    form.expirationDate = ''
    toast.success('Vaccine added')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Could not add vaccine'))
  }
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Vaccines</h1>

    <Card>
      <CardHeader><CardTitle>Add vaccine</CardTitle></CardHeader>
      <CardContent>
        <form class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end" @submit.prevent="submit">
          <div>
            <Label>Name</Label>
            <Input v-model="form.name" required />
          </div>
          <div>
            <Label>Description</Label>
            <Input v-model="form.description" />
          </div>
          <div>
            <Label>Expiration date</Label>
            <Input v-model="form.expirationDate" type="date" />
          </div>
          <Button type="submit" :disabled="isPending">Add</Button>
        </form>
      </CardContent>
    </Card>

    <p v-if="isLoading" class="text-muted-foreground">Loading…</p>
    <Table v-else class="rounded-md border">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Expiration</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="v in vaccines ?? []" :key="v.id">
          <TableCell class="font-medium">{{ v.name }}</TableCell>
          <TableCell>{{ v.description ?? '—' }}</TableCell>
          <TableCell>{{ v.expirationDate ?? '—' }}</TableCell>
        </TableRow>
        <TableEmpty v-if="!vaccines?.length" :colspan="3">No vaccines yet.</TableEmpty>
      </TableBody>
    </Table>
  </div>
</template>
