<script setup lang="ts">
import { reactive, ref } from 'vue'

// TODO: UI scaffold only. The `address` table requires a non-null `cityId` and the
// city/state catalogs aren't seeded yet, so nothing is submitted. Wire a
// `useUpdateAddress` mutation and enable Save once the catalogs land.

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

function onStateChange(value: string | null) {
  stateId.value = value
  form.cityId = null
}
</script>

<template>
  <form @submit.prevent>
    <div class="divide-y border-t">
      <FormField label="CEP" name="zipCode" orientation="horizontal">
        <template #default="{ id }">
          <Input :id="id" v-model="form.zipCode" placeholder="00000-000" />
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
