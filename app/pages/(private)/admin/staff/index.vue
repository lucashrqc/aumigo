<script setup lang="ts">
import type { Features } from '@/components/features'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'admin' })
useHead({ title: 'Staff — Admin' })

const { data: invitations, isLoading } = useInvitationsQuery()
const { mutateAsync: createInvitation, isPending } = useCreateInvitation()

const form = reactive({ email: '', role: 'staff' as 'staff' | 'admin' })

const roleOptions = [
  { label: 'Staff', value: 'staff' },
  { label: 'Admin', value: 'admin' },
]

async function invite() {
  try {
    const invitation = await createInvitation({ email: form.email, role: form.role })
    form.email = ''
    toast.success(`Convite enviado para ${invitation.email}`)
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível criar o convite'))
  }
}

const statusLabel = (inv: InvitationDto) =>
  inv.acceptedAt ? 'Aceito' : new Date(inv.expiresAt) < new Date() ? 'Expirado' : 'Pendente'

const columns: ColumnDef<Features, InvitationDto>[] = [
  { accessorKey: 'email', header: 'E-mail', meta: { class: 'font-medium' } },
  {
    id: 'role',
    header: 'Função',
    cell: ({ row }) => (row.original.role === 'admin' ? 'Admin' : 'Staff'),
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'rounded px-2 py-0.5 text-xs font-medium bg-muted' },
        statusLabel(row.original),
      ),
  },
  {
    id: 'expiresAt',
    header: 'Expira em',
    meta: { class: 'whitespace-nowrap' },
    cell: ({ row }) => formatDate(row.original.expiresAt),
  },
]
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Convites de staff</h1>

    <Card>
      <CardHeader>
        <CardTitle>Convidar um funcionário</CardTitle>
        <CardDescription>
          A pessoa recebe um link de cadastro e ganha a função selecionada. O link do convite também
          é registrado no console do servidor em desenvolvimento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="flex flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="invite">
          <FormField label="E-mail" required name="email" class="flex-1">
            <template #default="{ id }">
              <Input
                :id="id"
                v-model="form.email"
                type="email"
                required
                placeholder="funcionario@empresa.com"
              />
            </template>
          </FormField>
          <FormField label="Função" name="role" class="w-40">
            <SelectOptions v-model="form.role" :options="roleOptions" />
          </FormField>
          <Button type="submit" :disabled="isPending">Enviar convite</Button>
        </form>
      </CardContent>
    </Card>

    <DataTable
      :columns="columns"
      :data="invitations ?? []"
      :get-row-id="(row) => row.id"
      :is-loading="isLoading"
    >
      <template #empty>Nenhum convite ainda.</template>
    </DataTable>
  </div>
</template>
