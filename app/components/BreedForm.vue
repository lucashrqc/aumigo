<script setup lang="ts">
import { breedCreateSchema, type BreedCreateInput } from '#shared/schemas'
import { useForm } from '@tanstack/vue-form'
import { toast } from 'vue-sonner'
import { z } from 'zod'

const props = defineProps<{ initial?: BreedDto | null; submitting?: boolean }>()
const emit = defineEmits<{ (e: 'submit', payload: BreedCreateInput): void }>()

const species = useSpeciesOptions()

const form = useForm({
  defaultValues: {
    name: props.initial?.name ?? '',
    speciesId: props.initial?.speciesId ?? '',
  },
  onSubmit: ({ value }) => {
    // Shared schema stays the source of truth: build the API payload and let
    // breedCreateSchema validate/normalize it before emitting.
    const parsed = breedCreateSchema.safeParse({
      name: value.name,
      speciesId: value.speciesId,
    })

    if (!parsed.success) {
      toast.error('Verifique os campos do formulário')
      return
    }
    emit('submit', parsed.data)
  },
})

const attempts = form.useStore((state) => state.submissionAttempts)

// Show a field's error once it was touched or a submit was attempted.
const showErrors = (touched: boolean) => touched || attempts.value > 0
</script>

<template>
  <form class="space-y-4" @submit.prevent="form.handleSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
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
    </div>

    <div class="flex justify-end">
      <form.Subscribe>
        <template #default="{ canSubmit, isSubmitting }">
          <Button type="submit" :disabled="submitting || isSubmitting || !canSubmit"
            >Salvar raça</Button
          >
        </template>
      </form.Subscribe>
    </div>
  </form>
</template>
