import type { Metadata } from 'next'
import PressPage, { type PressItem } from '@/components/press/PressPage'

export const metadata: Metadata = {
  title: 'Press — Mandakini Rao',
  description: 'Press, features, interviews and podcasts featuring Mandakini Rao.',
}

export const revalidate = 60

export default async function PressRoute() {
  let items: PressItem[] = []
  try {
    if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      const [{ client }, { allPressQuery }] = await Promise.all([
        import('@/sanity/lib/client'),
        import('@/sanity/lib/queries'),
      ])
      items = (await client.fetch<PressItem[]>(allPressQuery)) ?? []
    }
  } catch {
    items = []
  }
  return <PressPage items={items} />
}
