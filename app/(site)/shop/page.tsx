import type { Metadata } from 'next'
import PrivateCollection from '@/components/shop/PrivateCollection'
import ShopIndex from '@/components/shop/ShopIndex'
import PageWash from '@/components/ui/PageWash'
import { getAllShopItems } from '@/lib/home-data'
import { getSiteSettings } from '@/lib/site-settings'
import { commerceEnabled } from '@/lib/commerce'
import '@/styles/pages.css'

export const metadata: Metadata = {
  title: 'Shop — Mandakini Rao',
  description: 'Signed, numbered print editions from Mandakini Rao\'s Hyderabad studio.',
}

export const revalidate = 60

export default async function ShopPage() {
  const [prints, settings] = await Promise.all([
    getAllShopItems(),
    getSiteSettings(),
  ])
  return (
    <>
      <PageWash className="pdp-moss page-wash-dark" />
      <ShopIndex
        prints={prints}
        commerceEnabled={commerceEnabled()}
        headline={settings.shopPageHeadline}
        printNote={settings.shopPrintNote}
      />
      <PrivateCollection
        title={settings.privateCollectionTitle}
        line={settings.privateCollectionLine}
        contactEmail={settings.contactEmail}
      />
    </>
  )
}
