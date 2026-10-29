import { expect, test } from 'vitest'
import { toTestimonialFields, validateTestimonial } from '@/lib/admin/testimonials'

test('quote and name are required', () => {
  const r = validateTestimonial({ quote: ' ', personName: '' })
  expect(r.ok).toBe(false)
  expect(!r.ok && r.errors).toEqual({ quote: 'Add the quote', personName: 'Add who said it' })
})

test('photo is optional', () => {
  const r = validateTestimonial({ quote: 'Lovely', personName: 'Asha', photo: null })
  expect(r.ok && r.value).toEqual({ quote: 'Lovely', personName: 'Asha', photo: null })
})

test('photo description defaults to the name', () => {
  const f = toTestimonialFields({ quote: 'Lovely', personName: 'Asha', photo: { assetId: 'image-a', alt: '' } })
  expect(f.personImage).toMatchObject({ asset: { _ref: 'image-a' }, alt: 'Asha' })
  expect(toTestimonialFields({ quote: 'Q', personName: 'N', photo: null }).personImage).toBeNull()
})
