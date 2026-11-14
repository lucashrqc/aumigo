<script setup lang="ts">
import {
  MAX_PET_IMAGES,
  petCreateSchema,
  type PetCreateInput,
} from '#shared/schemas'
import { useForm } from '@tanstack/vue-form'
import { toast } from 'vue-sonner'
import { z } from 'zod'

const props = defineProps<{ initial?: PetDto | null; submitting?: boolean }>()
const emit = defineEmits<{ (e: 'submit', payload: PetCreateInput): void }>()

// An image is either already persisted (an existing URL) or a freshly cropped
// file kept locally until the form is saved — uploads are deferred to submit.
type PetFormImage =
  | { kind: 'existing'; url: string }
  | { kind: 'pending'; file: File; previewUrl: string }

const imageSrc = (image: PetFormImage) =>
  image.kind === 'existing' ? image.url : image.previewUrl

const species = useSpeciesOptions()

// Seed the selected labels from the pet being edited so no extra fetch is needed to show them.
const initialSpecies = props.initial?.species
  ? { value: props.initial.species.id, label: props.initial.species.name }
  : undefined
const initialBreed = props.initial?.breed
  ? { value: props.initial.breed.id, label: props.initial.breed.name }
  : undefined

const form = useForm({
  defaultValues: {
    name: props.initial?.name ?? '',
    status: props.initial?.status ?? 'pending',
    speciesId: props.initial?.speciesId ?? '',
    breedId: props.initial?.breedId ?? '',
    sex: props.initial?.sex ?? 'unknown',
    size: props.initial?.size ?? 'medium',
    weight:
      props.initial?.weight != null ? Number(props.initial.weight) : undefined,
    coat: props.initial?.coat ?? '',
    birthDate: props.initial?.birthDate ?? '',
    neutered: props.initial?.neutered ?? false,
    description: props.initial?.description ?? '',
    specialNeeds: props.initial?.specialNeeds ?? '',
    images: (props.initial?.images ?? []).map((i): PetFormImage => ({
      kind: 'existing',
      url: i.url,
    })),
  },
  onSubmit: async ({ value }) => {
    // Deferred uploads: cropped files are only sent to blob storage now, on
    // save, then the resolved URLs flow into the shared schema as before.
    let urls: string[]
    try {
      urls = await Promise.all(
        value.images.map((image) =>
          image.kind === 'existing'
            ? Promise.resolve(image.url)
            : uploadImage(image.file, {
                pathPrefix: 'pets/',
                handleUploadUrl: '/api/admin/uploads/pet-image',
              }),
        ),
      )
    } catch (err) {
      toast.error(resolveErrorMessage(err, 'Falha ao enviar as imagens'))
      return
    }

    // Replace uploaded files with their URLs so a save retry (e.g. after a
    // failed pet request) reuses the stored blobs instead of re-uploading.
    value.images.forEach((image) => {
      if (image.kind === 'pending') URL.revokeObjectURL(image.previewUrl)
    })
    form.setFieldValue(
      'images',
      urls.map((url) => ({ kind: 'existing' as const, url })),
    )

    // Shared schema stays the source of truth: build the API payload and let
    // petCreateSchema validate/normalize it before emitting.
    const parsed = petCreateSchema.safeParse({
      name: value.name || null,
      speciesId: value.speciesId,
      breedId: value.breedId || null,
      description: value.description || null,
      sex: value.sex,
      size: value.size || null,
      coat: value.coat || null,
      weight: value.weight ?? null,
      neutered: value.neutered,
      birthDate: value.birthDate || null,
      specialNeeds: value.specialNeeds || null,
      images: urls
        .filter((url) => url.trim())
        .map((url, position) => ({ url: url.trim(), position })),
    })

    if (!parsed.success) {
      toast.error('Verifique os campos do formulário')
      return
    }
    emit('submit', parsed.data)
  },
})

// Release object URLs for any still-pending previews when the form is destroyed.
onBeforeUnmount(() => {
  for (const image of form.state.values.images) {
    if (image.kind === 'pending') URL.revokeObjectURL(image.previewUrl)
  }
})

const removeImage = (
  field: {
    state: { value: PetFormImage[] }
    removeValue: (index: number) => unknown
  },
  index: number,
) => {
  const image = field.state.value[index]
  if (image?.kind === 'pending') URL.revokeObjectURL(image.previewUrl)
  field.removeValue(index)
}

// Reactive view of the selected species so the breeds query refetches.
const speciesId = form.useStore((state) => state.values.speciesId)
// Name drives whether the coat field is shown as required.
const nameValue = form.useStore((state) => state.values.name)
const attempts = form.useStore((state) => state.submissionAttempts)
const breeds = useBreedOptions(() => speciesId.value || undefined)

// Show a field's error once it was touched or a submit was attempted.
const showErrors = (touched: boolean) => touched || attempts.value > 0

const sizeOptions = [
  { label: 'Pequeno', value: 'small' },
  { label: 'Médio', value: 'medium' },
  { label: 'Grande', value: 'large' },
]
</script>

<template>
  <form class="space-y-4" @submit.prevent="form.handleSubmit">
    <div class="grid gap-4 xs:grid-cols-2 sm:grid-cols-4 gap-y-6">
      <form.Field name="name">
        <template #default="{ field }">
          <FormField
            label="Nome"
            :name="field.name"
            :errors="field.state.meta.errors"
            :touched="showErrors(field.state.meta.isTouched)"
          >
            <template #default="{ id }">
              <Input
                :id="id"
                :model-value="field.state.value"
                @update:model-value="field.handleChange(String($event))"
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>

      <form.Field name="status">
        <template #default="{ field }">
          <FormField label="Status" :name="field.name">
            <template #default="{ id }">
              <Input
                :id="id"
                :model-value="petStatusLabel(field.state.value)"
                readonly
                disabled
              />
            </template>
          </FormField>
        </template>
      </form.Field>

      <form.Field
        name="speciesId"
        :validators="{ onChange: z.string().min(1, 'Selecione a espécie') }"
      >
        <template #default="{ field }">
          <FormField
            label="Espécie"
            required
            :name="field.name"
            :errors="field.state.meta.errors"
            :touched="showErrors(field.state.meta.isTouched)"
          >
            <AsyncCombobox
              :model-value="field.state.value"
              :items="species.items"
              :is-fetching="species.isFetching"
              :is-fetching-next-page="species.isFetchingNextPage"
              :has-next-page="species.hasNextPage"
              :resolve-by-id="species.resolveById"
              :initial-option="initialSpecies"
              option-value="id"
              option-label="name"
              placeholder="Selecione a espécie"
              search-placeholder="Buscar espécie…"
              @update:model-value="field.handleChange(String($event ?? ''))"
              @search="species.setSearch"
              @can-load-more="species.loadMore"
            />
          </FormField>
        </template>
      </form.Field>

      <form.Field name="breedId">
        <template #default="{ field }">
          <FormField label="Raça (opcional)" :name="field.name">
            <AsyncCombobox
              :model-value="field.state.value"
              :items="breeds.items"
              :is-fetching="breeds.isFetching"
              :is-fetching-next-page="breeds.isFetchingNextPage"
              :has-next-page="breeds.hasNextPage"
              :resolve-by-id="breeds.resolveById"
              :initial-option="initialBreed"
              :disabled="!speciesId"
              option-value="id"
              option-label="name"
              placeholder="Vira-lata / desconhecida"
              search-placeholder="Buscar raça…"
              @update:model-value="field.handleChange(String($event ?? ''))"
              @search="breeds.setSearch"
              @can-load-more="breeds.loadMore"
            />
          </FormField>
        </template>
      </form.Field>

      <form.Field name="size">
        <template #default="{ field }">
          <FormField label="Porte" :name="field.name">
            <SelectOptions
              :options="sizeOptions"
              placeholder="—"
              :model-value="field.state.value"
              @update:model-value="
                field.handleChange($event as typeof field.state.value)
              "
            />
          </FormField>
        </template>
      </form.Field>

      <form.Field name="weight">
        <template #default="{ field }">
          <FormField label="Peso (kg)" :name="field.name">
            <template #default="{ id }">
              <Input
                :id="id"
                type="number"
                step="0.1"
                min="0"
                :model-value="field.state.value"
                @update:model-value="
                  field.handleChange($event === '' ? undefined : Number($event))
                "
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>

      <form.Field
        name="coat"
        :validators="{
          onChangeListenTo: ['name'],
          onChange: ({ value, fieldApi }) =>
            !String(fieldApi.form.getFieldValue('name') ?? '').trim() &&
            !String(value ?? '').trim()
              ? 'Informe a pelagem quando o pet não tem nome'
              : undefined,
        }"
      >
        <template #default="{ field }">
          <FormField
            label="Pelagem"
            :required="!nameValue?.trim()"
            :name="field.name"
            :errors="field.state.meta.errors"
            :touched="showErrors(field.state.meta.isTouched)"
          >
            <template #default="{ id }">
              <Input
                :id="id"
                :model-value="field.state.value"
                @update:model-value="field.handleChange(String($event))"
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>

      <form.Field name="birthDate">
        <template #default="{ field }">
          <FormField
            label="Data de nascimento"
            :name="field.name"
            :errors="field.state.meta.errors"
            :touched="showErrors(field.state.meta.isTouched)"
          >
            <template #default="{ id }">
              <DatePickerInput
                :id="id"
                :model-value="field.state.value"
                @update:model-value="field.handleChange($event ?? '')"
                @error="
                  field.setErrorMap({ onChange: ($event ?? undefined) as any })
                "
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>

      <form.Field name="neutered">
        <template #default="{ field }">
          <FormField
            label="O pet é castrado?"
            :name="field.name"
            class="col-span-2"
          >
            <RadioGroup
              default-value="0"
              class="flex flex-row gap-4 mt-4"
              @update:model-value="
                (ev) => field.handleChange(Boolean(Number(ev)) as any)
              "
            >
              <div class="flex items-center space-x-2">
                <RadioGroupItem id="sim" value="1" />
                <Label for="sim">Sim</Label>
              </div>
              <div class="flex items-center space-x-2">
                <RadioGroupItem id="no" value="0" />
                <Label for="no">Não</Label>
              </div>
            </RadioGroup>
          </FormField>
        </template>
      </form.Field>

      <form.Field name="sex">
        <template #default="{ field }">
          <FormField label="Sexo" :name="field.name" class="col-span-2">
            <RadioGroup
              default-value="male"
              class="flex flex-row gap-4 mt-4"
              @update:model-value="(ev) => field.handleChange(ev as any)"
            >
              <div class="flex items-center space-x-2">
                <RadioGroupItem id="male" value="male" />
                <Label for="male">Macho</Label>
              </div>
              <div class="flex items-center space-x-2">
                <RadioGroupItem id="female" value="female" />
                <Label for="female">Fêmea</Label>
              </div>
            </RadioGroup>
          </FormField>
        </template>
      </form.Field>

      <form.Field name="description">
        <template #default="{ field }">
          <FormField label="Descrição" :name="field.name" class="col-span-2">
            <template #default="{ id }">
              <Textarea
                :id="id"
                :model-value="field.state.value"
                @update:model-value="field.handleChange(String($event))"
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>

      <form.Field name="specialNeeds">
        <template #default="{ field }">
          <FormField
            label="Necessidades especiais"
            :name="field.name"
            class="col-span-2"
          >
            <template #default="{ id }">
              <Textarea
                :id="id"
                :model-value="field.state.value"
                @update:model-value="field.handleChange(String($event))"
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>
    </div>

    <form.Field name="images" mode="array">
      <template #default="{ field: images }">
        <div class="space-y-2">
          <Label>Fotos</Label>
          <div v-if="images.state.value.length" class="flex flex-wrap gap-3">
            <div
              v-for="(image, index) in images.state.value"
              :key="index"
              class="relative h-24 w-24 overflow-hidden rounded-md border"
            >
              <img
                :src="imageSrc(image)"
                alt=""
                class="h-full w-full object-cover"
              >
              <button
                type="button"
                class="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs leading-5 text-white"
                @click="removeImage(images, index)"
              >
                ✕
              </button>
            </div>
          </div>
          <ImageUploader
            handle-upload-url="/api/admin/uploads/pet-image"
            path-prefix="pets/"
            label="Adicionar foto"
            :max-size-mb="5"
            :aspect-ratio="16 / 9"
            :crop-width="1600"
            :crop-height="900"
            :disabled="images.state.value.length >= MAX_PET_IMAGES"
            defer-upload
            @cropped="
              (payload) => images.pushValue({ kind: 'pending', ...payload })
            "
          />
          <p class="text-muted-foreground text-xs">
            JPG, PNG ou WebP até 5 MB. Máximo de {{ MAX_PET_IMAGES }} fotos.
          </p>
        </div>
      </template>
    </form.Field>

    <div class="flex justify-end">
      <form.Subscribe>
        <template #default="{ canSubmit, isSubmitting }">
          <Button
            type="submit"
            :disabled="submitting || isSubmitting || !canSubmit"
            >Salvar pet</Button
          >
        </template>
      </form.Subscribe>
    </div>
  </form>
</template>
