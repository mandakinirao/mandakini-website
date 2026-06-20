import { Suspense } from 'react'
import Navigation from '@/components/layout/Navigation'
import ThemeV2 from '@/components/layout/ThemeV2'
import FooterV2 from '@/components/home/v2/FooterV2'
import CartDrawer from '@/components/shop/CartDrawer'
import { CartProvider } from '@/lib/cart'
import { commerceEnabled } from '@/lib/commerce'
import { client } from '@/sanity/lib/client'
import { footerSocialQuery } from '@/sanity/lib/queries'

type FooterSocial = { instagramHandle?: string; youtubeChannelName?: string }

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const social = await client
    .fetch<FooterSocial | null>(footerSocialQuery, {}, { next: { revalidate: 3600 } })
    .catch(() => null)

  const inner = (
    <>
      <Suspense fallback={null}>
        <ThemeV2 />
      </Suspense>
      <Navigation />
      <main>{children}</main>
      <FooterV2
        instagramHandle={social?.instagramHandle}
        youtubeChannelName={social?.youtubeChannelName}
      />
    </>
  )

  if (!commerceEnabled()) return inner

  return (
    <CartProvider>
      {inner}
      <CartDrawer />
    </CartProvider>
  )
}
