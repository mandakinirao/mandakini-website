import { expect, test } from 'vitest'
import { pickFeatured } from '@/lib/admin/featured'

test('uses featured items when there are any', () => {
  expect(pickFeatured(['a'], ['b', 'c'], 3)).toEqual(['a'])
})

test('falls back to the first items, capped', () => {
  expect(pickFeatured([], ['b', 'c', 'd', 'e'], 3)).toEqual(['b', 'c', 'd'])
})

test('caps featured items too', () => {
  expect(pickFeatured(['a', 'b', 'c', 'd'], [], 3)).toEqual(['a', 'b', 'c'])
})

test('nothing at all gives an empty list', () => {
  expect(pickFeatured(null, null, 3)).toEqual([])
})
