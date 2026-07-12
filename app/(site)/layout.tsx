import { Suspense } from 'react'
import Script from 'next/script'
import Navigation from '@/components/layout/Navigation'
import ThemeV2 from '@/components/layout/ThemeV2'
import FooterV2 from '@/components/home/v2/FooterV2'
import CatMascot from '@/components/ui/CatMascot'
import CartDrawer from '@/components/shop/CartDrawer'
import { CartProvider } from '@/lib/cart'
import { commerceEnabled } from '@/lib/commerce'
import { hasJournalPosts } from '@/lib/journal'
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const showJournal = await hasJournalPosts()

  const inner = (
    <>
      <Suspense fallback={null}>
        <ThemeV2 />
      </Suspense>
      <Navigation showJournal={showJournal} />
      <main id="main-content">{children}</main>
      <FooterV2 showJournal={showJournal} />
      <CatMascot />
    </>
  )

  if (!commerceEnabled()) return inner

  return (
    <CartProvider>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {inner}
      <CartDrawer />
    </CartProvider>
  )
}
