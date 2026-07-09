import { PortableText } from '@portabletext/react'
import type { JournalSectionData } from '@/lib/journal'
import JournalImageGroup from './JournalImageGroup'
import { journalPortableTextComponents } from './portableTextComponents'

export default function JournalSection({ section }: { section: JournalSectionData }) {
  const hasImages = section.images.length > 0

  if (section.pullQuote) {
    return (
      <blockquote className="mr-journal__pullquote" data-journal-section>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <PortableText value={section.text as any} components={journalPortableTextComponents} />
      </blockquote>
    )
  }

  const modifier = hasImages ? `mr-journal__section--${section.position}` : 'mr-journal__section--text-only'
  const caption = section.images.find((img) => img.caption)?.caption

  return (
    <div className={`mr-journal__section ${modifier}`} data-journal-section>
      {hasImages && (
        <div className="mr-journal__image-group">
          <JournalImageGroup images={section.images} mode={section.displayMode} position={section.position} />
          {caption && <p className="mr-journal__caption">{caption}</p>}
        </div>
      )}
      <div className="mr-journal__text">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <PortableText value={section.text as any} components={journalPortableTextComponents} />
      </div>
    </div>
  )
}
