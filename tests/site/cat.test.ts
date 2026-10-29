import { expect, test } from 'vitest'
import { CAT_LINES, leanAngle, nextLineIndex } from '@/lib/cat'

test('leans toward the cursor, capped at 8 degrees', () => {
  expect(leanAngle(1000, 1000)).toBe(0)
  expect(leanAngle(800, 1000)).toBeGreaterThan(0)
  expect(leanAngle(1000, 800)).toBeLessThan(0)
  expect(leanAngle(0, 5000)).toBe(8)
  expect(leanAngle(5000, 0)).toBe(-8)
})

test('lines cycle and never repeat back to back', () => {
  expect(nextLineIndex(0)).toBe(1)
  expect(nextLineIndex(CAT_LINES.length - 1)).toBe(0)
})

test('every line links somewhere on the site', () => {
  for (const l of CAT_LINES) expect(l.href).toMatch(/^\//)
})
