import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductDetail from '@/components/shop/ProductDetail'
import PageWash from '@/components/ui/PageWash'
import { getAllPrints, getPrintBySlug } from '@/lib/home-data'
import { getSiteSettings } from '@/lib/site-settings'
import { commerceEnabled } from '@/lib/commerce'
import '@/styles/pages.css'

interface Params {
  params: { slug: string }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const print = await getPrintBySlug(params.slug)
  return {
    title: print ? `${print.title} — Mandakini Rao` : 'Print — Mandakini Rao',
    description: print?.desc,
  }
}

export const revalidate = 60

export default async function ProductPage({ params }: Params) {
  const [print, all, settings] = await Promise.all([
    getPrintBySlug(params.slug),
    getAllPrints(),
    getSiteSettings(),
  ])
  if (!print) notFound()

  const others = all.filter((p) => p.slug !== print.slug)
  return (
    <>
      <PageWash className="pdp-moss page-wash-light" />
      <ProductDetail
        print={print}
        others={others}
        commerceEnabled={commerceEnabled()}
        paperSpec={settings.printDefaultPaper}
        signatureSpec={settings.printDefaultSignature}
        shippingSpec={settings.printDefaultShipping}
      />
    </>
  )
}
