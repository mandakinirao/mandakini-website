'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { deletePress, lookUpAction, savePress } from '@/app/admin/(panel)/press/actions'
import ConfirmButton from '@/components/admin/ConfirmButton'
import type { Photo } from '@/components/admin/PhotoDropzone'
import SinglePhoto from '@/components/admin/SinglePhoto'
import { toPrintImage } from '@/lib/admin/photos'

export interface PressValues {
  link: string
  type: 'article' | 'video' | 'podcast'
  headline: string
  source: string
  thumbnail: Photo | null
  logoCard: boolean
  showOnHomepage: boolean
}

export default function PressForm({ id, initial }: { id?: string; initial: PressValues }) {
  const router = useRouter()
  const [v, setV] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)
  const [lookup, setLookup] = useState<{ text: string; image?: string } | null>(null)
  const [pending, start] = useTransition()
  const [looking, startLook] = useTransition()
  const set = <K extends keyof PressValues>(k: K, value: PressValues[K]) => setV((o) => ({ ...o, [k]: value }))
  const uploading = v.thumbnail?.status === 'uploading'

  return (
    <>
      <form
        className="mr-admin-print"
        onSubmit={(e) => {
          e.preventDefault()
          start(async () => {
            const r = await savePress(id ?? null, { ...v, thumbnail: toPrintImage(v.thumbnail) })
            if (!r.ok) {
              setErrors(r.errors)
              setNotice({ ok: false, text: r.message ?? 'Some details need fixing. They’re marked below.' })
              return
            }
            setErrors({})
            setNotice({ ok: true, text: 'Saved. It’s on the Press page now.' })
            if (!id) router.replace(`/admin/press/${encodeURIComponent(r.id)}`)
          })
        }}
      >
        {notice && (
          <p className={`mr-admin-notice${notice.ok ? '' : ' mr-admin-notice--error'}`} role="status" style={{ gridColumn: '1 / -1' }}>
            {notice.text}
          </p>
        )}
        <div className="mr-admin-form">
          <label className={`mr-admin-field${errors.link ? ' mr-admin-field--invalid' : ''}`}>
            <span>Link</span>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={v.link} placeholder="https://…" onChange={(e) => set('link', e.target.value)} />
              <button
                type="button"
                className="mr-admin-btn"
                disabled={looking || !v.link.trim()}
                onClick={() =>
                  startLook(async () => {
                    const found = await lookUpAction(v.link)
                    if (!found.headline && !found.source && !found.image) {
                      setLookup({ text: "Couldn't read that page. Fill these in yourself." })
                      return
                    }
                    setV((o) => ({ ...o, headline: o.headline || found.headline || '', source: o.source || found.source || '' }))
                    setLookup({ text: 'Filled in what the page says. Change anything you like.', image: found.image })
                  })
                }
              >
                {looking ? 'Looking…' : 'Look it up'}
              </button>
            </div>
            <small>Leave empty for a newspaper clipping that isn’t online.</small>
            {errors.link && <p className="mr-admin-error">{errors.link}</p>}
            {lookup && <small>{lookup.text}</small>}
          </label>
          <div className="mr-admin-field">
            <span>What is it?</span>
            <div className="mr-admin-choice">
              {(['article', 'video', 'podcast'] as const).map((t) => (
                <label key={t}>
                  <input type="radio" checked={v.type === t} onChange={() => set('type', t)} /> {t[0].toUpperCase() + t.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <label className="mr-admin-field">
            <span>Headline</span>
            <input value={v.headline} maxLength={200} onChange={(e) => set('headline', e.target.value)} />
          </label>
          <label className="mr-admin-field">
            <span>Publication</span>
            <input value={v.source} maxLength={120} placeholder="e.g. The Hindu" onChange={(e) => set('source', e.target.value)} />
          </label>
        </div>
        <div>
          <SinglePhoto
            label="Picture"
            value={v.thumbnail}
            onChange={(p) => set('thumbnail', p)}
            hint="Optional for links. For a newspaper clipping, add a photo of it here."
          />
          {lookup?.image && !v.thumbnail && (
            <p className="mr-admin-muted" style={{ fontSize: '0.9rem' }}>
              The site will use the page’s own picture unless you add one.
            </p>
          )}
        </div>
        <div className="mr-admin-print__foot">
          <div className="mr-admin-print__switches">
            <label className="mr-admin-switch">
              <input type="checkbox" checked={v.logoCard} onChange={(e) => set('logoCard', e.target.checked)} /> Show publication logo instead of a photo
            </label>
            <label className="mr-admin-switch">
              <input type="checkbox" checked={v.showOnHomepage} onChange={(e) => set('showOnHomepage', e.target.checked)} /> Show on homepage
            </label>
          </div>
          <button type="submit" className="mr-admin-btn mr-admin-btn--primary" disabled={pending || uploading}>
            {uploading ? 'Waiting for photo…' : pending ? 'Saving…' : id ? 'Save changes' : 'Save and put live'}
          </button>
        </div>
      </form>
      {id && (
        <div style={{ marginTop: 48, maxWidth: 520 }}>
          <ConfirmButton
            label="Delete this press item"
            question="Delete this from the Press page? This can't be undone."
            confirmLabel="Yes, delete it"
            keepLabel="Keep it"
            onConfirm={async () => {
              const r = await deletePress(id)
              if (!r.ok) return r.error
              router.replace('/admin/press')
            }}
          />
        </div>
      )}
    </>
  )
}
