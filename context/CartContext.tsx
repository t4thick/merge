'use client'

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react'
import type { Product, CartItem } from '@/types'

type CartContextType = {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
  setCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | null>(null)

const STORAGE_KEY = 'lqam-cart'

function parseCart(raw: string | null): CartItem[] {
  if (!raw) return []
  try {
    const p = JSON.parse(raw) as unknown
    return Array.isArray(p) ? (p as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const openCart = useCallback(() => setCartOpen(true), [])
  const closeCart = useCallback(() => setCartOpen(false), [])

  useEffect(() => {
    const hydrate = () => setItems(parseCart(localStorage.getItem(STORAGE_KEY)))
    const t = window.setTimeout(hydrate, 0)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) {
        setItems(parseCart(localStorage.getItem(STORAGE_KEY)))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const safeQuantity = Number.isInteger(quantity) ? Math.min(Math.max(quantity, 1), 99) : 1
      const existing = prev.find((i) => i.product.id === product.id)
      const next = existing
        ? prev.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + safeQuantity } : i
          )
        : [...prev, { product, quantity: safeQuantity }]
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch (e) {
        if (typeof window !== 'undefined') {
          ;(window as unknown as { __lqamCartWriteError?: string }).__lqamCartWriteError =
            String(e)
        }
        return prev
      }
      return next
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.product.id !== id)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch (e) {
        if (typeof window !== 'undefined') {
          ;(window as unknown as { __lqamCartWriteError?: string }).__lqamCartWriteError =
            String(e)
        }
        return prev
      }
      return next
    })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) => {
      let next: CartItem[]
      if (quantity <= 0) {
        next = prev.filter((i) => i.product.id !== id)
      } else {
        next = prev.map((i) =>
          i.product.id === id ? { ...i, quantity } : i
        )
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch (e) {
        if (typeof window !== 'undefined') {
          ;(window as unknown as { __lqamCartWriteError?: string }).__lqamCartWriteError =
            String(e)
        }
        return prev
      }
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    } catch (e) {
      if (typeof window !== 'undefined') {
        ;(window as unknown as { __lqamCartWriteError?: string }).__lqamCartWriteError =
          String(e)
      }
      return
    }
    setItems([])
  }, [])

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  )
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  )

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      cartOpen,
      openCart,
      closeCart,
      setCartOpen,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, cartOpen, openCart, closeCart, setCartOpen]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    // Fallback avoids hard crashes during non-interactive renders.
    return {
      items: [],
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      totalItems: 0,
      totalPrice: 0,
      cartOpen: false,
      openCart: () => {},
      closeCart: () => {},
      setCartOpen: () => {},
    }
  }
  return ctx
}
