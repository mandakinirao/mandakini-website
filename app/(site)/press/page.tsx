import type { Metadata } from 'next'
import PressPage from '@/components/press/PressPage'
import type { EnrichedPressItem } from '@/lib/press'

export const metadata: Metadata = {
  title: 'Press — Mandakini Rao',
  description: 'Press, features, interviews and podcasts featuring Mandakini Rao.',
}

export const revalidate = 3600

export default async function PressRoute() {
  let items: EnrichedPressItem[] = []
  try {
    const [{ client }, { pressItemsQuery }, { enrichPressItems }] = await Promise.all([
      import('@/sanity/lib/client'),
      import('@/sanity/lib/queries'),
      import('@/lib/press'),
    ])
    const raw = await client.fetch<import('@/lib/press').RawPressItem[] | null>(pressItemsQuery)
    if (raw?.length) {
      items = await enrichPressItems(raw)
    }
  } catch {
    items = []
  }
  return <PressPage items={items} />
}
