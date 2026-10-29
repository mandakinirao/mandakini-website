export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validateUpload(f: { type: string; size: number; name: string }): { ok: true } | { ok: false; error: string } {
  if (!ALLOWED_TYPES.includes(f.type)) {
    return { ok: false, error: `${f.name} isn't a JPEG, PNG or WebP. Save it as a JPEG and try again.` }
  }
  if (f.size > MAX_UPLOAD_BYTES) return { ok: false, error: `${f.name} is too large (over 4 MB).` }
  return { ok: true }
}
