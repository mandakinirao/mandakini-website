'use client'

import { useState } from 'react'
import type { HomePrint } from '@/lib/home-data'
import { useCart } from '@/lib/cart'
import PillCta from '@/components/ui/PillCta'
import CheckoutAddressModal from '@/components/shop/CheckoutAddressModal'

interface BuyControlsProps {
  print: HomePrint
  variant?: 'compact' | 'full'
}

export default function BuyControls({ print, variant = 'compact' }: BuyControlsProps) {
  const { add } = useCart()
  const [addrOpen, setAddrOpen] = useState(false)

  if (!print.available || print.stock === 0) {
    return (
      <div className={`mr-buy mr-buy--${variant}`}>
        <p className="mr-buy__sold">Sold out</p>
        <p className="mr-buy__hint">
          This edition is complete —{' '}
          <a href="/contact">get in touch</a> about other works.
        </p>
      </div>
    )
  }

  return (
    <div className={`mr-buy mr-buy--${variant}`}>
      <p className="mr-buy__amount">₹{print.amount.toLocaleString('en-IN')}</p>
      <div className="mr-buy__ctas">
        <PillCta
          onClick={() =>
            add({
              slug: print.slug,
              title: print.title,
              image: print.image,
              amount: print.amount,
              stock: print.stock,
            })
          }
        >
          Add to Cart
        </PillCta>
        <PillCta onClick={() => setAddrOpen(true)}>Buy Now</PillCta>
      </div>

      <CheckoutAddressModal
        open={addrOpen}
        items={[{ slug: print.slug, qty: 1 }]}
        label={print.title}
        onClose={() => setAddrOpen(false)}
      />
    </div>
  )
}
