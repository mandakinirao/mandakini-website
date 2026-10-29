// @vitest-environment happy-dom
import { expect, test } from 'vitest'
import { blocksToHtml, htmlToBlocks, safeHref, type PTBlock } from '@/lib/admin/richtext'

function parse(html: string): HTMLElement {
  const el = document.createElement('div')
  el.innerHTML = html
  return el
}

/** Compare by meaning (text + marks + hrefs), ignoring generated keys. */
function shape(blocks: PTBlock[]) {
  return blocks.map((b) =>
    b.children.map((c) => ({
      text: c.text,
      marks: c.marks.map((m) => b.markDefs.find((d) => d._key === m)?.href ?? m).sort(),
    }))
  )
}

const sample: PTBlock[] = [
  {
    _type: 'block',
    _key: 'b1',
    style: 'normal',
    markDefs: [{ _key: 'l1', _type: 'link', href: 'https://example.com' }],
    children: [
      { _type: 'span', _key: 's1', text: 'Plain ', marks: [] },
      { _type: 'span', _key: 's2', text: 'bold', marks: ['strong'] },
      { _type: 'span', _key: 's3', text: ' and ', marks: [] },
      { _type: 'span', _key: 's4', text: 'italic', marks: ['em'] },
      { _type: 'span', _key: 's5', text: ' link', marks: ['l1'] },
    ],
  },
  {
    _type: 'block',
    _key: 'b2',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: 's6', text: 'Second paragraph.', marks: [] }],
  },
]

test('round-trips text, bold, italic and links', () => {
  expect(shape(htmlToBlocks(parse(blocksToHtml(sample))))).toEqual(shape(sample))
})

test('pasted formatting is flattened to paragraphs with bold kept', () => {
  const blocks = htmlToBlocks(parse('<h2 style="font-family:x">Hi</h2><p><span style="color:red">a <b>b</b></span></p><img src="x">'))
  expect(shape(blocks)).toEqual([
    [{ text: 'Hi', marks: [] }],
    [
      { text: 'a ', marks: [] },
      { text: 'b', marks: ['strong'] },
    ],
  ])
})

test('javascript links are dropped, text kept', () => {
  const blocks = htmlToBlocks(parse('<p><a href="javascript:alert(1)">x</a></p>'))
  expect(shape(blocks)).toEqual([[{ text: 'x', marks: [] }]])
  expect(blocks[0].markDefs).toEqual([])
})

test('empty paragraphs disappear', () => {
  expect(htmlToBlocks(parse('<p></p><p> </p><div><br></div>'))).toEqual([])
})

test('script content is ignored', () => {
  expect(shape(htmlToBlocks(parse('<p>ok<script>bad()</script></p>')))).toEqual([[{ text: 'ok', marks: [] }]])
})

test('loose text and line breaks become paragraphs', () => {
  expect(shape(htmlToBlocks(parse('first<div>second</div>')))).toEqual([
    [{ text: 'first', marks: [] }],
    [{ text: 'second', marks: [] }],
  ])
})

test('text is escaped in HTML', () => {
  const html = blocksToHtml([{ ...sample[1], children: [{ _type: 'span', _key: 'x', text: '<b>&', marks: [] }] }])
  expect(html).toContain('&lt;b&gt;&amp;')
})

test('safeHref', () => {
  expect(safeHref('https://a.com')).toBe('https://a.com')
  expect(safeHref('mailto:a@b.com')).toBe('mailto:a@b.com')
  expect(safeHref(' javascript:alert(1)')).toBeNull()
  expect(safeHref('a.com')).toBeNull()
})
