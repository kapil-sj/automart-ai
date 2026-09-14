import {
  CART_STORAGE_KEY,
  addCartItem,
  removeCartItem,
  updateCartItemQuantity,
} from './cart'
import { readCartFromStorage, writeCartToStorage } from './storage'
import type { CartItem, CartItemInput } from './types'

export type CartSnapshot = {
  items: CartItem[]
  isReady: boolean
}

const EMPTY_ITEMS: CartItem[] = []
const SERVER_SNAPSHOT: CartSnapshot = { items: EMPTY_ITEMS, isReady: false }

let items: CartItem[] = EMPTY_ITEMS
let isReady = false
let snapshot: CartSnapshot = SERVER_SNAPSHOT
const listeners = new Set<() => void>()

function emit() {
  snapshot = { items, isReady }
  listeners.forEach((listener) => listener())
}

function hydrateFromStorage() {
  if (isReady || typeof window === 'undefined') {
    return
  }

  items = readCartFromStorage()
  isReady = true
  snapshot = { items, isReady }
}

function handleStorage(event: StorageEvent) {
  if (event.key && event.key !== CART_STORAGE_KEY) {
    return
  }

  items = readCartFromStorage()
  isReady = true
  emit()
}

export function subscribeToCart(onStoreChange: () => void) {
  const shouldListen = listeners.size === 0
  listeners.add(onStoreChange)
  hydrateFromStorage()

  if (shouldListen && typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage)
  }

  let cancelled = false
  queueMicrotask(() => {
    if (!cancelled) {
      onStoreChange()
    }
  })

  return () => {
    cancelled = true
    listeners.delete(onStoreChange)
    if (listeners.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage)
    }
  }
}

export function getCartSnapshot() {
  return snapshot
}

export function getCartServerSnapshot() {
  return SERVER_SNAPSHOT
}

export function setCartItems(nextItems: CartItem[]) {
  hydrateFromStorage()
  items = nextItems
  writeCartToStorage(nextItems)
  emit()
}

export function addItemToCart(item: CartItemInput) {
  setCartItems(addCartItem(getCartSnapshot().items, item))
}

export function updateCartQuantity(productId: string, quantity: number) {
  setCartItems(updateCartItemQuantity(getCartSnapshot().items, productId, quantity))
}

export function removeItemFromCart(productId: string) {
  setCartItems(removeCartItem(getCartSnapshot().items, productId))
}
