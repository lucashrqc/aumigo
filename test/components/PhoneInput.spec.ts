import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { z } from 'zod'
import PhoneInput from '@/components/PhoneInput.vue'

const phoneSchema = z.string().trim().regex(/^\d{10,11}$/, 'invalid')

describe('PhoneInput', () => {
  it('emits unmasked digits for a cell number (11 digits) that pass the validator', async () => {
    const w = mount(PhoneInput)
    const input = w.get('input')
    await input.setValue('(11) 99999-9999')
    await input.trigger('input')

    const emitted = w.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    const last = emitted!.at(-1)![0] as string
    console.log('emitted value:', last)
    expect(last).toBe('11999999999')
    expect(phoneSchema.safeParse(last).success).toBe(true)
  })

  it('emits unmasked digits for a landline (10 digits)', async () => {
    const w = mount(PhoneInput)
    const input = w.get('input')
    await input.setValue('(11) 3333-4444')
    await input.trigger('input')
    const last = w.emitted('update:modelValue')!.at(-1)![0] as string
    console.log('emitted landline:', last)
    expect(last).toBe('1133334444')
    expect(phoneSchema.safeParse(last).success).toBe(true)
  })
})
