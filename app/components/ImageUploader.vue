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
    aspectRatio?: number
    circular?: boolean
    cropWidth?: number
    cropHeight?: number
    outputFormat?: string
    quality?: number
  }>(),
  {
    accept: 'image/jpeg,image/png,image/webp',
    maxSizeMb: 5,
    disabled: false,
    label: 'Enviar imagem',
    aspectRatio: 1,
    circular: false,
    cropWidth: 1024,
    cropHeight: 1024,
    outputFormat: 'image/webp',
    quality: 0.9,
  },
)

const emit = defineEmits<{ (e: 'uploaded', url: string): void }>()

const input = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

const cropOpen = ref(false)
const cropSrc = ref<string | null>(null)
const baseName = ref('image')

const allowedTypes = computed(() =>
  props.accept.split(',').map((t) => t.trim()),
)

const extensionForFormat = (format: string) =>
  format === 'image/png' ? 'png' : format === 'image/jpeg' ? 'jpg' : 'webp'

function onChange(event: Event) {
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

  baseName.value = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9.-]/g, '-')
  releaseSrc()
  cropSrc.value = URL.createObjectURL(file)
  cropOpen.value = true
}

function releaseSrc() {
  if (cropSrc.value) {
    URL.revokeObjectURL(cropSrc.value)
    cropSrc.value = null
  }
}

async function onCropped(blob: Blob) {
  releaseSrc()

  if (blob.size > props.maxSizeMb * 1024 * 1024) {
    toast.error(`Arquivo muito grande (máx. ${props.maxSizeMb} MB).`)
    return
  }

  const ext = extensionForFormat(props.outputFormat)
  const file = new File([blob], `${baseName.value}.${ext}`, {
    type: props.outputFormat,
  })

  uploading.value = true
  try {
    const result = await upload(
      `${props.pathPrefix}${Date.now()}-${file.name}`,
      file,
      { access: 'public', handleUploadUrl: props.handleUploadUrl },
    )
    emit('uploaded', result.url)
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Falha ao enviar a imagem'))
  } finally {
    uploading.value = false
  }
}

watch(cropOpen, (open) => {
  if (!open) releaseSrc()
})

onBeforeUnmount(releaseSrc)
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

    <ImageCropper
      v-model:open="cropOpen"
      :src="cropSrc"
      :aspect-ratio="aspectRatio"
      :circular="circular"
      :output-width="cropWidth"
      :output-height="cropHeight"
      :format="outputFormat"
      :quality="quality"
      @confirm="onCropped"
    />
  </div>
</template>
