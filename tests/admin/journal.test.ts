import { expect, test } from 'vitest'
import { toPostFields, validatePost, type PostInput } from '@/lib/admin/journal'

const block = (text: string, extra: Record<string, unknown> = {}) => ({
  _type: 'block',
  _key: 'b-' + text.slice(0, 4),
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: 's-' + text.slice(0, 4), text, marks: [] }],
  ...extra,
})

// Real shape of the first paragraph of "100 Days Project" (text shortened).
const realParagraph = {
  key: '9a0b79472b6a',
  text: [block('I am back with a new art project'), block('Starting from May 23rd 2019'), block('Why is it 100 days')],
  photos: [{ assetId: 'image-d9269921c7382b5919f565354678fe319ff1f3d7-684x984-png', alt: 'MS Subbalakshmi', key: 'cd81775090ee' }],
  position: 'right',
  displayMode: 'collage',
  pullQuote: false,
}

const post = (over: Record<string, unknown> = {}) => ({
  title: '100 Days Project',
  kicker: '- Mandakini Rao',
  excerpt: '100 days. 94 paintings.',
  cover: { assetId: 'image-cover', alt: 'Cover' },
  publishedAt: '2026-07-17T16:09:18.767Z',
  featured: true,
  paragraphs: [realParagraph],
  ...over,
})

test('an existing paragraph saves back unchanged', () => {
  const r = validatePost(post())
  expect(r.ok).toBe(true)
  const f = toPostFields((r as unknown as { value: PostInput }).value)
  expect(f.body).toEqual([
    {
      _type: 'journalSection',
      _key: '9a0b79472b6a',
      text: realParagraph.text,
      images: [
        {
          _type: 'image',
          _key: 'cd81775090ee',
          asset: { _type: 'reference', _ref: realParagraph.photos[0].assetId },
          alt: 'MS Subbalakshmi',
        },
      ],
      position: 'right',
      displayMode: 'collage',
      pullQuote: false,
    },
  ])
  expect(f).toMatchObject({ title: '100 Days Project', kicker: '- Mandakini Rao', featured: true, publishedAt: '2026-07-17T16:09:18.767Z' })
  expect(f.coverImage).toMatchObject({ asset: { _ref: 'image-cover' }, alt: 'Cover' })
})

test('unsafe links and unknown marks are removed on save', () => {
  const dirty = {
    ...block('x'),
    style: 'h1',
    markDefs: [{ _key: 'l1', _type: 'link', href: 'javascript:alert(1)' }],
    children: [{ _type: 'span', _key: 's', text: 'x', marks: ['l1', 'strong', 'underline'] }],
  }
  const r = validatePost(post({ paragraphs: [{ ...realParagraph, text: [dirty] }] }))
  const b = (r as { value: { paragraphs: { text: { style: string; markDefs: unknown[]; children: { marks: string[] }[] }[] }[] } }).value.paragraphs[0].text[0]
  expect(b.style).toBe('normal')
  expect(b.markDefs).toEqual([])
  expect(b.children[0].marks).toEqual(['strong'])
})

test('empty paragraphs are dropped quietly', () => {
  const r = validatePost(post({ paragraphs: [realParagraph, { key: 'e', text: [], photos: [], position: 'right', displayMode: 'collage', pullQuote: false }] }))
  expect(r.ok && r.value.paragraphs).toHaveLength(1)
})

test('a post needs at least one paragraph', () => {
  const r = validatePost(post({ paragraphs: [] }))
  expect(!r.ok && r.errors.paragraphs).toBe('Write at least one paragraph')
})

test('title and cover are required', () => {
  const r = validatePost(post({ title: ' ', cover: null }))
  expect(!r.ok && r.errors).toMatchObject({ title: 'Add a title', cover: 'Add a cover photo' })
})

test('a big quote cannot have photos', () => {
  const r = validatePost(post({ paragraphs: [{ ...realParagraph, pullQuote: true }] }))
  expect(r.ok && r.value.paragraphs[0].pullQuote).toBe(false)
})

test('text-only paragraph stores no photo settings', () => {
  const r = validatePost(post({ paragraphs: [{ key: 'q', text: [block('A quote')], photos: [], position: 'left', displayMode: 'carousel', pullQuote: true }] }))
  const f = toPostFields((r as unknown as { value: PostInput }).value)
  expect(f.body[0]).toEqual({ _type: 'journalSection', _key: 'q', text: [block('A quote')], pullQuote: true })
})

test('photo captions are kept and descriptions default to the title', () => {
  const r = validatePost(post({ paragraphs: [{ ...realParagraph, photos: [{ assetId: 'image-a', alt: '', caption: ' Day 1 ', key: 'p1' }] }] }))
  const f = toPostFields((r as unknown as { value: PostInput }).value)
  expect(f.body[0].images).toEqual([{ _type: 'image', _key: 'p1', asset: { _type: 'reference', _ref: 'image-a' }, alt: '100 Days Project', caption: 'Day 1' }])
})

test('a missing date becomes now', () => {
  const r = validatePost(post({ publishedAt: '' }))
  expect(r.ok && Date.parse(r.value.publishedAt)).toBeGreaterThan(Date.parse('2026-01-01'))
})
