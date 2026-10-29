'use client'

import { useState, useTransition } from 'react'
import type { Photo } from '@/components/admin/PhotoDropzone'
import SinglePhoto from '@/components/admin/SinglePhoto'
import { toPrintImage } from '@/lib/admin/photos'
import { saveHomepageAction } from './actions'

export default function HomepageForm({ top: initialTop, bottom: initialBottom }: { top: Photo | null; bottom: Photo | null }) {
  const [top, setTop] = useState(initialTop)
  const [bottom, setBottom] = useState(initialBottom)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()
  const uploading = top?.status === 'uploading' || bottom?.status === 'uploading'

  return (
    <section className="mr-admin-panel">
      <h2>Opening pictures</h2>
      <p className="mr-admin-muted" style={{ marginTop: 0 }}>
        The homepage opens on the first picture; scrolling reveals the second one underneath. Leave them empty to use the built-in pictures.
      </p>
      {notice && <p className={`mr-admin-notice${notice.ok ? '' : ' mr-admin-notice--error'}`} role="status">{notice.text}</p>}
      <div className="mr-admin-print">
        <SinglePhoto label="Opening picture" value={top} onChange={setTop} />
        <SinglePhoto label="Picture revealed underneath" value={bottom} onChange={setBottom} />
        <div className="mr-admin-print__foot">
          <span />
          <button
            type="button"
            className="mr-admin-btn mr-admin-btn--primary"
            disabled={pending || uploading}
            onClick={() =>
              start(async () => {
                const r = await saveHomepageAction({ top: toPrintImage(top), bottom: toPrintImage(bottom) })
                setNotice(r.ok ? { ok: true, text: 'Saved. The homepage shows these pictures now.' } : { ok: false, text: r.error ?? "Couldn't save." })
              })
            }
          >
            {uploading ? 'Waiting for photos…' : pending ? 'Saving…' : 'Save and put live'}
          </button>
        </div>
      </div>
    </section>
  )
}
