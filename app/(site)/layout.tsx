import { Suspense } from 'react'
import Navigation from '@/components/layout/Navigation'
import ThemeV2 from '@/components/layout/ThemeV2'
import FooterV2 from '@/components/home/v2/FooterV2'
import CartDrawer from '@/components/shop/CartDrawer'
import { CartProvider } from '@/lib/cart'
import { commerceEnabled } from '@/lib/commerce'
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const inner = (
    <>
      <Suspense fallback={null}>
        <ThemeV2 />
      </Suspense>
      <Navigation />
      <main id="main-content">{children}</main>
      <FooterV2 />
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
