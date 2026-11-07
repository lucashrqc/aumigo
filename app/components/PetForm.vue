<script setup lang="ts">
import { petCreateSchema, type PetCreateInput } from '#shared/schemas'
import { useForm } from '@tanstack/vue-form'
import { toast } from 'vue-sonner'
import { z } from 'zod'

const props = defineProps<{ initial?: PetDto | null; submitting?: boolean }>()
const emit = defineEmits<{ (e: 'submit', payload: PetCreateInput): void }>()

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
    status: props.initial?.status ?? 'available',
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
    images: (props.initial?.images ?? []).map((i) => ({ url: i.url })),
  },
  onSubmit: ({ value }) => {
    // Shared schema stays the source of truth: build the API payload and let
    // petCreateSchema validate/normalize it before emitting.
    const parsed = petCreateSchema.safeParse({
      name: value.name,
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
      status: value.status,
      images: value.images
        .filter((i) => i.url.trim())
        .map((i, position) => ({ url: i.url.trim(), position })),
    })

    if (!parsed.success) {
      toast.error('Verifique os campos do formulário')
      return
    }
    emit('submit', parsed.data)
  },
})

// Reactive view of the selected species so the breeds query refetches.
const speciesId = form.useStore((state) => state.values.speciesId)
const attempts = form.useStore((state) => state.submissionAttempts)
const breeds = useBreedOptions(() => speciesId.value || undefined)

// Show a field's error once it was touched or a submit was attempted.
const showErrors = (touched: boolean) => touched || attempts.value > 0

const imageUrlValidator = z.url('URL inválida').or(z.literal(''))

const statusOptions = [
  { label: 'Disponível', value: 'available' },
  { label: 'Reservado', value: 'pending' },
  { label: 'Adotado', value: 'adopted' },
]
const sizeOptions = [
  { label: 'Pequeno', value: 'small' },
  { label: 'Médio', value: 'medium' },
  { label: 'Grande', value: 'large' },
]
</script>

<template>
  <form class="space-y-4" @submit.prevent="form.handleSubmit">
    <div class="grid gap-4 xs:grid-cols-2 sm:grid-cols-4 gap-y-6">
      <form.Field
        name="name"
        :validators="{ onChange: z.string().trim().min(1, 'Informe o nome') }"
      >
        <template #default="{ field }">
          <FormField
            label="Nome"
            required
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
            <SelectOptions
              :options="statusOptions"
              :model-value="field.state.value"
              @update:model-value="
                field.handleChange($event as typeof field.state.value)
              "
            />
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

      <form.Field name="coat">
        <template #default="{ field }">
          <FormField label="Pelagem" :name="field.name">
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
          <Label>URLs das fotos</Label>
          <div
            v-for="(_, index) in images.state.value"
            :key="index"
            class="flex gap-2"
          >
            <form.Field
              :name="`images[${index}].url`"
              :validators="{ onChange: imageUrlValidator }"
            >
              <template #default="{ field: urlField }">
                <FormField
                  class="flex-1"
                  :errors="urlField.state.meta.errors"
                  :touched="showErrors(urlField.state.meta.isTouched)"
                >
                  <input
                    :value="urlField.state.value"
                    placeholder="https://…"
                    class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    @input="
                      urlField.handleChange(
                        ($event.target as HTMLInputElement).value,
                      )
                    "
                    @blur="urlField.handleBlur"
                  >
                </FormField>
              </template>
            </form.Field>
            <Button
              type="button"
              variant="outline"
              size="sm"
              @click="images.removeValue(index)"
            >
              Remover
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            @click="images.pushValue({ url: '' })"
          >
            Adicionar foto
          </Button>
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
