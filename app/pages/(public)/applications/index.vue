<script setup lang="ts">
definePageMeta({ layout: 'public', middleware: 'auth' })
useHead({ title: 'Minhas candidaturas — Aumor' })

const { data, isLoading } = useMyApplicationsQuery()

const statusVariant = (s: string) =>
  s === 'approved' ? 'success' : s === 'rejected' ? 'destructive' : 'warning'
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Minhas candidaturas de adoção</h1>

    <p v-if="isLoading" class="text-muted-foreground">Carregando…</p>
    <p v-else-if="!data?.length" class="text-muted-foreground">
      Você ainda não se candidatou a nenhum pet.
      <NuxtLink to="/pets" class="underline">Ver pets</NuxtLink>.
    </p>

    <Card v-for="app in data ?? []" v-else :key="app.id">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>
            <NuxtLink :to="`/pets/${app.petId}`" class="hover:underline">
              {{ app.pet?.name ?? 'Pet' }}
            </NuxtLink>
          </CardTitle>
          <Badge :variant="statusVariant(app.status)">{{ applicationStatusLabel(app.status) }}</Badge>
        </div>
        <CardDescription>Enviada em {{ new Date(app.createdAt).toLocaleDateString('pt-BR') }}</CardDescription>
      </CardHeader>
      <CardContent v-if="app.message" class="text-sm text-muted-foreground">
        {{ app.message }}
      </CardContent>
    </Card>
  </div>
</template>
