import { expect, test } from 'vitest'
import { toProjectFields, validateProject } from '@/lib/admin/projects'

const photo = { assetId: 'image-a', alt: '', key: 'k1' }

test('name is required', () => {
  const r = validateProject({ name: ' ', photos: [photo] })
  expect(!r.ok && r.errors.name).toBe('Add a name')
})

test('at least one photo', () => {
  const r = validateProject({ name: 'Series', photos: [] })
  expect(!r.ok && r.errors.photos).toBe('Add at least one photo')
})

test('a long description is allowed (the warning is only on screen)', () => {
  const r = validateProject({ name: 'Series', description: 'x'.repeat(400), photos: [photo] })
  expect(r.ok).toBe(true)
})

test('year is trimmed and switches pass through', () => {
  const r = validateProject({ name: 'Series', year: ' 2024 ', photos: [photo], showOnHomepage: true })
  expect(r.ok && r.value).toMatchObject({ name: 'Series', year: '2024', showOnHomepage: true })
})

test('maps to stored fields with photo descriptions defaulting to the name', () => {
  const f = toProjectFields({ name: 'Series', year: '2024', description: 'd', photos: [photo], showOnHomepage: false })
  expect(f).toMatchObject({ seriesName: 'Series', year: '2024', description: 'd', featuredOnHomepage: false })
  expect(f.gallery).toEqual([{ _type: 'image', _key: 'k1', asset: { _type: 'reference', _ref: 'image-a' }, alt: 'Series' }])
})
