import { expect, test } from 'vitest'
import { MAX_UPLOAD_BYTES, validateUpload } from '@/lib/admin/upload'

test('HEIC is refused with a plain message', () => {
  expect(validateUpload({ type: 'image/heic', size: 1000, name: 'photo.heic' })).toEqual({
    ok: false,
    error: "photo.heic isn't a JPEG, PNG or WebP. Save it as a JPEG and try again.",
  })
})

test('too large is refused', () => {
  expect(validateUpload({ type: 'image/jpeg', size: MAX_UPLOAD_BYTES + 1, name: 'photo.jpg' })).toEqual({
    ok: false,
    error: 'photo.jpg is too large (over 4 MB).',
  })
})

test('a normal JPEG is fine', () => {
  expect(validateUpload({ type: 'image/jpeg', size: 1024 * 1024, name: 'photo.jpg' })).toEqual({ ok: true })
})
