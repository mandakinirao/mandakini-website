'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { checkRateLimit } from '@/lib/rate-limit'
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SEC,
  createSessionToken,
  passwordMatches,
} from '@/lib/admin/session'

export interface LoginState {
  error?: string
}

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const ip = headers().get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (checkRateLimit(`admin-login:${ip}`, 5, 15 * 60_000).limited) {
    return { error: 'Too many tries. Wait 15 minutes and try again.' }
  }

  const expected = process.env.ADMIN_PASSWORD
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!expected || !secret) {
    return { error: 'Sign-in isn’t set up yet.' }
  }

  const password = String(form.get('password') ?? '')
  if (!(await passwordMatches(password, expected))) {
    return { error: 'That password isn’t right.' }
  }

  cookies().set(SESSION_COOKIE, await createSessionToken(secret, Date.now()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SEC,
  })
  redirect('/admin')
}

export async function logout(): Promise<void> {
  cookies().delete(SESSION_COOKIE)
  redirect('/admin/login')
}
