<script setup lang="ts">
import { upload } from '@vercel/blob/client'
import { toast } from 'vue-sonner'

const props = withDefaults(
  defineProps<{
    handleUploadUrl: string
    pathPrefix: string
    accept?: string
    maxSizeMb?: number
    disabled?: boolean
    label?: string
  }>(),
  {
    accept: 'image/jpeg,image/png,image/webp',
    maxSizeMb: 5,
    disabled: false,
    label: 'Enviar imagem',
  },
)

const emit = defineEmits<{ (e: 'uploaded', url: string): void }>()

const input = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

const allowedTypes = computed(() =>
  props.accept.split(',').map((t) => t.trim()),
)

async function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  if (!file) return

  if (!allowedTypes.value.includes(file.type)) {
    toast.error('Formato inválido. Use JPG, PNG ou WebP.')
    return
  }
  if (file.size > props.maxSizeMb * 1024 * 1024) {
    toast.error(`Arquivo muito grande (máx. ${props.maxSizeMb} MB).`)
    return
  }

  uploading.value = true
  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
    const blob = await upload(
      `${props.pathPrefix}${Date.now()}-${safeName}`,
      file,
      { access: 'public', handleUploadUrl: props.handleUploadUrl },
    )
    emit('uploaded', blob.url)
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Falha ao enviar a imagem'))
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div>
    <input
      ref="input"
      type="file"
      :accept="accept"
      class="hidden"
      @change="onChange"
    />
    <Button
      type="button"
      variant="outline"
      size="sm"
      :disabled="disabled || uploading"
      @click="input?.click()"
    >
      {{ uploading ? 'Enviando…' : label }}
    </Button>
  </div>
</template>
