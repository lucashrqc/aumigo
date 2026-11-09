<script setup lang="ts">
const props = defineProps<{ pet: PetDto }>()

const cover = computed(() => props.pet.images?.[0]?.url ?? null)
const statusVariant = computed(() =>
  props.pet.status === 'available'
    ? 'success'
    : props.pet.status === 'pending'
      ? 'warning'
      : 'secondary',
)
</script>

<template>
  <NuxtLink :to="`/pets/${pet.id}`" class="block">
    <Card class="overflow-hidden transition-shadow hover:shadow-md">
      <div class="aspect-video w-full bg-muted">
        <img
          v-if="cover"
          :src="cover"
          :alt="pet.name"
          class="h-full w-full object-cover"
        />
        <div
          v-else
          class="flex h-full items-center justify-center text-muted-foreground"
        >
          Sem foto
        </div>
      </div>
      <CardHeader class="gap-2">
        <div class="flex items-center justify-between">
          <CardTitle>{{ pet.name }}</CardTitle>
          <Badge :variant="statusVariant">{{
            petStatusLabel(pet.status)
          }}</Badge>
        </div>
        <CardDescription>
          {{ pet.species?.name ?? 'Desconhecido' }}
          <template v-if="pet.breed"> · {{ pet.breed.name }}</template>
        </CardDescription>
      </CardHeader>
    </Card>
  </NuxtLink>
</template>
