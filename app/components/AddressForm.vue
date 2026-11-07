<script setup lang="ts">
import { addressUpsertSchema, type AddressUpsertInput } from '#shared/schemas'
import type { AddressDto } from '#shared/types'
import { Skeleton } from '@/components/ui/skeleton'
import { useForm } from '@tanstack/vue-form'
import { vMaska } from 'maska/vue'
import { watch } from 'vue'
import { toast } from 'vue-sonner'
import { z } from 'zod'

const props = defineProps<{
  initial?: AddressDto | null
  submitting?: boolean
  isLoading?: boolean
}>()
const emit = defineEmits<{ (e: 'submit', payload: AddressUpsertInput): void }>()

const form = useForm({
  defaultValues: {
    stateId: props.initial?.stateId ?? '',
    cityId: props.initial?.cityId ?? '',
    zipCode: props.initial?.zipCode ?? '',
    street: props.initial?.street ?? '',
    number: props.initial?.number ?? '',
    neighborhood: props.initial?.neighborhood ?? '',
    complement: props.initial?.complement ?? '',
  },
  onSubmit: ({ value }) => {
    const parsed = addressUpsertSchema.safeParse({
      cityId: value.cityId,
      street: value.street,
      number: value.number || null,
      neighborhood: value.neighborhood || null,
      complement: value.complement || null,
      zipCode: value.zipCode || null,
    })

    if (!parsed.success) {
      toast.error('Verifique os campos do formulário')
      return
    }
    emit('submit', parsed.data)
  },
})

// `stateId` only scopes the city list; the API payload stores `cityId`.
const stateId = form.useStore((state) => state.values.stateId)
const zipCode = form.useStore((state) => state.values.zipCode)
const attempts = form.useStore((state) => state.submissionAttempts)

const states = useStateOptions()
const cities = useCityOptions(() => stateId.value || undefined)

function onStateChange(value: string) {
  form.setFieldValue('stateId', value)
  form.setFieldValue('cityId', '')
}

const showErrors = (touched: boolean) => touched || attempts.value > 0

const cep = useCep(() => zipCode.value)

watch(
  () => cep.data.value,
  (data) => {
    if (!data) return
    form.setFieldValue('street', data.street)
    form.setFieldValue('neighborhood', data.neighborhood)
    if (data.state) form.setFieldValue('stateId', data.state.id)
    form.setFieldValue('cityId', data.city?.id ?? '')
  },
)

watch(
  () => cep.isError.value,
  (isError) => {
    if (isError) toast.error('CEP não encontrado')
  },
)
</script>

<template>
  <div v-if="isLoading">
    <div class="divide-y border-t">
      <div
        v-for="n in 7"
        :key="n"
        class="grid gap-x-8 gap-y-2 py-5 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:items-center"
      >
        <Skeleton class="h-4 w-24" />
        <div class="sm:max-w-md">
          <Skeleton class="h-9 w-full" />
        </div>
      </div>
    </div>
    <div class="flex items-center justify-end pt-6">
      <Skeleton class="h-9 w-36" />
    </div>
  </div>

  <form v-else @submit.prevent="form.handleSubmit">
    <div class="divide-y border-t">
      <form.Field name="zipCode">
        <template #default="{ field }">
          <FormField
            label="CEP"
            orientation="horizontal"
            :name="field.name"
            :errors="field.state.meta.errors"
            :touched="showErrors(field.state.meta.isTouched)"
          >
            <template #default="{ id }">
              <Input
                :id="id"
                v-maska
                data-maska="#####-###"
                inputmode="numeric"
                placeholder="00000-000"
                :model-value="field.state.value"
                @update:model-value="field.handleChange(String($event))"
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>

      <form.Field
        name="street"
        :validators="{ onChange: z.string().trim().min(1, 'Informe a rua') }"
      >
        <template #default="{ field }">
          <FormField
            label="Rua"
            required
            orientation="horizontal"
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

      <form.Field name="number">
        <template #default="{ field }">
          <FormField label="Número" orientation="horizontal" :name="field.name">
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

      <form.Field name="neighborhood">
        <template #default="{ field }">
          <FormField label="Bairro" orientation="horizontal" :name="field.name">
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

      <form.Field name="complement">
        <template #default="{ field }">
          <FormField
            label="Complemento"
            orientation="horizontal"
            :name="field.name"
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

      <form.Field
        name="stateId"
        :validators="{ onChange: z.string().min(1, 'Selecione o estado') }"
      >
        <template #default="{ field }">
          <FormField
            label="Estado"
            required
            orientation="horizontal"
            :name="field.name"
            :errors="field.state.meta.errors"
            :touched="showErrors(field.state.meta.isTouched)"
          >
            <AsyncCombobox
              :model-value="field.state.value"
              :items="states.items"
              :is-fetching="states.isFetching"
              :is-fetching-next-page="states.isFetchingNextPage"
              :has-next-page="states.hasNextPage"
              :resolve-by-id="states.resolveById"
              option-value="id"
              option-label="name"
              placeholder="Selecione o estado"
              search-placeholder="Buscar estado…"
              @update:model-value="onStateChange(String($event ?? ''))"
              @search="states.setSearch"
              @can-load-more="states.loadMore"
            />
          </FormField>
        </template>
      </form.Field>

      <form.Field
        name="cityId"
        :validators="{ onChange: z.string().min(1, 'Selecione a cidade') }"
      >
        <template #default="{ field }">
          <FormField
            label="Cidade"
            required
            orientation="horizontal"
            :name="field.name"
            :errors="field.state.meta.errors"
            :touched="showErrors(field.state.meta.isTouched)"
          >
            <AsyncCombobox
              :model-value="field.state.value"
              :items="cities.items"
              :is-fetching="cities.isFetching"
              :is-fetching-next-page="cities.isFetchingNextPage"
              :has-next-page="cities.hasNextPage"
              :resolve-by-id="cities.resolveById"
              :disabled="!stateId"
              option-value="id"
              option-label="name"
              placeholder="Selecione a cidade"
              search-placeholder="Buscar cidade…"
              @update:model-value="field.handleChange(String($event ?? ''))"
              @search="cities.setSearch"
              @can-load-more="cities.loadMore"
            />
          </FormField>
        </template>
      </form.Field>
    </div>

    <div class="flex items-center justify-end pt-6">
      <form.Subscribe>
        <template #default="{ canSubmit, isSubmitting }">
          <Button
            type="submit"
            :disabled="submitting || isSubmitting || !canSubmit"
          >
            Salvar endereço
          </Button>
        </template>
      </form.Subscribe>
    </div>
  </form>
</template>
