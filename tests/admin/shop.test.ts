import { describe, expect, test } from 'vitest'
import {
  deriveAvailability,
  slugify,
  toShopItemFields,
  uniqueSlug,
  validatePrintInput,
  type PrintInput,
} from '@/lib/admin/shop'

describe('slugify', () => {
  test('makes a clean web address from a title', () => {
    expect(slugify('Raga in Ochre (Print)')).toBe('raga-in-ochre-print')
    expect(slugify('Dhyānam')).toBe('dhyanam')
    expect(slugify('!!!')).toBe('print')
  })
})

describe('uniqueSlug', () => {
  test('skips taken and reserved addresses', () => {
    expect(uniqueSlug('dhyanam', ['dhyanam', 'dhyanam-2'])).toBe('dhyanam-3')
    expect(uniqueSlug('login', [])).toBe('login-2')
    expect(uniqueSlug('fresh', ['other'])).toBe('fresh')
  })
})

describe('deriveAvailability', () => {
  test('hidden, sold out, available', () => {
    expect(deriveAvailability({ showInShop: false, howManyLeft: 5 })).toBe('hidden')
    expect(deriveAvailability({ showInShop: true, howManyLeft: 0 })).toBe('soldOut')
    expect(deriveAvailability({ showInShop: true, howManyLeft: null })).toBe('available')
    expect(deriveAvailability({ showInShop: true, howManyLeft: 3 })).toBe('available')
  })
})

const raw = (over: Record<string, unknown> = {}) => ({
  title: 'Dhyanam',
  price: '4800',
  editionSize: '50',
  howManyLeft: '',
  description: 'A print.',
  purchaseType: 'buy',
  showInShop: true,
  showOnHomepage: false,
  images: [{ assetId: 'image-abc-100x100-jpg', alt: '' }],
  ...over,
})

describe('validatePrintInput', () => {
  test('title is required', () => {
    const r = validatePrintInput(raw({ title: '  ' }), 'create')
    expect(r.ok).toBe(false)
    expect(!r.ok && r.errors.title).toBe('Add a title')
  })

  test('price is required for prints sold online', () => {
    const r = validatePrintInput(raw({ price: '0' }), 'create')
    expect(!r.ok && r.errors.price).toBe('Add a price')
  })

  test('enquiry-only prints may have no price', () => {
    expect(validatePrintInput(raw({ price: '', purchaseType: 'privateCollection' }), 'create').ok).toBe(true)
  })

  test('how many left defaults to the edition size on create', () => {
    const r = validatePrintInput(raw(), 'create')
    expect(r.ok && r.value.howManyLeft).toBe(50)
  })

  test('blank how many left stays blank on edit', () => {
    const r = validatePrintInput(raw(), 'edit')
    expect(r.ok && r.value.howManyLeft).toBe(null)
  })

  test('how many left cannot exceed edition size', () => {
    const r = validatePrintInput(raw({ howManyLeft: '60' }), 'create')
    expect(!r.ok && r.errors.howManyLeft).toBe("Can't be more than the edition size")
  })

  test('a bad edition size reports only that field', () => {
    const r = validatePrintInput(raw({ editionSize: 'fifty' }), 'create')
    expect(!r.ok && r.errors).toEqual({ editionSize: 'Use a whole number, like 50' })
  })

  test('at least one photo', () => {
    const r = validatePrintInput(raw({ images: [] }), 'create')
    expect(!r.ok && r.errors.images).toBe('Add at least one photo')
  })

  test('numbers parse and switches pass through', () => {
    const r = validatePrintInput(raw({ showOnHomepage: true }), 'create')
    expect(r.ok && r.value).toMatchObject({ title: 'Dhyanam', price: 4800, editionSize: 50, showOnHomepage: true })
  })
})

describe('toShopItemFields', () => {
  const input: PrintInput = {
    title: 'Dhyanam',
    price: 4800,
    editionSize: 50,
    howManyLeft: 12,
    description: 'A print.',
    purchaseType: 'buy',
    showInShop: false,
    showOnHomepage: true,
    images: [{ assetId: 'image-abc-100x100-jpg', alt: '', key: 'k1' }],
  }

  test('maps to the stored fields', () => {
    const f = toShopItemFields(input)
    expect(f).toMatchObject({
      title: 'Dhyanam',
      basePrice: 4800,
      editionSize: 50,
      stock: 12,
      description: 'A print.',
      purchaseType: 'buy',
      availabilityStatus: 'hidden',
      featuredOnHomepage: true,
    })
    expect(f.images).toEqual([
      { _type: 'image', _key: 'k1', asset: { _type: 'reference', _ref: 'image-abc-100x100-jpg' }, alt: 'Dhyanam' },
    ])
  })
})

describe('splitNulls', () => {
  test('blank numbers become fields to remove', async () => {
    const { splitNulls } = await import('@/lib/admin/shop')
    expect(splitNulls({ title: 'A', stock: null, editionSize: 50, sold: 0 })).toEqual({
      set: { title: 'A', editionSize: 50, sold: 0 },
      unset: ['stock'],
    })
  })
})
