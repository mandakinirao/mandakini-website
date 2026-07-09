import Image from 'next/image'
import type { JournalImage } from '@/lib/journal'
import JournalCollage from './JournalCollage'
import JournalCarousel from './JournalCarousel'

function sizesForPosition(position: string) {
  return position === 'left' || position === 'right'
    ? '(max-width: 800px) 92vw, 42vw'
    : '(max-width: 800px) 92vw, 76vw'
}

export default function JournalImageGroup({
  images,
  mode,
  position,
}: {
  images: JournalImage[]
  mode: 'collage' | 'carousel'
  position: 'left' | 'right' | 'top' | 'bottom'
}) {
  if (images.length === 0) return null

  if (images.length === 1) {
    const img = images[0]
    return (
      <span className="mr-journal__image mr-mask" style={{ aspectRatio: img.aspectRatio || 4 / 5 }}>
        <Image src={img.url} alt={img.alt} fill sizes={sizesForPosition(position)} data-reveal-img />
      </span>
    )
  }

  return mode === 'carousel' ? (
    <JournalCarousel images={images} position={position} />
  ) : (
    <JournalCollage images={images} position={position} />
  )
}
