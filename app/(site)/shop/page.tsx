import type { Metadata } from 'next'
import PrivateCollection from '@/components/shop/PrivateCollection'
import ShopIndex from '@/components/shop/ShopIndex'
import { getHomeData } from '@/lib/home-data'
import { commerceEnabled } from '@/lib/commerce'

export const metadata: Metadata = {
  title: 'Shop — Mandakini Rao',
  description: 'Signed, numbered print editions from Mandakini Rao\'s Hyderabad studio.',
}

// ISR: static page, refreshed every 60s and on the Sanity publish webhook.
export const revalidate = 60

export default async function ShopPage() {
  const { prints } = await getHomeData()
  return (
    <>
      <ShopIndex prints={prints} commerceEnabled={commerceEnabled()} />
      <PrivateCollection />
    </>
  )
}
