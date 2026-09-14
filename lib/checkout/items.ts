import { MAX_ITEM_QUANTITY, MIN_ITEM_QUANTITY } from '@/lib/cart/cart'
import type { CheckoutFieldErrors, CheckoutItemRequest } from './types'

const PRODUCT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MAX_CHECKOUT_LINES = 50

export function parseCheckoutItems(value: unknown): { items: CheckoutItemRequest[]; fieldErrors: CheckoutFieldErrors } {
  if (!Array.isArray(value) || value.length === 0) {
    return { items: [], fieldErrors: { items: 'Your cart is empty. Add a product before checking out.' } }
  }

  if (value.length > MAX_CHECKOUT_LINES) {
    return { items: [], fieldErrors: { items: 'Too many items to check out at once.' } }
  }

  const merged = new Map<string, number>()

  for (const entry of value) {
    if (!entry || typeof entry !== 'object') {
      return { items: [], fieldErrors: { items: 'Checkout items are invalid.' } }
    }

    const record = entry as Record<string, unknown>
    const productId = typeof record.productId === 'string' ? record.productId.trim() : ''

    if (!PRODUCT_ID_PATTERN.test(productId)) {
      return { items: [], fieldErrors: { items: 'One or more products could not be verified.' } }
    }

    const quantity = typeof record.quantity === 'number' ? record.quantity : Number(record.quantity)

    if (!Number.isInteger(quantity) || quantity < MIN_ITEM_QUANTITY || quantity > MAX_ITEM_QUANTITY) {
      return {
        items: [],
        fieldErrors: { items: `Each item quantity must be a whole number between ${MIN_ITEM_QUANTITY} and ${MAX_ITEM_QUANTITY}.` },
      }
    }

    const nextQuantity = (merged.get(productId) ?? 0) + quantity
    if (nextQuantity > MAX_ITEM_QUANTITY) {
      return {
        items: [],
        fieldErrors: { items: `Quantity cannot exceed ${MAX_ITEM_QUANTITY} for a single product.` },
      }
    }

    merged.set(productId, nextQuantity)
  }

  const items = [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }))
  return { items, fieldErrors: {} }
}
