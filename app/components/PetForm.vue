<script setup lang="ts">
import type { PetCreateInput } from '#shared/schemas'

const props = defineProps<{ initial?: PetDto | null; submitting?: boolean }>()
const emit = defineEmits<{ (e: 'submit', payload: PetCreateInput): void }>()

const { data: species } = useSpeciesQuery()

const form = reactive({
  name: props.initial?.name ?? '',
  speciesId: props.initial?.speciesId ?? '',
  breedId: props.initial?.breedId ?? '',
  description: props.initial?.description ?? '',
  sex: props.initial?.sex ?? 'unknown',
  size: props.initial?.size ?? '',
  coat: props.initial?.coat ?? '',
  weight: props.initial?.weight ? Number(props.initial.weight) : undefined,
  neutered: props.initial?.neutered ?? false,
  birthDate: props.initial?.birthDate ?? '',
  specialNeeds: props.initial?.specialNeeds ?? '',
  status: props.initial?.status ?? 'available',
})
interface ImageRow {
  id: string
  url: string
}

const photoRows = ref<ImageRow[]>(
  props.initial?.images?.map((i) => ({ id: crypto.randomUUID(), url: i.url })) ?? [],
)

const { data: breeds } = useBreedsQuery(() => form.speciesId || undefined)

function addImage() {
  photoRows.value.push({ id: crypto.randomUUID(), url: '' })
}
function removeImage(photo: ImageRow) {
  photoRows.value = photoRows.value.filter((item) => item.id !== photo.id)
}

function submit() {
  const payload: PetCreateInput = {
    name: form.name,
    speciesId: form.speciesId,
    breedId: form.breedId || null,
    description: form.description || null,
    sex: form.sex as PetCreateInput['sex'],
    size: (form.size || null) as PetCreateInput['size'],
    coat: form.coat || null,
    weight: form.weight ?? null,
    neutered: form.neutered,
    birthDate: form.birthDate || null,
    specialNeeds: form.specialNeeds || null,
    status: form.status as PetCreateInput['status'],
    images: photoRows.value
      .filter((i) => i.url.trim())
      .map((i, position) => ({ url: i.url.trim(), position })),
  }
  emit('submit', payload)
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <Label for="name">Name</Label>
        <Input id="name" v-model="form.name" required />
      </div>
      <div>
        <Label>Status</Label>
        <Select v-model="form.status">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="pending">Pending (hold)</SelectItem>
            <SelectItem value="adopted">Adopted</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Species</Label>
        <Select v-model="form.speciesId">
          <SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="s in species ?? []" :key="s.id" :value="s.id">{{ s.name }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Breed (optional)</Label>
        <Select v-model="form.breedId" :disabled="!form.speciesId">
          <SelectTrigger><SelectValue placeholder="Mixed / unknown" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="b in breeds ?? []" :key="b.id" :value="b.id">{{ b.name }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Sex</Label>
        <Select v-model="form.sex">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="unknown">Unknown</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Size</Label>
        <Select v-model="form.size">
          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label for="weight">Weight (kg)</Label>
        <Input id="weight" v-model.number="form.weight" type="number" step="0.1" min="0" />
      </div>
      <div>
        <Label for="coat">Coat</Label>
        <Input id="coat" v-model="form.coat" />
      </div>
      <div>
        <Label for="birthDate">Birth date</Label>
        <Input id="birthDate" v-model="form.birthDate" type="date" />
      </div>
      <label class="flex items-center gap-2 self-end text-sm">
        <input v-model="form.neutered" type="checkbox" class="h-4 w-4" >
        Neutered
      </label>
    </div>

    <div>
      <Label for="description">Description</Label>
      <Textarea id="description" v-model="form.description" />
    </div>
    <div>
      <Label for="special">Special needs</Label>
      <Textarea id="special" v-model="form.specialNeeds" />
    </div>

    <div class="space-y-2">
      <Label>Photo URLs</Label>
      <div v-for="photo in photoRows" :key="photo.id" class="flex gap-2">
        <input
          :value="photo.url"
          placeholder="https://…"
          class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          @input="photo.url = ($event.target as HTMLInputElement).value"
        >
        <Button type="button" variant="outline" size="sm" @click="removeImage(photo)">Remove</Button>
      </div>
      <Button type="button" variant="outline" size="sm" @click="addImage">Add photo</Button>
    </div>

    <div class="flex justify-end">
      <Button type="submit" :disabled="submitting">Save pet</Button>
    </div>
  </form>
</template>
