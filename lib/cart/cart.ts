import type { CartItem, CartItemInput } from './types'

export const CART_STORAGE_KEY = 'automart-ai.cart.v1'
export const MAX_ITEM_QUANTITY = 10
export const MIN_ITEM_QUANTITY = 1

export function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_ITEM_QUANTITY
  }

  return Math.min(MAX_ITEM_QUANTITY, Math.max(MIN_ITEM_QUANTITY, Math.trunc(value)))
}

export function itemSubtotal(item: CartItem): number {
  return item.unitPrice * item.quantity
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + itemSubtotal(item), 0)
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export function addCartItem(items: CartItem[], incoming: CartItemInput): CartItem[] {
  const quantity = clampQuantity(incoming.quantity)
  const nextItem = sanitizeCartItem({ ...incoming, quantity })

  if (!nextItem) {
    return items
  }

  const existingIndex = items.findIndex((item) => item.productId === nextItem.productId)

  if (existingIndex === -1) {
    return [...items, nextItem]
  }

  return items.map((item, index) =>
    index === existingIndex
      ? {
          ...item,
          name: nextItem.name,
          imageUrl: nextItem.imageUrl,
          unitPrice: nextItem.unitPrice,
          quantity: clampQuantity(item.quantity + nextItem.quantity),
        }
      : item,
  )
}

export function updateCartItemQuantity(items: CartItem[], productId: string, quantity: number): CartItem[] {
  const nextQuantity = clampQuantity(quantity)

  return items.map((item) => (item.productId === productId ? { ...item, quantity: nextQuantity } : item))
}

export function removeCartItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.productId !== productId)
}

export function parseStoredCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) {
    return []
  }

  const items: CartItem[] = []

  for (const entry of value) {
    const item = sanitizeCartItem(entry)

    if (!item) {
      continue
    }

    const existingIndex = items.findIndex((current) => current.productId === item.productId)

    if (existingIndex === -1) {
      items.push(item)
      continue
    }

    items[existingIndex] = {
      ...items[existingIndex],
      quantity: clampQuantity(items[existingIndex].quantity + item.quantity),
    }
  }

  return items
}

function sanitizeCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>
  const productId = readNonEmptyString(record.productId) ?? readNonEmptyString(record.product_id)
  const name = readNonEmptyString(record.name)
  const unitPrice = readPrice(record.unitPrice ?? record.unit_price)
  const quantity = clampQuantity(typeof record.quantity === 'number' ? record.quantity : Number(record.quantity))
  const imageUrl = readImageUrl(record.imageUrl ?? record.image_url)

  if (!productId || !name || unitPrice === null) {
    return null
  }

  return {
    productId,
    name,
    imageUrl,
    unitPrice,
    quantity,
  }
}

function readNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function readImageUrl(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null
  }

  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function readPrice(value: unknown): number | null {
  const amount = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(amount) || amount < 0) {
    return null
  }

  return amount
}
