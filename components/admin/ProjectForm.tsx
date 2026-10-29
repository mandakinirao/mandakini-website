'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { deleteProject, saveProject } from '@/app/admin/(panel)/projects/actions'
import ConfirmButton from '@/components/admin/ConfirmButton'
import PhotoDropzone, { type Photo } from '@/components/admin/PhotoDropzone'
import { toPrintImage } from '@/lib/admin/photos'
import { PROJECT_DESCRIPTION_SOFT_MAX } from '@/lib/admin/projects'

export interface ProjectValues {
  name: string
  year: string
  description: string
  showOnHomepage: boolean
  photos: Photo[]
}

export default function ProjectForm({ id, initial }: { id?: string; initial: ProjectValues }) {
  const router = useRouter()
  const [v, setV] = useState(initial)
  const [photos, setPhotos] = useState<Photo[]>(initial.photos)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<{ ok: boolean; text: string; href?: string } | null>(null)
  const [pending, start] = useTransition()
  const uploading = photos.some((p) => p.status === 'uploading')
  const long = v.description.length > PROJECT_DESCRIPTION_SOFT_MAX

  return (
    <>
      <form
        className="mr-admin-print"
        onSubmit={(e) => {
          e.preventDefault()
          start(async () => {
            const r = await saveProject(id ?? null, { ...v, photos: photos.map(toPrintImage).filter(Boolean) })
            if (!r.ok) {
              setErrors(r.errors)
              setNotice({ ok: false, text: r.message ?? 'Some details need fixing. They’re marked below.' })
              return
            }
            setErrors({})
            setNotice({ ok: true, text: `${v.name} is live.`, href: r.slug ? `/works/${r.slug}` : undefined })
            if (!id) router.replace(`/admin/projects/${encodeURIComponent(r.id)}`)
          })
        }}
      >
        {notice && (
          <p className={`mr-admin-notice${notice.ok ? '' : ' mr-admin-notice--error'}`} role="status" style={{ gridColumn: '1 / -1' }}>
            {notice.text}{' '}
            {notice.href && <a href={notice.href} target="_blank" rel="noreferrer">View it on the site →</a>}
          </p>
        )}
        <PhotoDropzone photos={photos} setPhotos={setPhotos} error={errors.photos} />
        <div className="mr-admin-form">
          <label className={`mr-admin-field${errors.name ? ' mr-admin-field--invalid' : ''}`}>
            <span>Name of the series</span>
            <input value={v.name} maxLength={120} onChange={(e) => setV((o) => ({ ...o, name: e.target.value }))} />
            {errors.name && <p className="mr-admin-error">{errors.name}</p>}
          </label>
          <label className="mr-admin-field">
            <span>Year</span>
            <input value={v.year} maxLength={40} placeholder="e.g. 2024" onChange={(e) => setV((o) => ({ ...o, year: e.target.value }))} />
          </label>
          <label className="mr-admin-field">
            <span>Short description</span>
            <textarea value={v.description} maxLength={2000} onChange={(e) => setV((o) => ({ ...o, description: e.target.value }))} />
            <small style={long ? { color: 'var(--a-warn)' } : undefined}>
              {v.description.length} / {PROJECT_DESCRIPTION_SOFT_MAX}
              {long ? ' · Long descriptions get cut off on the Projects page.' : ' · One or two sentences read best.'}
            </small>
          </label>
        </div>
        <div className="mr-admin-print__foot">
          <label className="mr-admin-switch">
            <input type="checkbox" checked={v.showOnHomepage} onChange={(e) => setV((o) => ({ ...o, showOnHomepage: e.target.checked }))} /> Show on homepage
          </label>
          <button type="submit" className="mr-admin-btn mr-admin-btn--primary" disabled={pending || uploading}>
            {uploading ? 'Waiting for photos…' : pending ? 'Saving…' : id ? 'Save changes' : 'Save and put live'}
          </button>
        </div>
      </form>
      {id && (
        <div style={{ marginTop: 48, maxWidth: 520 }}>
          <ConfirmButton
            label="Delete this project"
            question={`Delete ${v.name || 'this project'} from the website? This can't be undone.`}
            confirmLabel="Yes, delete it"
            keepLabel="Keep it"
            onConfirm={async () => {
              const r = await deleteProject(id)
              if (!r.ok) return r.error
              router.replace('/admin/projects')
            }}
          />
        </div>
      )}
    </>
  )
}
