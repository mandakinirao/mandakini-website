'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { createPrint, updatePrint, type SaveResult } from '@/app/admin/(panel)/shop/actions'
import PhotoDropzone, { type Photo } from '@/components/admin/PhotoDropzone'
import type { PrintErrors } from '@/lib/admin/shop'

export interface PrintFormValues {
  title: string
  price: string
  editionSize: string
  howManyLeft: string
  description: string
  height: string
  width: string
  sizeUnit: 'cm' | 'in'
  purchaseType: 'buy' | 'privateCollection'
  showInShop: boolean
  showOnHomepage: boolean
  photos: Photo[]
}

export const EMPTY_PRINT: PrintFormValues = {
  title: '',
  price: '',
  editionSize: '',
  howManyLeft: '',
  description: '',
  height: '',
  width: '',
  sizeUnit: 'cm',
  purchaseType: 'buy',
  showInShop: true,
  showOnHomepage: false,
  photos: [],
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className={`mr-admin-field${error ? ' mr-admin-field--invalid' : ''}`}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
      {error && <p className="mr-admin-error">{error}</p>}
    </label>
  )
}

export default function PrintForm({ id, initial }: { id?: string; initial: PrintFormValues }) {
  const router = useRouter()
  const [v, setV] = useState(initial)
  const [photos, setPhotos] = useState<Photo[]>(initial.photos)
  const [errors, setErrors] = useState<PrintErrors>({})
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string; href?: string } | null>(null)
  const [dirty, setDirty] = useState(false)
  const [pending, start] = useTransition()

  const uploading = photos.some((p) => p.status === 'uploading')
  const set = <K extends keyof PrintFormValues>(k: K, value: PrintFormValues[K]) => {
    setV((old) => ({ ...old, [k]: value }))
    setDirty(true)
  }

  useEffect(() => {
    if (photos !== initial.photos) setDirty(true)
  }, [photos, initial.photos])

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
    setMessage(null)
    const raw = {
      ...v,
      images: photos
        .filter((p) => p.status === 'done' && p.assetId)
        .map((p) => ({ assetId: p.assetId, alt: p.alt, key: p.key })),
    }
    start(async () => {
      const r: SaveResult = id ? await updatePrint(id, raw) : await createPrint(raw)
      if (!r.ok) {
        setErrors(r.errors)
        setMessage({ kind: 'error', text: r.message ?? 'Some details need fixing. They’re marked below.' })
        return
      }
      setErrors({})
      setDirty(false)
      const live = v.showInShop
      const text = live ? `${v.title} is live.` : `Saved. ${v.title} is hidden from the shop.`
      setMessage({ kind: 'ok', text, href: live && r.slug ? `/shop/${r.slug}` : undefined })
      if (!id) router.replace(`/admin/shop/${encodeURIComponent(r.id)}?saved=1`)
      else router.replace(`/admin/shop/${encodeURIComponent(id)}`)
    })
  }

  return (
    <form
      className="mr-admin-print"
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      {message && (
        <p className={`mr-admin-notice${message.kind === 'error' ? ' mr-admin-notice--error' : ''}`} role="status" style={{ gridColumn: '1 / -1' }}>
          {message.text}{' '}
          {message.href && (
            <a href={message.href} target="_blank" rel="noreferrer">
              View it on the site →
            </a>
          )}
        </p>
      )}

      <PhotoDropzone photos={photos} setPhotos={setPhotos} error={errors.images} />

      <div className="mr-admin-form">
        <Field label="Title" error={errors.title}>
          <input value={v.title} maxLength={120} onChange={(e) => set('title', e.target.value)} />
        </Field>
        <div className="mr-admin-field">
          <span>How can people get it?</span>
          <div className="mr-admin-choice">
            <label>
              <input type="radio" checked={v.purchaseType === 'buy'} onChange={() => set('purchaseType', 'buy')} /> Buy online
            </label>
            <label>
              <input type="radio" checked={v.purchaseType === 'privateCollection'} onChange={() => set('purchaseType', 'privateCollection')} /> Enquiry only
            </label>
          </div>
        </div>
        <Field label="Price (₹)" error={errors.price} hint={v.purchaseType === 'privateCollection' ? 'Optional for enquiry-only pieces.' : undefined}>
          <input inputMode="numeric" value={v.price} onChange={(e) => set('price', e.target.value)} />
        </Field>
        <Field label="Edition size" hint="How many prints are in the edition, e.g. 50." error={errors.editionSize}>
          <input inputMode="numeric" value={v.editionSize} onChange={(e) => set('editionSize', e.target.value)} />
        </Field>
        <Field
          label="How many left"
          hint={id ? "Leave blank if you don't keep count." : 'Leave blank and it starts at the edition size.'}
          error={errors.howManyLeft}
        >
          <input inputMode="numeric" value={v.howManyLeft} onChange={(e) => set('howManyLeft', e.target.value)} />
        </Field>
        <div className="mr-admin-field">
          <span>Print size (optional)</span>
          <div className="mr-admin-size">
            <label className={`mr-admin-field${errors.height ? ' mr-admin-field--invalid' : ''}`}>
              <small>Height</small>
              <input inputMode="decimal" value={v.height} placeholder="e.g. 40" onChange={(e) => set('height', e.target.value)} />
            </label>
            <span className="mr-admin-size__x" aria-hidden="true">×</span>
            <label className={`mr-admin-field${errors.width ? ' mr-admin-field--invalid' : ''}`}>
              <small>Width</small>
              <input inputMode="decimal" value={v.width} placeholder="e.g. 30" onChange={(e) => set('width', e.target.value)} />
            </label>
            <div className="mr-admin-choice mr-admin-size__unit">
              <label><input type="radio" checked={v.sizeUnit === 'cm'} onChange={() => set('sizeUnit', 'cm')} /> cm</label>
              <label><input type="radio" checked={v.sizeUnit === 'in'} onChange={() => set('sizeUnit', 'in')} /> inches</label>
            </div>
          </div>
          <small>Leave both empty to hide the size on the website.</small>
          {(errors.height || errors.width) && <p className="mr-admin-error">{errors.height || errors.width}</p>}
        </div>
        <Field label="Description" error={errors.description}>
          <textarea value={v.description} maxLength={2000} onChange={(e) => set('description', e.target.value)} />
        </Field>
      </div>

      <div className="mr-admin-print__foot">
        <div className="mr-admin-print__switches">
          <label className="mr-admin-switch">
            <input type="checkbox" checked={v.showInShop} onChange={(e) => set('showInShop', e.target.checked)} /> Show in shop
          </label>
          <label className="mr-admin-switch">
            <input type="checkbox" checked={v.showOnHomepage} onChange={(e) => set('showOnHomepage', e.target.checked)} /> Show on homepage
          </label>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/admin/shop" className="mr-admin-btn mr-admin-btn--quiet">
            Back to shop
          </Link>
          <button type="submit" className="mr-admin-btn mr-admin-btn--primary" disabled={pending || uploading}>
            {uploading ? 'Waiting for photos…' : pending ? 'Saving…' : id ? 'Save changes' : 'Save and put live'}
          </button>
        </div>
      </div>
    </form>
  )
}
