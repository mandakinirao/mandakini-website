import type { Metadata } from 'next'
import LoginForm from './LoginForm'
import '../../admin.css'

export const metadata: Metadata = {
  title: 'Sign in | Mandakini Rao',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="mr-admin mr-admin-login">
      <div className="mr-admin-login__card">
        <p className="mr-admin-login__name">Mandakini Rao</p>
        <h1>Sign in to your website</h1>
        <LoginForm />
      </div>
    </div>
  )
}
