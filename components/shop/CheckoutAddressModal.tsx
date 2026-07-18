'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import PillCta from '@/components/ui/PillCta'
import { openRazorpayCheckout } from '@/lib/razorpay-checkout'
import {
  EASE,
  lockScroll,
  mandaGsap,
  prefersReducedMotion,
  unlockScroll,
} from '@/lib/motion'

interface CheckoutAddressModalProps {
  open: boolean
  items: { slug: string; qty: number }[]
  label: string
  onClose: () => void
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Address-collection step between "Buy Now"/"Checkout" and the Razorpay
 * modal. Shared by BuyControls and CartDrawer so both entry points pass
 * through the same validation and the same customer/address fields land
 * in the Razorpay order notes.
 */
export default function CheckoutAddressModal({
  open,
  items,
  label,
  onClose,
}: CheckoutAddressModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    document.body.classList.add('mr-modal-open')
    lockScroll()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    if (!prefersReducedMotion()) {
      mandaGsap.fromTo(
        '.mr-addr__panel',
        { xPercent: 104 },
        { xPercent: 0, duration: 0.8, ease: EASE }
      )
      mandaGsap.fromTo(
        '.mr-addr__veil',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5, ease: EASE }
      )
    }
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('mr-modal-open')
      unlockScroll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const validate = () => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Please share your name.'
    if (!EMAIL_RE.test(email)) next.email = "That email doesn't look quite right."
    if (!phone.trim()) next.phone = 'Please share a phone number.'
    if (!address.trim()) next.address = 'Please share a shipping address.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer: { name, email, phone, address },
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.orderId) {
        setError(data.error ?? 'Checkout is unavailable right now.')
        setBusy(false)
        return
      }
      onClose()
      openRazorpayCheckout({
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        keyId: data.keyId,
        name: label,
        onDismiss: () => setBusy(false),
        onError: (msg) => {
          setError(msg)
          setBusy(false)
        },
      })
    } catch {
      setError('Checkout is unavailable right now.')
      setBusy(false)
    }
  }

  return createPortal(
    <div
      className="mr-addr__overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Shipping details"
    >
      <button
        type="button"
        className="mr-addr__veil"
        aria-label="Close"
        onClick={() => !busy && onClose()}
      />
      <div className="mr-addr__panel" ref={panelRef}>
        <div className="mr-addr__head">
          <p>Shipping details</p>
          <button
            type="button"
            className="mr-addr__close"
            onClick={onClose}
            disabled={busy}
          >
            Close
          </button>
        </div>

        <form className="mr-addr__form" onSubmit={submit} noValidate>
          <label className="mr-addr__field">
            <span>Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <em role="alert">{errors.name}</em>}
          </label>

          <label className="mr-addr__field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={120}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <em role="alert">{errors.email}</em>}
          </label>

          <label className="mr-addr__field">
            <span>Phone</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={40}
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone && <em role="alert">{errors.phone}</em>}
          </label>

          <label className="mr-addr__field">
            <span>Shipping address</span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={4}
              maxLength={240}
              aria-invalid={Boolean(errors.address)}
            />
            {errors.address && <em role="alert">{errors.address}</em>}
          </label>

          {error && (
            <p className="mr-addr__error" role="alert">
              {error}
            </p>
          )}

          <PillCta type="submit" className="mr-addr__submit" disabled={busy}>
            {busy ? 'One moment…' : 'Continue to payment'}
          </PillCta>
        </form>
      </div>
    </div>,
    document.body
  )
}
