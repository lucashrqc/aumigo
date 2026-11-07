<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { vMaska } from 'maska/vue'
import { toast } from 'vue-sonner'

// TODO: The `address` table requires a non-null `cityId`, so nothing is submitted
// yet. Wire a `useUpdateAddress` mutation and enable Save. The CEP field
// autocompletes the fields below but does not persist them.

const states = useStateOptions()
const stateId = ref<string | null>(null)
const cities = useCityOptions(() => stateId.value ?? undefined)

const form = reactive({
  street: '',
  number: '',
  neighborhood: '',
  complement: '',
  zipCode: '',
  cityId: null as string | null,
})

type ComboOption = { value: string; label: string }
const stateInitial = ref<ComboOption>()
const cityInitial = ref<ComboOption>()

function onStateChange(value: string | null) {
  stateId.value = value
  form.cityId = null
}

const cep = useCep(() => form.zipCode)

watch(
  () => cep.data.value,
  (data) => {
    if (!data) return
    form.street = data.street
    form.neighborhood = data.neighborhood
    if (data.state) {
      stateId.value = data.state.id
      stateInitial.value = { value: data.state.id, label: data.state.name }
    }
    if (data.city) {
      form.cityId = data.city.id
      cityInitial.value = { value: data.city.id, label: data.city.name }
    } else {
      form.cityId = null
    }
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
  <form @submit.prevent>
    <div class="divide-y border-t">
      <FormField label="CEP" name="zipCode" orientation="horizontal">
        <template #default="{ id }">
          <Input
            :id="id"
            v-model="form.zipCode"
            v-maska
            data-maska="#####-###"
            inputmode="numeric"
            placeholder="00000-000"
          />
        </template>
      </FormField>

      <FormField label="Rua" name="street" orientation="horizontal">
        <template #default="{ id }">
          <Input :id="id" v-model="form.street" />
        </template>
      </FormField>

      <FormField label="Número" name="number" orientation="horizontal">
        <template #default="{ id }">
          <Input :id="id" v-model="form.number" />
        </template>
      </FormField>

      <FormField label="Bairro" name="neighborhood" orientation="horizontal">
        <template #default="{ id }">
          <Input :id="id" v-model="form.neighborhood" />
        </template>
      </FormField>

      <FormField label="Complemento" name="complement" orientation="horizontal">
        <template #default="{ id }">
          <Input :id="id" v-model="form.complement" />
        </template>
      </FormField>

      <FormField label="Estado" name="state" orientation="horizontal">
        <AsyncCombobox
          :model-value="stateId"
          :items="states.items"
          :is-fetching="states.isFetching"
          :is-fetching-next-page="states.isFetchingNextPage"
          :has-next-page="states.hasNextPage"
          :initial-option="stateInitial"
          option-value="id"
          option-label="name"
          placeholder="Selecione o estado"
          search-placeholder="Buscar estado…"
          @update:model-value="onStateChange($event ?? null)"
          @search="states.setSearch"
          @can-load-more="states.loadMore"
        />
      </FormField>

      <FormField label="Cidade" name="city" orientation="horizontal">
        <AsyncCombobox
          :model-value="form.cityId"
          :items="cities.items"
          :is-fetching="cities.isFetching"
          :is-fetching-next-page="cities.isFetchingNextPage"
          :has-next-page="cities.hasNextPage"
          :initial-option="cityInitial"
          :disabled="!stateId"
          option-value="id"
          option-label="name"
          placeholder="Selecione a cidade"
          search-placeholder="Buscar cidade…"
          @update:model-value="form.cityId = $event ?? null"
          @search="cities.setSearch"
          @can-load-more="cities.loadMore"
        />
      </FormField>
    </div>

    <div class="flex items-center justify-end gap-3 pt-6">
      <p class="text-xs text-muted-foreground">Em breve</p>
      <Button type="submit" disabled>Salvar endereço</Button>
    </div>
  </form>
</template>
