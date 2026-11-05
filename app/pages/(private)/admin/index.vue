<script setup lang="ts">
definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Admin — Aumor' })

const { data: pets } = useAdminPetsQuery(() => ({ pageSize: 1 }))
const { data: applications } = useAdminApplicationsQuery(() => ({ status: 'pending', pageSize: 1 }))
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Dashboard</h1>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription>Active pets</CardDescription>
          <CardTitle class="text-3xl">{{ pets?.total ?? '—' }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Pending applications</CardDescription>
          <CardTitle class="text-3xl">{{ applications?.total ?? '—' }}</CardTitle>
        </CardHeader>
      </Card>
    </div>
    <div class="flex gap-3">
      <Button as-child><NuxtLink to="/admin/pets">Manage pets</NuxtLink></Button>
      <Button as-child variant="outline">
        <NuxtLink to="/admin/applications">Review applications</NuxtLink>
      </Button>
    </div>
  </div>
</template>
