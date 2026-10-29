'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import ConfirmButton from '@/components/admin/ConfirmButton'
import type { Photo } from '@/components/admin/PhotoDropzone'
import SinglePhoto from '@/components/admin/SinglePhoto'
import { toPrintImage } from '@/lib/admin/photos'
import { deleteTestimonial, saveTestimonial } from './actions'

interface Values {
  quote: string
  personName: string
  photo: Photo | null
}

export default function TestimonialForm({ id, initial }: { id?: string; initial: Values }) {
  const router = useRouter()
  const [v, setV] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()
  const uploading = v.photo?.status === 'uploading'

  return (
    <>
      <form
        className="mr-admin-print"
        onSubmit={(e) => {
          e.preventDefault()
          start(async () => {
            const r = await saveTestimonial(id ?? null, { ...v, photo: toPrintImage(v.photo) })
            if (!r.ok) {
              setErrors(r.errors)
              setNotice({ ok: false, text: r.message ?? 'Some details need fixing. They’re marked below.' })
              return
            }
            setErrors({})
            setNotice({ ok: true, text: 'Saved. It’s on the website now.' })
            if (!id) router.replace(`/admin/website/testimonials/${encodeURIComponent(r.id)}`)
          })
        }}
      >
        {notice && (
          <p className={`mr-admin-notice${notice.ok ? '' : ' mr-admin-notice--error'}`} role="status" style={{ gridColumn: '1 / -1' }}>
            {notice.text}
          </p>
        )}
        <SinglePhoto label="Photo (optional)" value={v.photo} onChange={(p) => setV((o) => ({ ...o, photo: p }))} hint="A small round photo of the person." />
        <div className="mr-admin-form">
          <label className={`mr-admin-field${errors.quote ? ' mr-admin-field--invalid' : ''}`}>
            <span>What they said</span>
            <textarea value={v.quote} maxLength={1500} onChange={(e) => setV((o) => ({ ...o, quote: e.target.value }))} />
            {errors.quote && <p className="mr-admin-error">{errors.quote}</p>}
          </label>
          <label className={`mr-admin-field${errors.personName ? ' mr-admin-field--invalid' : ''}`}>
            <span>Who said it</span>
            <input value={v.personName} maxLength={120} onChange={(e) => setV((o) => ({ ...o, personName: e.target.value }))} />
            <small>e.g. “Priya N., collector, Hyderabad”</small>
            {errors.personName && <p className="mr-admin-error">{errors.personName}</p>}
          </label>
        </div>
        <div className="mr-admin-print__foot">
          <span />
          <button type="submit" className="mr-admin-btn mr-admin-btn--primary" disabled={pending || uploading}>
            {uploading ? 'Waiting for photo…' : pending ? 'Saving…' : id ? 'Save changes' : 'Save and put live'}
          </button>
        </div>
      </form>
      {id && (
        <div style={{ marginTop: 48, maxWidth: 520 }}>
          <ConfirmButton
            label="Delete this testimonial"
            question="Delete this testimonial from the website? This can't be undone."
            confirmLabel="Yes, delete it"
            keepLabel="Keep it"
            onConfirm={async () => {
              const r = await deleteTestimonial(id)
              if (!r.ok) return r.error
              router.replace('/admin/website/testimonials')
            }}
          />
        </div>
      )}
    </>
  )
}
