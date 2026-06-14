'use client'

import { useRef, useState } from 'react'

type Status = 'idle' | 'submitting' | 'success'

export default function ContactForm() {
  const startedAtRef = useRef(Date.now())
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<{ name?: string; email?: string; server?: string }>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget).entries())

    const next: typeof errors = {}
    if (!String(data.name ?? '').trim()) next.name = 'Please share your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email ?? '')))
      next.email = "That email doesn't look quite right."
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
      <div className="mr2-contact__success" role="status">
        <p>Thank you — Mandakini will be in touch soon.</p>
      </div>
    )
  }

  return (
    <form className="mr2-contact__form" onSubmit={handleSubmit} noValidate>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="mr-pc__hp" aria-hidden="true" />

      <label className="mr2-contact__field">
        <span>Name</span>
        <input type="text" name="name" required aria-invalid={Boolean(errors.name)} />
        {errors.name && <em role="alert">{errors.name}</em>}
      </label>

      <label className="mr2-contact__field">
        <span>Email</span>
        <input type="email" name="email" required aria-invalid={Boolean(errors.email)} />
        {errors.email && <em role="alert">{errors.email}</em>}
      </label>

      <label className="mr2-contact__field">
        <span>Message</span>
        <textarea name="message" rows={5} />
      </label>

      {errors.server && <p className="mr-pc__error" role="alert">{errors.server}</p>}

      <button type="submit" className="mr-pill" disabled={status === 'submitting'} data-cursor="enter">
        {status === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
