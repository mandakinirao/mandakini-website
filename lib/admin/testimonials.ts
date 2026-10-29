import { imageField } from '@/lib/admin/content'
import type { PrintImage } from '@/lib/admin/shop'

export interface TestimonialInput {
  quote: string
  personName: string
  photo: PrintImage | null
}

export function validateTestimonial(
  raw: Record<string, unknown>
): { ok: true; value: TestimonialInput } | { ok: false; errors: Partial<Record<keyof TestimonialInput, string>> } {
  const quote = String(raw.quote ?? '').trim().slice(0, 1500)
  const personName = String(raw.personName ?? '').trim().slice(0, 120)
  const p = raw.photo as PrintImage | null | undefined
  const photo = p && typeof p.assetId === 'string' && p.assetId ? { assetId: p.assetId, alt: String(p.alt ?? ''), key: p.key } : null
  const errors: Partial<Record<keyof TestimonialInput, string>> = {}
  if (!quote) errors.quote = 'Add the quote'
  if (!personName) errors.personName = 'Add who said it'
  if (Object.keys(errors).length) return { ok: false, errors }
  return { ok: true, value: { quote, personName, photo } }
}

export function toTestimonialFields(v: TestimonialInput) {
  return {
    quote: v.quote,
    personName: v.personName,
    personImage: imageField(v.photo, v.personName),
  }
}
