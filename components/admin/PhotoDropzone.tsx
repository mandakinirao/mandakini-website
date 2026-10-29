'use client'

import { useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { compressImage } from '@/lib/admin/compress-image'
import { validateUpload } from '@/lib/admin/upload'

export interface Photo {
  key: string
  name: string
  alt: string
  status: 'uploading' | 'done' | 'error'
  assetId?: string
  url?: string
  preview?: string
  error?: string
}

const PARALLEL = 3
const newKey = () => Math.random().toString(36).slice(2, 12)

async function uploadOne(file: File): Promise<{ assetId: string; url: string }> {
  const small = await compressImage(file)
  const check = validateUpload({ type: small.type, size: small.size, name: file.name })
  if (!check.ok) throw new Error(check.error)
  const body = new FormData()
  body.append('file', small)
  const res = await fetch('/api/admin/upload', { method: 'POST', body })
  const json = await res.json().catch(() => ({}))
  if (res.status === 401) throw new Error('You were signed out. Sign in again, then add this photo.')
  if (!res.ok) throw new Error(json.error ?? `${file.name} couldn't be uploaded. Try again.`)
  return json
}

export default function PhotoDropzone({
  photos,
  setPhotos,
  error,
}: {
  photos: Photo[]
  setPhotos: Dispatch<SetStateAction<Photo[]>>
  error?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [dragKey, setDragKey] = useState<string | null>(null)

  const update = (key: string, patch: Partial<Photo>) =>
    setPhotos((list) => list.map((p) => (p.key === key ? { ...p, ...patch } : p)))

  async function addFiles(files: File[]) {
    const queued = files.map((file) => ({
      file,
      photo: {
        key: newKey(),
        name: file.name,
        alt: '',
        status: 'uploading' as const,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      },
    }))
    setPhotos((list) => [...list, ...queued.map((q) => q.photo)])

    let next = 0
    const worker = async () => {
      while (next < queued.length) {
        const { file, photo } = queued[next++]
        try {
          const { assetId, url } = await uploadOne(file)
          update(photo.key, { status: 'done', assetId, url })
        } catch (err) {
          update(photo.key, { status: 'error', error: err instanceof Error ? err.message : `${file.name} couldn't be uploaded.` })
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(PARALLEL, queued.length) }, worker))
  }

  function movePhoto(targetKey: string) {
    if (!dragKey || dragKey === targetKey) return
    setPhotos((list) => {
      const next = [...list]
      const from = next.findIndex((p) => p.key === dragKey)
      const to = next.findIndex((p) => p.key === targetKey)
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  const firstGood = photos.find((p) => p.status !== 'error')?.key

  return (
    <div className={`mr-admin-field${error ? ' mr-admin-field--invalid' : ''}`}>
      <span>Photos</span>
      <div
        className={`mr-admin-drop${over ? ' mr-admin-drop--over' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes('Files')) {
            e.preventDefault()
            setOver(true)
          }
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          if (e.dataTransfer.files.length) addFiles(Array.from(e.dataTransfer.files))
        }}
      >
        <strong>Drag your photos here, or click to choose</strong>
        <span className="mr-admin-muted">You can add several at once. The first one is the cover.</span>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) addFiles(Array.from(e.target.files))
            e.target.value = ''
          }}
        />
      </div>
      {error && <p className="mr-admin-error">{error}</p>}

      {photos.length > 0 && (
        <div className="mr-admin-photos">
          {photos.map((p) => (
            <div
              key={p.key}
              className="mr-admin-photo"
              draggable={p.status === 'done'}
              onDragStart={() => setDragKey(p.key)}
              onDragOver={(e) => dragKey && e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                movePhoto(p.key)
              }}
              onDragEnd={() => setDragKey(null)}
            >
              {p.status === 'error' ? (
                <div className="mr-admin-photo__failed" aria-hidden="true">!</div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.url ? `${p.url}?w=400&fit=max&auto=format` : p.preview ?? ''} alt="" draggable={false} />
              )}
              {p.key === firstGood && <span className="mr-admin-photo__cover">Cover</span>}
              <button
                type="button"
                className="mr-admin-photo__remove"
                aria-label={`Remove ${p.name}`}
                onClick={() => setPhotos((list) => list.filter((x) => x.key !== p.key))}
              >
                ×
              </button>
              {p.status === 'uploading' && <span className="mr-admin-photo__status">Uploading…</span>}
              {p.status === 'error' && <span className="mr-admin-photo__status mr-admin-photo__status--error">{p.error}</span>}
              {p.status === 'done' && (
                <input
                  value={p.alt}
                  placeholder="Describe this photo (optional)"
                  maxLength={200}
                  onChange={(e) => update(p.key, { alt: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
