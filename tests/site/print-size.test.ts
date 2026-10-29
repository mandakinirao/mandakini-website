import { expect, test } from 'vitest'
import { formatPrintSize } from '@/lib/print-size'

test('height × width with unit', () => {
  expect(formatPrintSize(40, 30, 'cm')).toBe('40 × 30 cm')
  expect(formatPrintSize(11.5, 8, 'in')).toBe('11.5 × 8 in')
})

test('missing either side shows nothing', () => {
  expect(formatPrintSize(40, null, 'cm')).toBe('')
  expect(formatPrintSize(undefined, 30, 'cm')).toBe('')
  expect(formatPrintSize(0, 30, 'cm')).toBe('')
})

test('unit defaults to cm', () => {
  expect(formatPrintSize(40, 30, undefined)).toBe('40 × 30 cm')
})
