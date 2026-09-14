import { CART_STORAGE_KEY, parseStoredCart } from './cart'
import type { CartItem } from './types'

export function readCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)

    if (!raw) {
      return []
    }

    return parseStoredCart(JSON.parse(raw))
  } catch {
    return []
  }
}

export function writeCartToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage can be unavailable or full; keep in-memory cart usable.
  }
}
