'use client'

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { cartItemCount, cartSubtotal } from '@/lib/cart/cart'
import {
  addItemToCart,
  getCartServerSnapshot,
  getCartSnapshot,
  removeItemFromCart,
  subscribeToCart,
  updateCartQuantity,
} from '@/lib/cart/store'
import type { CartItem, CartItemInput } from '@/lib/cart/types'

type CartContextValue = {
  items: CartItem[]
  isReady: boolean
  itemCount: number
  subtotal: number
  addItem: (item: CartItemInput) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { items, isReady } = useSyncExternalStore(subscribeToCart, getCartSnapshot, getCartServerSnapshot)

  const addItem = useCallback((item: CartItemInput) => {
    addItemToCart(item)
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    updateCartQuantity(productId, quantity)
  }, [])

  const removeItem = useCallback((productId: string) => {
    removeItemFromCart(productId)
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isReady,
      itemCount: cartItemCount(items),
      subtotal: cartSubtotal(items),
      addItem,
      updateQuantity,
      removeItem,
    }),
    [addItem, isReady, items, removeItem, updateQuantity],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }

  return context
}
