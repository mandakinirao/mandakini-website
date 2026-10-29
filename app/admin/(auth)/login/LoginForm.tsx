'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { login, type LoginState } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="mr-admin-btn mr-admin-btn--primary" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  )
}

export default function LoginForm() {
  const [state, action] = useFormState<LoginState, FormData>(login, {})
  return (
    <form action={action} className="mr-admin-form">
      <label className="mr-admin-field">
        <span>Password</span>
        <input type="password" name="password" autoComplete="current-password" autoFocus required />
      </label>
      {state.error && <p className="mr-admin-error" role="alert">{state.error}</p>}
      <SubmitButton />
    </form>
  )
}
