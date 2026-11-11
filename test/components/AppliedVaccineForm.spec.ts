import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import type { AppliedVaccineDto } from '#shared/types'
import AppliedVaccineForm from '@/components/AppliedVaccineForm.vue'

beforeEach(() => {
  vi.stubGlobal('useVaccineOptions', () => ({
    items: [],
    isFetching: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    resolveById: vi.fn(),
    setSearch: vi.fn(),
    loadMore: vi.fn(),
  }))
})

// FormField exposes an `id` to its default slot (some fields rely on it).
const FormField = defineComponent({
  name: 'FormField',
  setup: (_props, { slots }) => () => h('div', slots.default?.({ id: 'f-id' })),
})
const AsyncCombobox = defineComponent({ name: 'AsyncCombobox', render: () => null })
const DatePickerInput = defineComponent({ name: 'DatePickerInput', render: () => null })
const Input = defineComponent({ name: 'Input', render: () => null })
const Button = defineComponent({
  name: 'Button',
  props: { disabled: { type: Boolean, default: false } },
  setup: (props, { slots }) => () =>
    h('button', { type: 'submit', disabled: props.disabled }, slots.default?.()),
})

function mountForm(initial?: AppliedVaccineDto | null) {
  return mount(AppliedVaccineForm, {
    props: { initial },
    global: { stubs: { FormField, AsyncCombobox, DatePickerInput, Input, Button } },
  })
}

const VACCINE_ID = '11111111-1111-4111-8111-111111111111'

const record: AppliedVaccineDto = {
  id: 'app-1',
  petId: 'pet-1',
  vaccineId: VACCINE_ID,
  vetLicense: null,
  batchNumber: 'LOT-1',
  applicationDate: '2026-01-10',
  nextDoseDate: '2027-01-10',
}

describe('AppliedVaccineForm', () => {
  it('emits the parsed fields payload (without petId) when seeded from an existing record', async () => {
    const wrapper = mountForm(record)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const events = wrapper.emitted('submit')
    expect(events).toHaveLength(1)
    expect(events?.[0]?.[0]).toEqual({
      vaccineId: VACCINE_ID,
      applicationDate: '2026-01-10',
      nextDoseDate: '2027-01-10',
      vetLicense: null,
      batchNumber: 'LOT-1',
    })
  })

  it('does not emit when required fields are empty', async () => {
    const wrapper = mountForm(null)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.emitted('submit')).toBeUndefined()
  })
})
