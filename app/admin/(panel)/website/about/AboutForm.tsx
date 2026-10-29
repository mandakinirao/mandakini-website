'use client'

import { useState, useTransition } from 'react'
import type { Photo } from '@/components/admin/PhotoDropzone'
import SinglePhoto from '@/components/admin/SinglePhoto'
import { toPrintImage } from '@/lib/admin/photos'
import { saveAboutAction } from './actions'

interface Values {
  portrait: Photo | null
  bio: string
  homeSnippet: string
  teaserLine: string
}

export default function AboutForm({ initial }: { initial: Values }) {
  const [v, setV] = useState(initial)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()
  const set = <K extends keyof Values>(k: K, value: Values[K]) => setV((o) => ({ ...o, [k]: value }))
  const uploading = v.portrait?.status === 'uploading'

  return (
    <form
      className="mr-admin-print"
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => {
          const r = await saveAboutAction({ ...v, portrait: toPrintImage(v.portrait) })
          setNotice(r.ok ? { ok: true, text: 'Saved. The About page and homepage show this now.' } : { ok: false, text: r.error ?? "Couldn't save." })
        })
      }}
    >
      {notice && (
        <p className={`mr-admin-notice${notice.ok ? '' : ' mr-admin-notice--error'}`} role="status" style={{ gridColumn: '1 / -1' }}>
          {notice.text}
        </p>
      )}
      <SinglePhoto label="Your portrait" value={v.portrait} onChange={(p) => set('portrait', p)} hint="Shown on the About page." />
      <div className="mr-admin-form">
        <label className="mr-admin-field">
          <span>About text</span>
          <textarea style={{ minHeight: 260 }} value={v.bio} onChange={(e) => set('bio', e.target.value)} />
          <small>Shown on the About page as one paragraph. Leave empty to keep the current text.</small>
        </label>
        <label className="mr-admin-field">
          <span>Short introduction on the homepage</span>
          <textarea value={v.homeSnippet} onChange={(e) => set('homeSnippet', e.target.value)} />
          <small>A few sentences in the About section of the homepage.</small>
        </label>
        <label className="mr-admin-field">
          <span>One-line teaser</span>
          <input value={v.teaserLine} maxLength={300} onChange={(e) => set('teaserLine', e.target.value)} />
          <small>A single line that leads into your story.</small>
        </label>
      </div>
      <div className="mr-admin-print__foot">
        <span />
        <button type="submit" className="mr-admin-btn mr-admin-btn--primary" disabled={pending || uploading}>
          {uploading ? 'Waiting for photo…' : pending ? 'Saving…' : 'Save and put live'}
        </button>
      </div>
    </form>
  )
}
