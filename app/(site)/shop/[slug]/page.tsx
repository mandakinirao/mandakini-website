import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductDetail from '@/components/shop/ProductDetail'
import { getAllPrints, getPrintBySlug } from '@/lib/home-data'
import { commerceEnabled } from '@/lib/commerce'

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

// ISR: static page, refreshed every 60s and on the Sanity publish webhook.
export const revalidate = 60

export default async function ProductPage({ params }: Params) {
  const [print, all] = await Promise.all([
    getPrintBySlug(params.slug),
    getAllPrints(),
  ])
  if (!print) notFound()

  const others = all.filter((p) => p.slug !== print.slug)
  return (
    <ProductDetail
      print={print}
      others={others}
      commerceEnabled={commerceEnabled()}
    />
  )
}
