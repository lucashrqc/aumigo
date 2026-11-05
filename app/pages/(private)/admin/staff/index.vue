<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'admin' })
useHead({ title: 'Staff — Admin' })

const { data: invitations, isLoading } = useInvitationsQuery()
const { mutateAsync: createInvitation, isPending } = useCreateInvitation()

const form = reactive({ email: '', role: 'staff' as 'staff' | 'admin' })

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
          <div class="flex-1">
            <Label>E-mail</Label>
            <Input v-model="form.email" type="email" required placeholder="funcionario@empresa.com" />
          </div>
          <div class="w-40">
            <Label>Função</Label>
            <Select v-model="form.role">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" :disabled="isPending">Enviar convite</Button>
        </form>
      </CardContent>
    </Card>

    <p v-if="isLoading" class="text-muted-foreground">Carregando…</p>
    <Table v-else class="rounded-md border">
      <TableHeader>
        <TableRow>
          <TableHead>E-mail</TableHead>
          <TableHead>Função</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Expira em</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="inv in invitations ?? []" :key="inv.id">
          <TableCell class="font-medium">{{ inv.email }}</TableCell>
          <TableCell class="capitalize">{{ inv.role }}</TableCell>
          <TableCell>{{ statusLabel(inv) }}</TableCell>
          <TableCell>{{ new Date(inv.expiresAt).toLocaleDateString('pt-BR') }}</TableCell>
        </TableRow>
        <TableEmpty v-if="!invitations?.length" :colspan="4">Nenhum convite ainda.</TableEmpty>
      </TableBody>
    </Table>
  </div>
</template>
