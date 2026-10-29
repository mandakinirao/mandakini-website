'use client'

import { useState, useTransition } from 'react'

interface Props {
  label: string
  question: string
  confirmLabel: string
  keepLabel: string
  /** Returns an error message to show, or nothing on success. */
  onConfirm: () => Promise<string | undefined>
}

/** Two-step destructive action, inline — never a browser confirm() dialog. */
export default function ConfirmButton({ label, question, confirmLabel, keepLabel, onConfirm }: Props) {
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  if (!asking) {
    return (
      <button type="button" className="mr-admin-btn mr-admin-btn--danger" onClick={() => setAsking(true)}>
        {label}
      </button>
    )
  }

  return (
    <div className="mr-admin-confirm" role="alertdialog" aria-label={question}>
      <p style={{ margin: 0 }}>{question}</p>
      {error && <p className="mr-admin-error">{error}</p>}
      <button
        type="button"
        className="mr-admin-btn mr-admin-btn--primary"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const err = await onConfirm()
            if (err) setError(err)
          })
        }
      >
        {pending ? 'Working…' : confirmLabel}
      </button>
      <button type="button" className="mr-admin-btn" disabled={pending} onClick={() => { setAsking(false); setError('') }}>
        {keepLabel}
      </button>
    </div>
  )
}
