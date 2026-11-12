<script setup lang="ts">
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { ImageOff, Trash2 } from '@lucide/vue'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'admin' })
useHead({ title: 'Limpeza de imagens — Admin' })

const { data: report, isLoading, isError, refetch } = useBlobSweepQuery()
const { mutateAsync: deleteOrphans, isPending: deleting } = useDeleteOrphans()

const dialog = useDialog()

const stats = computed(() => {
  const r = report.value
  return [
    { key: 'scanned', label: 'Arquivos', value: r?.scanned ?? 0 },
    { key: 'referenced', label: 'Referenciados', value: r?.referenced ?? 0 },
    { key: 'orphaned', label: 'Órfãos', value: r?.orphaned ?? 0 },
    { key: 'eligible', label: 'Elegíveis', value: r?.eligible ?? 0 },
  ]
})

const eligible = computed(() => report.value?.eligible ?? 0)

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function handleDelete() {
  const ok = await dialog.open<boolean>(ConfirmDialog, {
    dialogProps: { class: 'max-w-md' },
    props: {
      title: 'Excluir órfãos agora',
      description: `Excluir ${eligible.value} arquivo(s) órfão(s) sem referência? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      destructive: true,
    },
  })
  if (!ok) return
  try {
    const res = await deleteOrphans(undefined)
    toast.success(`${res.deleted} arquivo(s) excluído(s)`)
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível excluir os órfãos'))
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Limpeza de imagens</h1>
        <p class="text-muted-foreground text-sm">
          Arquivos em armazenamento sem nenhum registro no banco. Nada é
          excluído até você confirmar.
        </p>
      </div>
      <Button
        variant="destructive"
        :disabled="eligible === 0 || deleting"
        @click="handleDelete"
      >
        <Trash2 class="size-4" />
        Excluir órfãos agora
      </Button>
    </div>

    <div class="grid grid-cols-2 gap-4 @5xl/main:grid-cols-4">
      <Card v-for="card in stats" :key="card.key">
        <CardHeader>
          <CardDescription>{{ card.label }}</CardDescription>
          <CardTitle class="text-2xl font-semibold tabular-nums">
            {{ card.value }}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Arquivos órfãos</CardTitle>
        <CardDescription>
          Em carência ficam protegidos; elegíveis já passaram do período de
          {{ report?.minAgeHours ?? 24 }}h.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="text-muted-foreground py-6 text-sm">
          Carregando…
        </div>
        <div v-else-if="isError" class="py-6 text-sm">
          <p class="text-destructive">Não foi possível carregar o relatório.</p>
          <Button variant="outline" size="sm" class="mt-2" @click="refetch()">
            Tentar novamente
          </Button>
        </div>
        <div
          v-else-if="!report?.orphans.length"
          class="text-muted-foreground flex flex-col items-center gap-2 py-10 text-sm"
        >
          <ImageOff class="size-8 opacity-50" />
          Nenhum órfão encontrado.
        </div>
        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead class="w-16">Imagem</TableHead>
              <TableHead>Caminho</TableHead>
              <TableHead>Prefixo</TableHead>
              <TableHead class="text-right">Tamanho</TableHead>
              <TableHead class="text-right">Idade</TableHead>
              <TableHead>Situação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="o in report.orphans" :key="o.url">
              <TableCell>
                <img
                  :src="o.url"
                  alt=""
                  loading="lazy"
                  class="size-10 rounded object-cover"
                >
              </TableCell>
              <TableCell class="max-w-xs truncate font-mono text-xs">
                {{ o.pathname }}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{{ o.prefix }}</Badge>
              </TableCell>
              <TableCell class="text-right tabular-nums">
                {{ formatSize(o.size) }}
              </TableCell>
              <TableCell class="text-right tabular-nums">
                {{ o.ageHours }}h
              </TableCell>
              <TableCell>
                <Badge :variant="o.eligible ? 'warning' : 'secondary'">
                  {{ o.eligible ? 'Elegível' : 'Em carência' }}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
