/**
 * /admin session tokens — "<expiresAtMs>.<hmacHex>", HMAC-SHA256 over the
 * expiry string. Web Crypto only: middleware runs on the Edge runtime,
 * where node:crypto is unavailable.
 */

export const SESSION_COOKIE = 'mr_admin'
export const SESSION_MAX_AGE_SEC = 30 * 24 * 60 * 60 // 2_592_000

const encoder = new TextEncoder()

async function hmacHex(key: string, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Constant-time for equal-length strings; length itself is not secret here. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function createSessionToken(secret: string, nowMs: number): Promise<string> {
  const expiresAt = String(nowMs + SESSION_MAX_AGE_SEC * 1000)
  return `${expiresAt}.${await hmacHex(secret, expiresAt)}`
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string,
  nowMs: number
): Promise<boolean> {
  if (!token || !secret) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [expiresAt, sig] = parts
  if (!/^\d+$/.test(expiresAt)) return false
  if (!safeEqual(await hmacHex(secret, expiresAt), sig)) return false
  return Number(expiresAt) > nowMs
}

/** Compares HMAC digests of both values so timing doesn't leak length or prefix. */
export async function passwordMatches(input: string, expected: string): Promise<boolean> {
  if (!input || !expected) return false
  const key = 'mr-admin-password-compare'
  return safeEqual(await hmacHex(key, input), await hmacHex(key, expected))
}
