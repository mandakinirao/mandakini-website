import Image from 'next/image'
import type { JournalImage } from '@/lib/journal'

function sizesForPosition(position: string) {
  return position === 'left' || position === 'right'
    ? '(max-width: 800px) 92vw, 42vw'
    : '(max-width: 800px) 92vw, 76vw'
}

export default function JournalCollage({
  images,
  position,
}: {
  images: JournalImage[]
  position: 'left' | 'right' | 'top' | 'bottom'
}) {
  const dataCount = images.length >= 5 ? '5-plus' : String(images.length)
  const sizes = sizesForPosition(position)

  return (
    <div className="mr-collage" data-count={dataCount}>
      {images.map((img, i) => (
        <span
          key={img.url}
          className={`mr-collage__item mr-mask${i % 2 ? ' mr-mask--b' : ''}`}
          style={{ aspectRatio: img.aspectRatio || 1 }}
        >
          <Image src={img.url} alt={img.alt} fill sizes={sizes} data-reveal-img />
        </span>
      ))}
    </div>
  )
}
