'use client'

import { useEffect, useState } from 'react'
import PhotoDropzone, { type Photo } from '@/components/admin/PhotoDropzone'

/** One-photo field: keeps the parent's single value in sync with the drop zone. */
export default function SinglePhoto({
  label,
  value,
  onChange,
  hint,
  error,
}: {
  label: string
  value: Photo | null
  onChange: (p: Photo | null) => void
  hint?: string
  error?: string
}) {
  const [photos, setPhotos] = useState<Photo[]>(value ? [value] : [])

  useEffect(() => {
    const p = photos[0] ?? null
    if (p?.key !== value?.key || p?.status !== value?.status || p?.alt !== value?.alt) onChange(p)
  }, [photos, value, onChange])

  return <PhotoDropzone photos={photos} setPhotos={setPhotos} label={label} hint={hint} error={error} single />
}
