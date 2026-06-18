/**
 * Seed the Sanity dataset with the initial 3 shop items.
 * Run once: node scripts/seed-shop.mjs
 *
 * Uses the locally cached Sanity CLI auth token — no extra env needed.
 * Re-running is safe: documents with the same slug are skipped.
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const PROJECT_ID = 'i4t9kzxg'
const DATASET = 'production'
const API_VERSION = '2024-01-01'

// Read the local Sanity CLI auth token (set by `sanity login`)
let token
try {
  const cfg = JSON.parse(readFileSync(join(homedir(), '.config/sanity/config.json'), 'utf8'))
  token = cfg.authToken
} catch {
  console.error('No Sanity auth token found. Run: npx sanity login')
  process.exit(1)
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token,
  useCdn: false,
})

const ITEMS = [
  {
    _type: 'shopItem',
    title: 'Subbulakshmi, Singing — Print',
    slug: { _type: 'slug', current: 'subbulakshmi-singing-print' },
    desc: 'Archival giclée print of the duotone portrait, on 308gsm cotton rag. Signed and numbered by hand in the Hyderabad studio, shipped rolled with a certificate of authenticity.',
    itemType: 'print',
    purchaseType: 'buy',
    basePrice: 4800,
    editionSize: 50,
    sold: 0,
    stock: 50,
    availabilityStatus: 'available',
    certificateIncluded: true,
    shippingInfo: 'Rolled, worldwide from Hyderabad',
    sizes: [
      { _key: 'a4', label: 'A4 (21 × 29.7 cm)', price: 4800 },
      { _key: 'a3', label: 'A3 (29.7 × 42 cm)', price: 6800 },
    ],
  },
  {
    _type: 'shopItem',
    title: 'Palette No. 9 — Print',
    slug: { _type: 'slug', current: 'palette-no-9-print' },
    desc: 'A study in earth and ochre from the palette series. Archival print on cotton rag, signed and numbered, shipped rolled from Hyderabad.',
    itemType: 'print',
    purchaseType: 'buy',
    basePrice: 3600,
    editionSize: 50,
    sold: 0,
    stock: 50,
    availabilityStatus: 'available',
    certificateIncluded: true,
    shippingInfo: 'Rolled, worldwide from Hyderabad',
    sizes: [
      { _key: 'a4', label: 'A4 (21 × 29.7 cm)', price: 3600 },
      { _key: 'a3', label: 'A3 (29.7 × 42 cm)', price: 5400 },
    ],
  },
  {
    _type: 'shopItem',
    title: 'Raga in Ochre — Print',
    slug: { _type: 'slug', current: 'raga-in-ochre-print' },
    desc: 'From the Subbulakshmi series — a small edition of thirty. Archival giclée on cotton rag, signed and numbered, with certificate.',
    itemType: 'print',
    purchaseType: 'buy',
    basePrice: 5200,
    editionSize: 30,
    sold: 0,
    stock: 30,
    availabilityStatus: 'available',
    certificateIncluded: true,
    shippingInfo: 'Rolled, worldwide from Hyderabad',
    sizes: [
      { _key: 'a4', label: 'A4 (21 × 29.7 cm)', price: 5200 },
      { _key: 'a3', label: 'A3 (29.7 × 42 cm)', price: 7500 },
    ],
  },
]

async function seed() {
  console.log(`Seeding ${ITEMS.length} shop items into ${PROJECT_ID}/${DATASET}…\n`)

  for (const item of ITEMS) {
    const slug = item.slug.current

    // Check if already exists
    const existing = await client.fetch(
      `*[_type == "shopItem" && slug.current == $slug][0]._id`,
      { slug }
    )

    if (existing) {
      console.log(`  ⏭  skipped  ${slug}  (already exists: ${existing})`)
      continue
    }

    const doc = await client.create(item)
    console.log(`  ✓  created  ${slug}  (${doc._id})`)
  }

  console.log('\nDone. Open /studio to add product images in the Studio.')
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
