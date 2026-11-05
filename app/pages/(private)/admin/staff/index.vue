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
    toast.success(`Invitation sent to ${invitation.email}`)
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Could not create invitation'))
  }
}

const statusLabel = (inv: InvitationDto) =>
  inv.acceptedAt ? 'accepted' : new Date(inv.expiresAt) < new Date() ? 'expired' : 'pending'
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Staff invitations</h1>

    <Card>
      <CardHeader>
        <CardTitle>Invite an employee</CardTitle>
        <CardDescription>
          They receive a registration link and are granted the selected role. The invite link is
          also logged to the server console in development.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="flex flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="invite">
          <div class="flex-1">
            <Label>Email</Label>
            <Input v-model="form.email" type="email" required placeholder="employee@company.com" />
          </div>
          <div class="w-40">
            <Label>Role</Label>
            <Select v-model="form.role">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" :disabled="isPending">Send invite</Button>
        </form>
      </CardContent>
    </Card>

    <p v-if="isLoading" class="text-muted-foreground">Loading…</p>
    <Table v-else class="rounded-md border">
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Expires</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="inv in invitations ?? []" :key="inv.id">
          <TableCell class="font-medium">{{ inv.email }}</TableCell>
          <TableCell class="capitalize">{{ inv.role }}</TableCell>
          <TableCell class="capitalize">{{ statusLabel(inv) }}</TableCell>
          <TableCell>{{ new Date(inv.expiresAt).toLocaleDateString() }}</TableCell>
        </TableRow>
        <TableEmpty v-if="!invitations?.length" :colspan="4">No invitations yet.</TableEmpty>
      </TableBody>
    </Table>
  </div>
</template>
