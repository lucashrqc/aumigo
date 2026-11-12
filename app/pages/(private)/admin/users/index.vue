<script setup lang="ts">
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import DataTableRowActions from '@/components/DataTableRowActions.vue'
import type { Features } from '@/components/features'
import { useAuthStore } from '@/stores/auth'
import { Trash2 } from '@lucide/vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { h, type Component } from 'vue'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Usuários — Admin' })

const auth = useAuthStore()
const isAdmin = computed(() => auth.isAdmin)

const search = ref('')
const page = ref(1)

const params = computed(() => ({
  page: page.value,
  pageSize: 10,
  search: search.value.trim() || undefined,
}))

const { data, isLoading } = useAdminUsersQuery(params)
const { mutateAsync: deleteUser } = useDeleteUser()

const dialog = useDialog()

watch(search, () => {
  page.value = 1
})

async function handleDelete(user: UserDto) {
  const ok = await dialog.open<boolean>(ConfirmDialog, {
    dialogProps: { class: 'max-w-md' },
    props: {
      title: 'Excluir usuário',
      description: `Excluir ${user.name}? Esta ação é permanente e remove o acesso, as sessões e as candidaturas do usuário.`,
      confirmText: 'Excluir',
      destructive: true,
    },
  })
  if (!ok) return
  try {
    await deleteUser(user.id)
    toast.success('Usuário excluído')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível excluir o usuário'))
  }
}

const actions: RowAction<UserDto>[] = [
  {
    label: 'Excluir',
    icon: Trash2,
    iconClass: 'text-red-400',
    class: 'text-destructive',
    hidden: (row) => !isAdmin.value || row.id === auth.user?.id,
    onClick: handleDelete,
  },
]

const columns: ColumnDef<Features, UserDto>[] = [
  { accessorKey: 'name', header: 'Nome', meta: { class: 'font-medium' } },
  { accessorKey: 'email', header: 'E-mail' },
  {
    id: 'role',
    header: 'Função',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'rounded px-2 py-0.5 text-xs font-medium bg-muted' },
        userRoleLabel(row.original.role),
      ),
  },
  {
    id: 'createdAt',
    header: 'Criado em',
    meta: { class: 'whitespace-nowrap' },
    cell: ({ row }) => formatDateTime(row.original.createdAt),
  },
  {
    id: 'actions',
    header: 'Ações',
    meta: { class: 'w-20 text-center whitespace-nowrap' },
    cell: ({ row }) =>
      h(DataTableRowActions as Component, { row: row.original, actions }),
  },
]
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Usuários</h1>

    <div class="flex justify-start">
      <div class="w-full sm:w-72">
        <Input v-model="search" placeholder="Buscar por nome ou e-mail..." />
      </div>
    </div>

    <DataTable
      :columns="columns"
      :data="data?.items ?? []"
      selection="none"
      scroll-x="always"
      :get-row-id="(row) => row.id"
      :is-loading="isLoading"
    >
      <template #empty>Nenhum usuário encontrado.</template>
    </DataTable>

    <Pagination
      v-if="data"
      :page="data.page"
      :page-size="data.pageSize"
      :total="data.total"
      @update:page="page = $event"
    />
  </div>
</template>
