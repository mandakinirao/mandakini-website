export const RESERVED_SLUGS = ['learn', 'classes', 'login', 'account']

export type Availability = 'available' | 'soldOut' | 'hidden'

export interface PrintImage {
  assetId: string
  alt: string
  key?: string
}

export interface PrintInput {
  title: string
  price: number
  editionSize: number | null
  howManyLeft: number | null
  description: string
  purchaseType: 'buy' | 'privateCollection'
  showInShop: boolean
  showOnHomepage: boolean
  images: PrintImage[]
}

export type PrintErrors = Partial<Record<keyof PrintInput, string>>

export function slugify(title: string): string {
  const s = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
    .replace(/-+$/, '')
  return s || 'print'
}

export function uniqueSlug(base: string, taken: string[]): string {
  const used = new Set([...taken, ...RESERVED_SLUGS])
  if (!used.has(base)) return base
  let n = 2
  while (used.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}

export function deriveAvailability(i: { showInShop: boolean; howManyLeft: number | null }): Availability {
  if (!i.showInShop) return 'hidden'
  if (i.howManyLeft === 0) return 'soldOut'
  return 'available'
}

/** Blank → null; otherwise a whole number ≥ 0, or NaN when it isn't one. */
function wholeNumber(v: unknown): number | null {
  const s = String(v ?? '').replace(/[,₹\s]/g, '')
  if (!s) return null
  const n = Number(s)
  return Number.isInteger(n) && n >= 0 ? n : NaN
}

function bool(v: unknown): boolean {
  return v === true || v === 'true' || v === 'on'
}

function images(v: unknown): PrintImage[] {
  const list = typeof v === 'string' ? (JSON.parse(v || '[]') as unknown) : v
  if (!Array.isArray(list)) return []
  return list
    .filter((i): i is PrintImage => Boolean(i && typeof i.assetId === 'string' && i.assetId))
    .map((i) => ({ assetId: i.assetId, alt: String(i.alt ?? '').slice(0, 200), key: i.key }))
}

export function validatePrintInput(
  raw: Record<string, unknown>,
  mode: 'create' | 'edit'
): { ok: true; value: PrintInput } | { ok: false; errors: PrintErrors } {
  const errors: PrintErrors = {}
  const title = String(raw.title ?? '').trim()
  const purchaseType = raw.purchaseType === 'privateCollection' ? 'privateCollection' : 'buy'
  const price = wholeNumber(raw.price)
  const editionSize = wholeNumber(raw.editionSize)
  let howManyLeft = wholeNumber(raw.howManyLeft)
  let imgs: PrintImage[] = []
  try {
    imgs = images(raw.images)
  } catch {
    errors.images = 'Something went wrong with the photos. Try adding them again.'
  }

  if (!title) errors.title = 'Add a title'
  else if (title.length > 120) errors.title = 'Keep the title under 120 characters'

  if (Number.isNaN(price)) errors.price = 'Use a whole number, like 4800'
  else if (purchaseType === 'buy' && !price) errors.price = 'Add a price'

  if (Number.isNaN(editionSize) || editionSize === 0) errors.editionSize = 'Use a whole number, like 50'

  if (mode === 'create' && howManyLeft === null && Number.isFinite(editionSize)) howManyLeft = editionSize
  if (Number.isNaN(howManyLeft)) errors.howManyLeft = 'Use a whole number, like 12'
  else if (
    typeof howManyLeft === 'number' &&
    typeof editionSize === 'number' &&
    !Number.isNaN(editionSize) &&
    howManyLeft > editionSize
  ) {
    errors.howManyLeft = "Can't be more than the edition size"
  }

  if (!errors.images && imgs.length === 0) errors.images = 'Add at least one photo'

  if (Object.keys(errors).length) return { ok: false, errors }
  return {
    ok: true,
    value: {
      title,
      price: price ?? 0,
      editionSize,
      howManyLeft,
      description: String(raw.description ?? '').trim().slice(0, 2000),
      purchaseType,
      showInShop: bool(raw.showInShop),
      showOnHomepage: bool(raw.showOnHomepage),
      images: imgs,
    },
  }
}

function key(): string {
  return Math.random().toString(36).slice(2, 12)
}

export function toShopItemFields(input: PrintInput): Record<string, unknown> {
  return {
    title: input.title,
    basePrice: input.price,
    editionSize: input.editionSize,
    stock: input.howManyLeft,
    description: input.description,
    purchaseType: input.purchaseType,
    availabilityStatus: deriveAvailability(input),
    featuredOnHomepage: input.showOnHomepage,
    images: input.images.map((img) => ({
      _type: 'image',
      _key: img.key || key(),
      asset: { _type: 'reference', _ref: img.assetId },
      alt: img.alt.trim() || input.title,
    })),
  }
}
