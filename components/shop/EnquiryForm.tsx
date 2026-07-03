'use client'

import { useState } from 'react'

const BUDGETS = ['Prefer not to say', 'Modest range', 'Mid range', 'Premium range']

type Status = 'idle' | 'sent'

interface EnquiryFormProps {
  contactEmail?: string
}

export default function EnquiryForm({ contactEmail = 'mandakinirao@gmail.com' }: EnquiryFormProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())

    const next: typeof errors = {}
    if (!String(data.name ?? '').trim()) next.name = 'Your name, so she knows who is writing.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email ?? '')))
      next.email = "That email doesn't look quite right."
    setErrors(next)
    if (Object.keys(next).length) return

    const name = String(data.name ?? '').trim()
    const email = String(data.email ?? '').trim()
    const phone = String(data.phone ?? '').trim()
    const message = String(data.message ?? '').trim()
    const budget = String(data.budgetRange ?? '').trim()

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      message ? `\nMessage:\n${message}` : null,
      budget ? `\nBudget: ${budget}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    const mailto =
      `mailto:${contactEmail}` +
      `?subject=${encodeURIComponent(`Private Collection Enquiry — ${name}`)}` +
      `&body=${encodeURIComponent(body)}`

    window.location.href = mailto
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="mr-pc__success" role="status">
        <p>Thank you. Mandakini will be in touch personally.</p>
      </div>
    )
  }

  return (
    <form className="mr-pc__form" onSubmit={handleSubmit} noValidate>
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
          <option value="" disabled>Choose...</option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </label>

      <button type="submit" className="mr-pc__submit">
        Request the Collection
      </button>
    </form>
  )
}
