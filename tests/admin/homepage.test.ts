import { expect, test } from 'vitest'
import { saveHomepage } from '@/lib/admin/homepage'
import { makeFakeClient } from './fake-sanity'

const img = (id: string) => ({ assetId: id, alt: '', key: id })

test('first save creates the homepage record with its fixed id, then sets both photos', async () => {
  const fake = makeFakeClient({})
  await saveHomepage(fake.client as never, { top: img('image-top'), bottom: img('image-bottom') })
  expect(fake.created).toEqual([{ _id: 'homepage', _type: 'homepage' }])
  expect(fake.patches).toHaveLength(1)
  expect(fake.patches[0].id).toBe('homepage')
  expect(fake.patches[0].set).toMatchObject({
    heroRevealTop: { asset: { _ref: 'image-top' }, alt: 'Homepage opening picture' },
    heroRevealBottom: { asset: { _ref: 'image-bottom' } },
  })
})

test('removing a photo unsets it', async () => {
  const fake = makeFakeClient({})
  await saveHomepage(fake.client as never, { top: null, bottom: img('image-bottom') })
  expect(fake.patches[0].unset).toEqual(['heroRevealTop'])
})
