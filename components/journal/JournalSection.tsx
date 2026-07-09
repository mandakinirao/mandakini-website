import { PortableText } from '@portabletext/react'
import type { JournalSectionData } from '@/lib/journal'
import JournalImageGroup from './JournalImageGroup'
import { journalPortableTextComponents } from './portableTextComponents'

export default function JournalSection({ section }: { section: JournalSectionData }) {
  const hasImages = section.images.length > 0
  const modifier = hasImages ? `mr-journal__section--${section.position}` : 'mr-journal__section--text-only'

  return (
    <div className={`mr-journal__section ${modifier}`} data-journal-section>
      {hasImages && (
        <JournalImageGroup images={section.images} mode={section.displayMode} position={section.position} />
      )}
      <div className="mr-journal__text">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <PortableText value={section.text as any} components={journalPortableTextComponents} />
      </div>
    </div>
  )
}
