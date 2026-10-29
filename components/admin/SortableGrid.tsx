'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { reorderPrints } from '@/app/admin/(panel)/shop/actions'

export interface GridCard {
  id: string
  href: string
  title: string
  image: string
  lines: string[]
  badges: string[]
}

export default function SortableGrid({
  cards: initial,
  onReorder = reorderPrints,
  savedText = 'Order saved. The shop shows this order now.',
}: {
  cards: GridCard[]
  onReorder?: (ids: string[]) => Promise<{ ok: boolean }>
  savedText?: string
}) {
  const [cards, setCards] = useState(initial)
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [, start] = useTransition()

  function drop(targetId: string) {
    if (!dragging || dragging === targetId) return
    const next = [...cards]
    const from = next.findIndex((c) => c.id === dragging)
    const to = next.findIndex((c) => c.id === targetId)
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setCards(next)
    setNotice('Saving the new order…')
    start(async () => {
      const r = await onReorder(next.map((c) => c.id))
      setNotice(r.ok ? savedText : "Couldn't save the order. Try again.")
    })
  }

  return (
    <>
      {notice && <p className="mr-admin-notice" role="status">{notice}</p>}
      <div className="mr-admin-grid">
        {cards.map((c) => (
          <Link
            key={c.id}
            href={c.href}
            draggable
            onDragStart={(e) => {
              setDragging(c.id)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setOver(c.id)
            }}
            onDragLeave={() => setOver((o) => (o === c.id ? null : o))}
            onDrop={(e) => {
              e.preventDefault()
              drop(c.id)
              setOver(null)
            }}
            onDragEnd={() => {
              setDragging(null)
              setOver(null)
            }}
            className={`mr-admin-card${dragging === c.id ? ' mr-admin-card--dragging' : ''}${over === c.id && dragging !== c.id ? ' mr-admin-card--over' : ''}`}
          >
            {c.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.image} alt="" className="mr-admin-card__img" draggable={false} />
            ) : (
              <div className="mr-admin-card__img" />
            )}
            <div className="mr-admin-card__body">
              <strong>{c.title}</strong>
              {c.lines.map((l) => (
                <span key={l} className="mr-admin-muted">{l}</span>
              ))}
              {c.badges.length > 0 && (
                <div className="mr-admin-card__badges">
                  {c.badges.map((b) => (
                    <span key={b} className="mr-admin-badge">{b}</span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
