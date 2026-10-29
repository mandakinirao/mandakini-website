'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition, type SetStateAction } from 'react'
import { deletePost, savePost } from '@/app/admin/(panel)/journal/actions'
import ConfirmButton from '@/components/admin/ConfirmButton'
import type { Photo } from '@/components/admin/PhotoDropzone'
import SinglePhoto from '@/components/admin/SinglePhoto'
import ParagraphCard, { type ParagraphState } from '@/components/admin/journal/ParagraphCard'
import { toPrintImage } from '@/lib/admin/photos'

export interface PostValues {
  title: string
  kicker: string
  excerpt: string
  date: string // yyyy-mm-dd
  featured: boolean
  cover: Photo | null
  paragraphs: ParagraphState[]
}

const newKey = () => Math.random().toString(36).slice(2, 14)
export const emptyParagraph = (): ParagraphState => ({ key: newKey(), text: [], photos: [], position: 'right', displayMode: 'collage', pullQuote: false })

export default function PostEditor({ id, initial }: { id?: string; initial: PostValues }) {
  const router = useRouter()
  const [v, setV] = useState(initial)
  const [paras, setParas] = useState(initial.paragraphs)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<{ ok: boolean; text: string; href?: string } | null>(null)
  const [dirty, setDirty] = useState(false)
  const [pending, start] = useTransition()

  const uploading = v.cover?.status === 'uploading' || paras.some((p) => p.photos.some((ph) => ph.status === 'uploading'))
  const set = <K extends keyof PostValues>(k: K, value: PostValues[K]) => {
    setV((o) => ({ ...o, [k]: value }))
    setDirty(true)
  }
  const patchPara = (key: string, patch: Partial<ParagraphState>) => {
    setParas((ps) => ps.map((p) => (p.key === key ? { ...p, ...patch } : p)))
    setDirty(true)
  }
  const photosSetter = useCallback(
    (key: string) => (update: SetStateAction<Photo[]>) => {
      setParas((ps) => ps.map((p) => (p.key === key ? { ...p, photos: typeof update === 'function' ? update(p.photos) : update } : p)))
      setDirty(true)
    },
    []
  )
  const insertAt = (i: number) => {
    setParas((ps) => [...ps.slice(0, i), emptyParagraph(), ...ps.slice(i)])
    setDirty(true)
  }
  const move = (i: number, dir: -1 | 1) => {
    setParas((ps) => {
      const next = [...ps]
      const [m] = next.splice(i, 1)
      next.splice(i + dir, 0, m)
      return next
    })
    setDirty(true)
  }

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function save() {
    setNotice(null)
    const raw = {
      title: v.title,
      kicker: v.kicker,
      excerpt: v.excerpt,
      featured: v.featured,
      publishedAt: v.date ? new Date(`${v.date}T12:00:00+05:30`).toISOString() : '',
      cover: toPrintImage(v.cover),
      paragraphs: paras.map((p) => ({
        key: p.key,
        text: p.text,
        position: p.position,
        displayMode: p.displayMode,
        pullQuote: p.pullQuote,
        photos: p.photos
          .filter((ph) => ph.status === 'done' && ph.assetId)
          .map((ph) => ({ assetId: ph.assetId, alt: ph.alt, caption: ph.caption ?? '', key: ph.key })),
      })),
    }
    start(async () => {
      const r = await savePost(id ?? null, raw)
      if (!r.ok) {
        setErrors(r.errors)
        setNotice({ ok: false, text: r.message ?? 'Some details need fixing. They’re marked below.' })
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      setErrors({})
      setDirty(false)
      setNotice({ ok: true, text: `“${v.title}” is live.`, href: `/journal/${r.slug}` })
      window.scrollTo({ top: 0, behavior: 'smooth' })
      if (!id) router.replace(`/admin/journal/${encodeURIComponent(r.id)}`)
    })
  }

  return (
    <>
      {notice && (
        <p className={`mr-admin-notice${notice.ok ? '' : ' mr-admin-notice--error'}`} role="status">
          {notice.text}{' '}
          {notice.href && <a href={notice.href} target="_blank" rel="noreferrer">View it on the site →</a>}
        </p>
      )}

      <section className="mr-admin-panel mr-admin-print">
        <SinglePhoto label="Cover photo" value={v.cover} onChange={(p) => set('cover', p)} hint="Shown on the Journal page and at the top of the post." error={errors.cover} />
        <div className="mr-admin-form">
          <label className={`mr-admin-field${errors.title ? ' mr-admin-field--invalid' : ''}`}>
            <span>Title</span>
            <input value={v.title} maxLength={160} onChange={(e) => set('title', e.target.value)} />
            {errors.title && <p className="mr-admin-error">{errors.title}</p>}
          </label>
          <label className="mr-admin-field">
            <span>Small line above the title (optional)</span>
            <input value={v.kicker} maxLength={120} placeholder="e.g. Studio notes" onChange={(e) => set('kicker', e.target.value)} />
          </label>
          <label className="mr-admin-field">
            <span>Short summary for the Journal page</span>
            <textarea style={{ minHeight: 90 }} value={v.excerpt} maxLength={600} onChange={(e) => set('excerpt', e.target.value)} />
          </label>
          <label className="mr-admin-field">
            <span>Date</span>
            <input type="date" value={v.date} onChange={(e) => set('date', e.target.value)} />
          </label>
          <label className="mr-admin-switch">
            <input type="checkbox" checked={v.featured} onChange={(e) => set('featured', e.target.checked)} /> Featured on the Journal page
          </label>
        </div>
      </section>

      <h2 style={{ margin: '36px 0 4px' }}>The post</h2>
      {errors.paragraphs && <p className="mr-admin-error">{errors.paragraphs}</p>}
      <div className="mr-admin-add-para">
        <button type="button" className="mr-admin-btn" onClick={() => insertAt(0)}>+ Add a paragraph here</button>
      </div>
      {paras.map((p, i) => (
        <div key={p.key}>
          <ParagraphCard
            n={i + 1}
            total={paras.length}
            value={p}
            onChange={(patch) => patchPara(p.key, patch)}
            setPhotos={photosSetter(p.key)}
            onMove={(dir) => move(i, dir)}
            onRemove={() => {
              setParas((ps) => ps.filter((x) => x.key !== p.key))
              setDirty(true)
            }}
          />
          <div className="mr-admin-add-para">
            <button type="button" className="mr-admin-btn" onClick={() => insertAt(i + 1)}>+ Add a paragraph</button>
          </div>
        </div>
      ))}

      <div className="mr-admin-print__foot" style={{ position: 'sticky', bottom: 0, background: 'var(--a-bg)', padding: '16px 0' }}>
        <span className="mr-admin-muted">{dirty ? 'You have changes that aren’t saved yet.' : ''}</span>
        <button type="button" className="mr-admin-btn mr-admin-btn--primary" disabled={pending || uploading} onClick={save}>
          {uploading ? 'Waiting for photos…' : pending ? 'Saving…' : id ? 'Save changes' : 'Publish'}
        </button>
      </div>

      {id && (
        <div style={{ marginTop: 48, maxWidth: 520 }}>
          <ConfirmButton
            label="Delete this post"
            question={`Delete “${v.title || 'this post'}” from the website? This can't be undone.`}
            confirmLabel="Yes, delete it"
            keepLabel="Keep it"
            onConfirm={async () => {
              const r = await deletePost(id)
              if (!r.ok) return r.error
              setDirty(false)
              router.replace('/admin/journal')
            }}
          />
        </div>
      )}
    </>
  )
}
