<script setup lang="ts">
import { Cropper, CircleStencil, RectangleStencil } from 'vue-advanced-cropper'
import { toast } from 'vue-sonner'

const props = withDefaults(
  defineProps<{
    open: boolean
    src: string | null
    aspectRatio?: number
    circular?: boolean
    outputWidth?: number
    outputHeight?: number
    format?: string
    quality?: number
  }>(),
  {
    aspectRatio: 1,
    circular: false,
    outputWidth: 1024,
    outputHeight: 1024,
    format: 'image/webp',
    quality: 0.9,
  },
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm', blob: Blob): void
}>()

const cropperRef = ref<InstanceType<typeof Cropper> | null>(null)
const processing = ref(false)

const stencilComponent = computed(() =>
  props.circular ? CircleStencil : RectangleStencil,
)

const canvasOptions = computed(() => ({
  maxWidth: props.outputWidth,
  maxHeight: props.outputHeight,
  imageSmoothingQuality: 'high' as const,
}))

function cancel() {
  emit('update:open', false)
}

async function confirm() {
  const result = cropperRef.value?.getResult()
  const canvas = result?.canvas
  if (!canvas) return

  processing.value = true
  try {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), props.format, props.quality)
    })
    if (!blob) {
      toast.error('Não foi possível processar a imagem')
      return
    }
    emit('confirm', blob)
    emit('update:open', false)
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Ajustar imagem</DialogTitle>
        <DialogDescription>
          Selecione a área da imagem que deseja usar.
        </DialogDescription>
      </DialogHeader>

      <ClientOnly>
        <div class="w-full min-w-0 overflow-hidden rounded-md bg-muted">
          <Cropper
            v-if="open && src"
            ref="cropperRef"
            :src="src"
            class="h-[55vh] max-h-[420px] w-full"
            :stencil-component="stencilComponent"
            :stencil-props="{ aspectRatio }"
            :canvas="canvasOptions"
          />
        </div>
      </ClientOnly>

      <DialogFooter>
        <Button variant="outline" :disabled="processing" @click="cancel">
          Cancelar
        </Button>
        <Button :disabled="processing" @click="confirm">
          {{ processing ? 'Processando…' : 'Confirmar' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
