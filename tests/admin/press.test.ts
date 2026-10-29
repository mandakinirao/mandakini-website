import { expect, test } from 'vitest'
import { lookUpLink, toPressFields, validatePress } from '@/lib/admin/press'

const photo = { assetId: 'image-c', alt: '' }

test('a link must look like a web address', () => {
  const r = validatePress({ link: 'telangana today', type: 'article' })
  expect(!r.ok && r.errors.link).toBe("That link doesn't look right")
})

test('needs a link or a photo of the clipping', () => {
  const r = validatePress({ link: '', type: 'article', thumbnail: null })
  expect(!r.ok && r.errors.link).toBe('Add the link or a photo of the clipping')
})

test('a clipping with only a photo is fine', () => {
  const r = validatePress({ link: '', type: 'article', thumbnail: photo, headline: 'City on Canvas' })
  expect(r.ok && r.value.link).toBe(null)
})

test('unknown type falls back to article', () => {
  const r = validatePress({ link: 'https://example.com/a', type: 'blog' })
  expect(r.ok && r.value.type).toBe('article')
})

test('maps to stored fields, blanks become null', () => {
  const f = toPressFields({ link: 'https://x.com', type: 'video', headline: '', source: 'The Hindu', thumbnail: null, logoCard: true, showOnHomepage: false })
  expect(f).toEqual({
    link: 'https://x.com',
    type: 'video',
    headlineOverride: null,
    source: 'The Hindu',
    thumbnailOverride: null,
    logoCard: true,
    featuredOnHomepage: false,
  })
})

test('lookUpLink: a page that cannot be read gives no suggestions', async () => {
  const r = await lookUpLink('https://paywalled.example', async () => {
    throw new Error('timeout')
  })
  expect(r).toEqual({})
})

test('lookUpLink returns what it found', async () => {
  const r = await lookUpLink('https://x.com', async () => [
    { _id: 'x', url: 'https://x.com', type: 'article', headline: 'H', thumbnail: 'u', source: 'S', displayOrder: 0, mode: 'photo' as const },
  ])
  expect(r).toEqual({ headline: 'H', source: 'S', image: 'u' })
})
