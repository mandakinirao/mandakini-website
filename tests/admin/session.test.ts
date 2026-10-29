import { expect, test } from 'vitest'
import {
  SESSION_MAX_AGE_SEC,
  createSessionToken,
  passwordMatches,
  verifySessionToken,
} from '@/lib/admin/session'

const S = 'x'.repeat(32)

test('valid token verifies', async () => {
  const t = await createSessionToken(S, 1_000)
  expect(await verifySessionToken(t, S, 2_000)).toBe(true)
})

test('expired token rejected', async () => {
  const t = await createSessionToken(S, 0)
  expect(await verifySessionToken(t, S, SESSION_MAX_AGE_SEC * 1000 + 1)).toBe(false)
})

test('tampered expiry rejected', async () => {
  const [, sig] = (await createSessionToken(S, 0)).split('.')
  expect(await verifySessionToken(`99999999999999.${sig}`, S, 1)).toBe(false)
})

test('wrong secret rejected', async () => {
  expect(await verifySessionToken(await createSessionToken(S, 0), 'y'.repeat(32), 1)).toBe(false)
})

test('missing or garbage token rejected', async () => {
  for (const t of [undefined, '', 'abc', '1.2.3']) {
    expect(await verifySessionToken(t, S, 1)).toBe(false)
  }
})

test('passwordMatches', async () => {
  expect(await passwordMatches('hunter2', 'hunter2')).toBe(true)
  expect(await passwordMatches('hunter3', 'hunter2')).toBe(false)
  expect(await passwordMatches('', 'hunter2')).toBe(false)
})
