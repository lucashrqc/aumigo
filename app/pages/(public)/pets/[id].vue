<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'

definePageMeta({ layout: 'public' })

const route = useRoute()
const auth = useAuthStore()
const id = computed(() => route.params.id as string)

const { data: pet, isLoading, error } = usePublicPetQuery(id)
useHead(() => ({ title: pet.value ? `${pet.value.name} — Aumor` : 'Pet — Aumor' }))

const dialogOpen = ref(false)
const phone = ref('')
const message = ref('')
const { mutateAsync: apply, isPending } = useApplyForPet()

async function submit() {
  try {
    await apply({ petId: id.value, contactPhone: phone.value, message: message.value || undefined })
    dialogOpen.value = false
    toast.success('Application submitted! Our team will be in touch.')
    await navigateTo('/applications')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Could not submit application'))
  }
}
</script>

<template>
  <div v-if="isLoading" class="text-muted-foreground">Loading…</div>
  <div v-else-if="error || !pet" class="text-muted-foreground">Pet not found.</div>

  <div v-else class="grid gap-8 lg:grid-cols-2">
    <div class="space-y-3">
      <div class="aspect-video w-full overflow-hidden rounded-lg bg-muted">
        <img
          v-if="pet.images?.[0]"
          :src="pet.images[0].url"
          :alt="pet.name"
          class="h-full w-full object-cover"
        >
        <div v-else class="flex h-full items-center justify-center text-muted-foreground">
          No photo
        </div>
      </div>
      <div v-if="pet.images.length > 1" class="grid grid-cols-4 gap-2">
        <img
          v-for="img in pet.images.slice(1)"
          :key="img.id"
          :src="img.url"
          :alt="pet.name"
          class="aspect-square w-full rounded object-cover"
        >
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <h1 class="text-3xl font-bold">{{ pet.name }}</h1>
        <Badge :variant="pet.status === 'available' ? 'success' : 'secondary'">
          {{ pet.status }}
        </Badge>
      </div>

      <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div><dt class="text-muted-foreground">Species</dt><dd>{{ pet.species?.name ?? '—' }}</dd></div>
        <div><dt class="text-muted-foreground">Breed</dt><dd>{{ pet.breed?.name ?? 'Mixed / unknown' }}</dd></div>
        <div><dt class="text-muted-foreground">Sex</dt><dd class="capitalize">{{ pet.sex }}</dd></div>
        <div><dt class="text-muted-foreground">Size</dt><dd class="capitalize">{{ pet.size ?? '—' }}</dd></div>
        <div><dt class="text-muted-foreground">Neutered</dt><dd>{{ pet.neutered ? 'Yes' : 'No' }}</dd></div>
        <div><dt class="text-muted-foreground">Weight</dt><dd>{{ pet.weight ? `${pet.weight} kg` : '—' }}</dd></div>
      </dl>

      <p v-if="pet.description" class="whitespace-pre-line text-sm">{{ pet.description }}</p>
      <p v-if="pet.specialNeeds" class="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
        <strong>Special needs:</strong> {{ pet.specialNeeds }}
      </p>

      <div v-if="pet.status === 'adopted'" class="text-muted-foreground">
        This pet has already found a home. 🎉
      </div>
      <template v-else>
        <Dialog v-if="auth.isAuthenticated && !auth.isStaff" v-model:open="dialogOpen">
          <DialogTrigger as-child>
            <Button size="lg">Apply to adopt</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adopt {{ pet.name }}</DialogTitle>
              <DialogDescription>
                Share a contact number and a short note. Our team reviews every application.
              </DialogDescription>
            </DialogHeader>
            <form class="space-y-4" @submit.prevent="submit">
              <div>
                <Label for="phone">Contact phone</Label>
                <Input id="phone" v-model="phone" required placeholder="+55 11 99999-9999" />
              </div>
              <div>
                <Label for="message">Message (optional)</Label>
                <Textarea id="message" v-model="message" placeholder="Tell us about your home…" />
              </div>
              <DialogFooter>
                <Button type="submit" :disabled="isPending">Submit application</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <div v-else-if="!auth.isAuthenticated" class="space-y-2">
          <Button as-child size="lg">
            <NuxtLink :to="`/login?redirect=/pets/${pet.id}`">Sign in to adopt</NuxtLink>
          </Button>
        </div>
      </template>
    </div>
  </div>
</template>
