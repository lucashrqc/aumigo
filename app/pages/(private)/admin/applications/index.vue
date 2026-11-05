<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Candidaturas — Admin' })

const statusFilter = ref('pending')
const page = ref(1)
const params = computed(() => ({
  page: page.value,
  pageSize: 10,
  status: statusFilter.value === 'all' ? undefined : (statusFilter.value as 'pending' | 'approved' | 'rejected'),
}))
const { data, isLoading } = useAdminApplicationsQuery(params)
const { mutateAsync: review, isPending } = useReviewApplication()

watch(statusFilter, () => (page.value = 1))

async function decide(id: string, decision: 'approved' | 'rejected') {
  try {
    await review({ id, body: { decision } })
    toast.success(decision === 'approved' ? 'Candidatura aprovada' : 'Candidatura rejeitada')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível atualizar a candidatura'))
  }
}

const statusVariant = (s: string) =>
  s === 'approved' ? 'success' : s === 'rejected' ? 'destructive' : 'warning'
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Candidaturas de adoção</h1>
      <div class="w-48">
        <Select v-model="statusFilter">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="approved">Aprovada</SelectItem>
            <SelectItem value="rejected">Rejeitada</SelectItem>
            <SelectItem value="all">Todas</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <p v-if="isLoading" class="text-muted-foreground">Carregando…</p>
    <template v-else>
      <Table class="rounded-md border">
        <TableHeader>
          <TableRow>
            <TableHead>Pet</TableHead>
            <TableHead>Adotante</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="app in data?.items ?? []" :key="app.id">
            <TableCell class="font-medium">
              <NuxtLink :to="`/admin/pets/${app.petId}`" class="hover:underline">
                {{ app.pet?.name ?? '—' }}
              </NuxtLink>
            </TableCell>
            <TableCell>
              <div>{{ app.adopter?.name }}</div>
              <div class="text-xs text-muted-foreground">{{ app.adopter?.email }}</div>
            </TableCell>
            <TableCell>{{ app.contactPhone ?? '—' }}</TableCell>
            <TableCell><Badge :variant="statusVariant(app.status)">{{ applicationStatusLabel(app.status) }}</Badge></TableCell>
            <TableCell class="text-right">
              <div v-if="app.status === 'pending'" class="flex justify-end gap-2">
                <Button size="sm" :disabled="isPending" @click="decide(app.id, 'approved')">
                  Aprovar
                </Button>
                <Button size="sm" variant="outline" :disabled="isPending" @click="decide(app.id, 'rejected')">
                  Rejeitar
                </Button>
              </div>
              <span v-else class="text-sm text-muted-foreground">Analisada</span>
            </TableCell>
          </TableRow>
          <TableEmpty v-if="!data?.items.length" :colspan="5">Nenhuma candidatura.</TableEmpty>
        </TableBody>
      </Table>
      <Pagination
        v-if="data"
        :page="data.page"
        :page-size="data.pageSize"
        :total="data.total"
        @update:page="page = $event"
      />
    </template>
  </div>
</template>
