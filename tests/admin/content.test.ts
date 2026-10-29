import { expect, test } from 'vitest'
import { imageField, reorderDocs } from '@/lib/admin/content'
import { makeFakeClient } from './fake-sanity'

test('reorderDocs writes 1-based positions in one transaction', async () => {
  const fake = makeFakeClient({})
  await reorderDocs(fake.client as never, ['a', 'b'], 'homepageOrder')
  expect(fake.transactions).toEqual([
    [
      { id: 'a', set: { homepageOrder: 1 } },
      { id: 'b', set: { homepageOrder: 2 } },
    ],
  ])
})

test('imageField: no photo is null', () => {
  expect(imageField(null, 'Title')).toBeNull()
})

test('imageField: blank description falls back to the title', () => {
  const f = imageField({ assetId: 'image-x', alt: '' }, 'Title')
  expect(f).toMatchObject({ _type: 'image', asset: { _type: 'reference', _ref: 'image-x' }, alt: 'Title' })
  expect(typeof (f as { _key: string })._key).toBe('string')
})
