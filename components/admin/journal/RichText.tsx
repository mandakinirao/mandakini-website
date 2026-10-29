'use client'

import { useEffect, useRef, useState } from 'react'
import { blocksToHtml, htmlToBlocks, safeHref, type PTBlock } from '@/lib/admin/richtext'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Small writing box: paragraphs with Bold, Italic and Link. Pasted text arrives as plain paragraphs. */
export default function RichText({
  value,
  onChange,
  placeholder,
  big = false,
}: {
  value: PTBlock[]
  onChange: (blocks: PTBlock[]) => void
  placeholder?: string
  big?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const saved = useRef<Range | null>(null)
  const [linking, setLinking] = useState(false)
  const [href, setHref] = useState('')
  const [linkError, setLinkError] = useState('')
  const [empty, setEmpty] = useState(!value?.length)

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = blocksToHtml(value ?? []) || '<p><br></p>'
    // Initial content only — the box owns its DOM after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const emit = () => {
    if (!ref.current) return
    const blocks = htmlToBlocks(ref.current)
    setEmpty(blocks.length === 0)
    onChange(blocks)
  }

  const cmd = (name: string, arg?: string) => {
    ref.current?.focus()
    document.execCommand(name, false, arg)
    emit()
  }

  return (
    <div className="mr-admin-rt">
      <div className="mr-admin-rt__bar" role="toolbar" aria-label="Text style">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => cmd('bold')} aria-label="Bold"><strong>B</strong></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => cmd('italic')} aria-label="Italic"><em>I</em></button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const sel = window.getSelection()
            saved.current = sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null
            setHref('')
            setLinkError('')
            setLinking(true)
          }}
        >
          Link
        </button>
        {linking && (
          <span className="mr-admin-rt__link">
            <input
              autoFocus
              value={href}
              placeholder="https://…"
              onChange={(e) => setHref(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault()
                if (e.key === 'Escape') setLinking(false)
              }}
            />
            <button
              type="button"
              onClick={() => {
                const safe = safeHref(href)
                if (!safe) {
                  setLinkError('Use a full web address starting with https://')
                  return
                }
                const sel = window.getSelection()
                if (saved.current && sel) {
                  sel.removeAllRanges()
                  sel.addRange(saved.current)
                }
                if (sel && !sel.isCollapsed) cmd('createLink', safe)
                else cmd('insertHTML', `<a href="${esc(safe)}">${esc(safe)}</a>`)
                setLinking(false)
              }}
            >
              Add link
            </button>
            <button type="button" onClick={() => setLinking(false)}>Cancel</button>
            {linkError && <small className="mr-admin-error">{linkError}</small>}
          </span>
        )}
      </div>
      <div
        ref={ref}
        className={`mr-admin-rt__box${big ? ' mr-admin-rt__box--big' : ''}${empty ? ' mr-admin-rt__box--empty' : ''}`}
        data-placeholder={placeholder}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        onInput={emit}
        onBlur={emit}
        onPaste={(e) => {
          e.preventDefault()
          const text = e.clipboardData.getData('text/plain')
          const paras = text.split(/\r?\n\s*\r?\n|\r?\n/).map((t) => t.trim()).filter(Boolean)
          if (paras.length <= 1) document.execCommand('insertText', false, paras[0] ?? '')
          else document.execCommand('insertHTML', false, paras.map((p) => `<p>${esc(p)}</p>`).join(''))
          emit()
        }}
      />
    </div>
  )
}
