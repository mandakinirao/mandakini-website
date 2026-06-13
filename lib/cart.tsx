'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

/**
 * Cart state (Phase 2, commerce flag only). Per-session: persisted to
 * sessionStorage so a Stripe-cancel round trip returns to an intact
 * cart, gone when the tab closes. Quantities are capped by stock here
 * for UX; the checkout route re-validates everything server-side.
 */

export interface CartItem {
  slug: string
  title: string
  image: string
  amount: number
  stock: number
  qty: number
}

interface CartState {
  items: CartItem[]
  subtotal: number
  count: number
  open: boolean
  setOpen: (open: boolean) => void
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  setQty: (slug: string, qty: number) => void
  remove: (slug: string) => void
  clear: () => void
}

const STORAGE_KEY = 'mr-cart'

const noop = () => {}
const EMPTY: CartState = {
  items: [],
  subtotal: 0,
  count: 0,
  open: false,
  setOpen: noop,
  add: noop,
  setQty: noop,
  remove: noop,
  clear: noop,
}

const CartContext = createContext<CartState>(EMPTY)

export function useCart(): CartState {
  return useContext(CartContext)
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {
      /* corrupt or unavailable storage — start empty */
    }
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* storage unavailable — cart lives in memory only */
    }
  }, [items])

  const add = useCallback((item: Omit<CartItem, 'qty'>, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug)
      if (existing) {
        return prev.map((i) =>
          i.slug === item.slug
            ? { ...i, qty: Math.min(i.qty + qty, i.stock) }
            : i
        )
      }
      return [...prev, { ...item, qty: Math.min(qty, item.stock) }]
    })
    setOpen(true)
  }, [])

  const setQty = useCallback((slug: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.slug !== slug)
        : prev.map((i) =>
            i.slug === slug ? { ...i, qty: Math.min(qty, i.stock) } : i
          )
    )
  }, [])

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartState>(() => {
    const subtotal = items.reduce((sum, i) => sum + i.amount * i.qty, 0)
    const count = items.reduce((sum, i) => sum + i.qty, 0)
    return { items, subtotal, count, open, setOpen, add, setQty, remove, clear }
  }, [items, open, add, setQty, remove, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
