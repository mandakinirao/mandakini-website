'use client'

import { useState, type Dispatch, type SetStateAction } from 'react'
import PhotoDropzone, { type Photo } from '@/components/admin/PhotoDropzone'
import RichText from '@/components/admin/journal/RichText'
import type { PhotoDisplay, PhotoPosition } from '@/lib/admin/journal'
import type { PTBlock } from '@/lib/admin/richtext'

export interface ParagraphState {
  key: string
  text: PTBlock[]
  photos: Photo[]
  position: PhotoPosition
  displayMode: PhotoDisplay
  pullQuote: boolean
}

const POSITIONS: { value: PhotoPosition; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'top', label: 'Above' },
  { value: 'bottom', label: 'Below' },
]

export default function ParagraphCard({
  n,
  total,
  value,
  onChange,
  setPhotos,
  onMove,
  onRemove,
}: {
  n: number
  total: number
  value: ParagraphState
  onChange: (patch: Partial<ParagraphState>) => void
  setPhotos: Dispatch<SetStateAction<Photo[]>>
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const hasPhotos = value.photos.some((p) => p.status !== 'error')
  const many = value.photos.filter((p) => p.status !== 'error').length >= 2

  return (
    <section className="mr-admin-panel mr-admin-para">
      <div className="mr-admin-para__head">
        <h2>Paragraph {n}</h2>
        <div className="mr-admin-para__tools">
          <button type="button" className="mr-admin-btn mr-admin-btn--quiet" disabled={n === 1} onClick={() => onMove(-1)}>Move up</button>
          <button type="button" className="mr-admin-btn mr-admin-btn--quiet" disabled={n === total} onClick={() => onMove(1)}>Move down</button>
          {confirming ? (
            <>
              <button type="button" className="mr-admin-btn mr-admin-btn--danger" onClick={onRemove}>Yes, remove it</button>
              <button type="button" className="mr-admin-btn mr-admin-btn--quiet" onClick={() => setConfirming(false)}>Keep it</button>
            </>
          ) : (
            <button type="button" className="mr-admin-btn mr-admin-btn--quiet" onClick={() => setConfirming(true)}>Remove paragraph</button>
          )}
        </div>
      </div>

      <div className="mr-admin-para__body">
        <div className="mr-admin-form">
          <RichText
            value={value.text}
            onChange={(text) => onChange({ text })}
            placeholder="Write here…"
            big={value.pullQuote && !hasPhotos}
          />
          {!hasPhotos && (
            <label className="mr-admin-switch">
              <input type="checkbox" checked={value.pullQuote} onChange={(e) => onChange({ pullQuote: e.target.checked })} />
              Make this a big quote (shown large and centred)
            </label>
          )}
        </div>

        <div className="mr-admin-form">
          <PhotoDropzone
            photos={value.photos}
            setPhotos={setPhotos}
            label="Photos beside this paragraph (optional)"
            hint="Add one or several. You can add captions."
            captions
          />
          {hasPhotos && (
            <div className="mr-admin-field">
              <span>Where do the photos go?</span>
              <div className="mr-admin-choice">
                {POSITIONS.map((p) => (
                  <label key={p.value}>
                    <input type="radio" checked={value.position === p.value} onChange={() => onChange({ position: p.value })} /> {p.label}
                  </label>
                ))}
              </div>
            </div>
          )}
          {many && (
            <div className="mr-admin-field">
              <span>How should several photos show?</span>
              <div className="mr-admin-choice">
                <label>
                  <input type="radio" checked={value.displayMode === 'collage'} onChange={() => onChange({ displayMode: 'collage' })} /> Show together
                </label>
                <label>
                  <input type="radio" checked={value.displayMode === 'carousel'} onChange={() => onChange({ displayMode: 'carousel' })} /> One at a time
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
