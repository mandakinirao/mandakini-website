import { expect, test } from 'vitest'
import { DEFAULTS } from '@/lib/site-settings'
import { WEBSITE_WORDS, saveAbout, saveWebsiteWords } from '@/lib/admin/singletons'
import { makeFakeClient } from './fake-sanity'

test('website words cover every setting the site reads', () => {
  expect(WEBSITE_WORDS.map((w) => w.key).sort()).toEqual(Object.keys(DEFAULTS).sort())
})

test('website words: trimmed, blanks removed, record created with its fixed id', async () => {
  const fake = makeFakeClient({})
  await saveWebsiteWords(fake.client as never, { shopPageHeadline: '  New  ', contactEmail: '' })
  expect(fake.created).toEqual([{ _id: 'siteSettings', _type: 'siteSettings' }])
  expect(fake.patches[0].id).toBe('siteSettings')
  expect(fake.patches[0].set).toEqual({ shopPageHeadline: 'New' })
  expect(fake.patches[0].unset).toContain('contactEmail')
  expect(fake.patches[0].unset).toContain('thankYouMessage')
})

test('website words ignore keys the site does not read', async () => {
  const fake = makeFakeClient({})
  await saveWebsiteWords(fake.client as never, { shopPageHeadline: 'A', _id: 'x', evil: 'y' })
  expect(fake.patches[0].set).toEqual({ shopPageHeadline: 'A' })
})

const about = { portrait: null, bio: ' Hello ', homeSnippet: '', teaserLine: 'Line' }

test('about patches the existing aboutPage record', async () => {
  const fake = makeFakeClient({}, () => 'abc')
  await saveAbout(fake.client as never, about)
  expect(fake.created).toEqual([])
  expect(fake.patches[0].id).toBe('abc')
  expect(fake.patches[0].set).toEqual({ aboutBlockBio: 'Hello', aboutTeaserLine: 'Line' })
  expect(fake.patches[0].unset).toEqual(expect.arrayContaining(['aboutBlockPortrait', 'homeSnippet']))
})

test('about creates aboutPage when there is none', async () => {
  const fake = makeFakeClient({}, () => null)
  await saveAbout(fake.client as never, about)
  expect(fake.created).toEqual([{ _id: 'aboutPage', _type: 'aboutPage' }])
  expect(fake.patches[0].id).toBe('aboutPage')
})
