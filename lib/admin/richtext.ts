/**
 * Journal paragraph text: DOM (the editor's contentEditable box) ⇄ Portable
 * Text, limited to what the site renders — normal paragraphs with bold,
 * italic and links. Anything else (headings, fonts, colours, images,
 * scripts, unsafe links) is flattened or dropped.
 */

export interface PTSpan {
  _type: 'span'
  _key: string
  text: string
  marks: string[]
}

export interface PTLink {
  _key: string
  _type: 'link'
  href: string
}

export interface PTBlock {
  _type: 'block'
  _key: string
  style: 'normal'
  markDefs: PTLink[]
  children: PTSpan[]
}

const key = () => Math.random().toString(36).slice(2, 12)

export function safeHref(href: string): string | null {
  const h = (href ?? '').trim()
  return /^(https?:\/\/|mailto:)\S+$/i.test(h) ? h : null
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function blocksToHtml(blocks: PTBlock[]): string {
  return (blocks ?? [])
    .map((b) => {
      const inner = (b.children ?? [])
        .map((c) => {
          let html = esc(c.text ?? '')
          if (c.marks?.includes('em')) html = `<em>${html}</em>`
          if (c.marks?.includes('strong')) html = `<strong>${html}</strong>`
          const link = b.markDefs?.find((d) => c.marks?.includes(d._key) && d._type === 'link')
          const href = link && safeHref(link.href)
          if (href) html = `<a href="${esc(href)}">${html}</a>`
          return html
        })
        .join('')
      return `<p>${inner}</p>`
    })
    .join('')
}

const SKIP = new Set(['SCRIPT', 'STYLE', 'IMG', 'SVG', 'IFRAME', 'NOSCRIPT', 'TEMPLATE', 'VIDEO', 'AUDIO', 'OBJECT'])
const BLOCK = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'UL', 'OL', 'BLOCKQUOTE', 'PRE', 'SECTION', 'ARTICLE', 'TABLE', 'TR'])

interface Run {
  text: string
  strong: boolean
  em: boolean
  href: string | null
}

interface Marks {
  strong: boolean
  em: boolean
  href: string | null
}

export function htmlToBlocks(root: HTMLElement): PTBlock[] {
  const blocks: PTBlock[] = []
  let runs: Run[] = []

  const flush = () => {
    const merged: Run[] = []
    for (const r of runs) {
      const last = merged[merged.length - 1]
      if (last && last.strong === r.strong && last.em === r.em && last.href === r.href) last.text += r.text
      else merged.push({ ...r })
    }
    runs = []
    if (merged.length) {
      merged[0].text = merged[0].text.replace(/^\s+/, '')
      merged[merged.length - 1].text = merged[merged.length - 1].text.replace(/\s+$/, '')
    }
    const kept = merged.filter((r) => r.text.length > 0)
    if (!kept.length) return

    const markDefs: PTLink[] = []
    const linkKey = new Map<string, string>()
    const children: PTSpan[] = kept.map((r) => {
      const marks: string[] = []
      if (r.strong) marks.push('strong')
      if (r.em) marks.push('em')
      if (r.href) {
        if (!linkKey.has(r.href)) {
          const k = key()
          linkKey.set(r.href, k)
          markDefs.push({ _key: k, _type: 'link', href: r.href })
        }
        marks.push(linkKey.get(r.href) as string)
      }
      return { _type: 'span', _key: key(), text: r.text, marks }
    })
    blocks.push({ _type: 'block', _key: key(), style: 'normal', markDefs, children })
  }

  const walk = (node: Node, m: Marks) => {
    if (node.nodeType === 3) {
      const text = (node.textContent ?? '').replace(/\s+/g, ' ')
      if (text) runs.push({ text, ...m })
      return
    }
    if (node.nodeType !== 1) return
    const el = node as HTMLElement
    const tag = el.tagName.toUpperCase()
    if (SKIP.has(tag)) return
    if (tag === 'BR') {
      flush()
      return
    }
    const next: Marks = {
      strong: m.strong || tag === 'B' || tag === 'STRONG',
      em: m.em || tag === 'I' || tag === 'EM',
      href: tag === 'A' ? safeHref(el.getAttribute('href') ?? '') ?? m.href : m.href,
    }
    const isBlock = BLOCK.has(tag)
    if (isBlock) flush()
    el.childNodes.forEach((c) => walk(c, next))
    if (isBlock) flush()
  }

  root.childNodes.forEach((c) => walk(c, { strong: false, em: false, href: null }))
  flush()
  return blocks
}
