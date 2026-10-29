'use client'

import { useState, useTransition } from 'react'
import type { WordField } from '@/lib/admin/singletons'
import { saveWordsAction } from './actions'

export default function WordsForm({
  fields,
  values,
  defaults,
}: {
  fields: WordField[]
  values: Record<string, string>
  defaults: Record<string, string>
}) {
  const [v, setV] = useState(values)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()
  const groups = Array.from(new Set(fields.map((f) => f.group)))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => {
          const r = await saveWordsAction(v)
          setNotice(r.ok ? { ok: true, text: 'Saved. The website shows the new wording now.' } : { ok: false, text: r.error ?? "Couldn't save." })
        })
      }}
    >
      {notice && <p className={`mr-admin-notice${notice.ok ? '' : ' mr-admin-notice--error'}`} role="status">{notice.text}</p>}
      {groups.map((g) => (
        <section key={g} className="mr-admin-panel">
          <h2>{g}</h2>
          <div className="mr-admin-form">
            {fields
              .filter((f) => f.group === g)
              .map((f) => (
                <label key={f.key} className="mr-admin-field">
                  <span>{f.label}</span>
                  {f.long ? (
                    <textarea
                      style={{ minHeight: 90 }}
                      value={v[f.key]}
                      placeholder={defaults[f.key]}
                      onChange={(e) => setV((o) => ({ ...o, [f.key]: e.target.value }))}
                    />
                  ) : (
                    <input
                      value={v[f.key]}
                      placeholder={defaults[f.key]}
                      onChange={(e) => setV((o) => ({ ...o, [f.key]: e.target.value }))}
                    />
                  )}
                  <small>{f.hint}</small>
                </label>
              ))}
          </div>
        </section>
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <button type="submit" className="mr-admin-btn mr-admin-btn--primary" disabled={pending}>
          {pending ? 'Saving…' : 'Save and put live'}
        </button>
      </div>
    </form>
  )
}
