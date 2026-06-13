'use client'

import { useRef, useState } from 'react'

// Placeholder tiers — Mandakini can rename these in Sanity later.
const BUDGETS = ['Prefer not to say', 'Modest range', 'Mid range', 'Premium range']

type Status = 'idle' | 'submitting' | 'success'

/**
 * The Private Collection enquiry form. Honeypot ("website") + a
 * startedAt timestamp feed the server's spam checks. Gentle inline
 * validation in rosehip; success replaces the form entirely.
 */
export default function EnquiryForm() {
  const startedAtRef = useRef(Date.now())
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<{ name?: string; email?: string; server?: string }>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())

    const next: typeof errors = {}
    if (!String(data.name ?? '').trim()) next.name = 'Your name, so she knows who is writing.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email ?? '')))
      next.email = 'That email doesn’t look quite right.'
    setErrors(next)
    if (Object.keys(next).length) return

    setStatus('submitting')
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, startedAt: startedAtRef.current }),
      })
      const json = await res.json()
      if (json.ok) {
        setStatus('success')
      } else {
        setStatus('idle')
        setErrors({ server: json.error ?? 'Something went wrong — please try again.' })
      }
    } catch {
      setStatus('idle')
      setErrors({ server: 'Something went wrong — please try again.' })
    }
  }

  if (status === 'success') {
    return (
      <div className="mr-pc__success" role="status">
        {/* PLACEHOLDER COPY — pending client approval */}
        <p>Thank you. Mandakini will share the collection with you personally.</p>
      </div>
    )
  }

  return (
    <form className="mr-pc__form" onSubmit={handleSubmit} noValidate>
      {/* honeypot — humans never see or fill this */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="mr-pc__hp"
        aria-hidden="true"
      />

      <label className="mr-pc__field">
        <span>Name</span>
        <input type="text" name="name" required aria-invalid={Boolean(errors.name)} />
        {errors.name && <em role="alert">{errors.name}</em>}
      </label>

      <label className="mr-pc__field">
        <span>Email</span>
        <input type="email" name="email" required aria-invalid={Boolean(errors.email)} />
        {errors.email && <em role="alert">{errors.email}</em>}
      </label>

      <label className="mr-pc__field">
        <span>Phone (optional)</span>
        <input type="tel" name="phone" />
      </label>

      <label className="mr-pc__field">
        <span>What draws you to the collection? (optional)</span>
        <textarea name="message" rows={4} />
      </label>

      <label className="mr-pc__field">
        <span>Budget range (optional)</span>
        <select name="budgetRange" defaultValue="">
          <option value="" disabled>
            Choose…
          </option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>

      {errors.server && (
        <p className="mr-pc__error" role="alert">
          {errors.server}
        </p>
      )}

      <button
        type="submit"
        className="mr-pc__submit"
        disabled={status === 'submitting'}
        data-cursor="enter"
      >
        {status === 'submitting' ? 'Sending…' : 'Request the Collection'}
      </button>
    </form>
  )
}
