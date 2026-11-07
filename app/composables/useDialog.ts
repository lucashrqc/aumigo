import {
  type Component,
  type InjectionKey,
  inject,
  markRaw,
  reactive,
} from 'vue'

export interface DialogProps {
  title?: string
  description?: string
  [key: string]: unknown
}

export interface OpenDialogOptions {
  dialogProps?: DialogProps
  props?: Record<string, unknown>
  listeners?: Record<string, (...args: unknown[]) => void>
}

export interface DialogEntry {
  id: string
  component: Component
  dialogProps: DialogProps
  props: Record<string, unknown>
  listeners: Record<string, (...args: unknown[]) => void>
  open: boolean
  closing: boolean
  resolve: (value: unknown) => void
}

export const DialogContextKey: InjectionKey<{ id: string }> = Symbol('dialog')

const stack = reactive(new Map<string, DialogEntry>())
let seq = 0

export default function useDialog() {
  const ctx = inject(DialogContextKey, null)

  function open<T = unknown>(
    component: Component,
    options: OpenDialogOptions = {},
  ) {
    const id = `dlg-${++seq}`
    return new Promise<T>((resolve) => {
      stack.set(id, {
        id,
        component: markRaw(component),
        dialogProps: options.dialogProps ?? {},
        props: options.props ?? {},
        listeners: options.listeners ?? {},
        open: true,
        closing: false,
        resolve: resolve as (value: unknown) => void,
      })
    })
  }

  // Flip `open` so reka-ui animates out, resolve once, then unmount after it ends.
  function closeById(id: string, result?: unknown) {
    const entry = stack.get(id)
    if (!entry || entry.closing) return
    entry.closing = true
    entry.open = false
    entry.resolve(result)
    setTimeout(() => stack.delete(id), 500)
  }

  // Closes the dialog this was called from, falling back to the top of the stack.
  function close(result?: unknown) {
    const id = ctx?.id ?? [...stack.keys()].at(-1)
    if (id) closeById(id, result)
  }

  function closeAll() {
    stack.forEach((entry) => entry.resolve(undefined))
    stack.clear()
  }

  return { open, close, closeById, closeAll, stack }
}
