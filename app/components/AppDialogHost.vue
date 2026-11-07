<script setup lang="ts">
import { computed, provide } from 'vue'
import useDialog, {
  DialogContextKey,
  type DialogEntry,
} from '@/composables/useDialog'

const props = defineProps<{ entry: DialogEntry }>()

const { closeById } = useDialog()

const title = computed(() => props.entry.dialogProps.title)
const description = computed(() => props.entry.dialogProps.description)
const contentProps = computed(() => {
  const { title: _title, description: _description, ...rest } =
    props.entry.dialogProps
  return rest
})

function close(result?: unknown) {
  closeById(props.entry.id, result)
}

function onUpdateOpen(value: boolean) {
  if (!value) close()
}

provide(DialogContextKey, { id: props.entry.id })
</script>

<template>
  <Dialog :open="entry.open" @update:open="onUpdateOpen">
    <DialogContent v-bind="contentProps">
      <DialogHeader v-if="title || description">
        <DialogTitle v-if="title">{{ title }}</DialogTitle>
        <DialogDescription v-if="description">{{ description }}</DialogDescription>
      </DialogHeader>
      <component
        :is="entry.component"
        v-bind="entry.props"
        v-on="{ ...entry.listeners, resolve: close, close }"
      />
    </DialogContent>
  </Dialog>
</template>
