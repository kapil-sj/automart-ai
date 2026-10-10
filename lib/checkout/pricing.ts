import { getPresentationPrice, PRESENTATION_CURRENCY } from '@/lib/catalog/presentation-price'
import type { CatalogProduct } from '@/lib/catalog/products'
import type { CheckoutItemRequest, CheckoutLine, CheckoutQuote } from './types'

/**
 * Server-side checkout pricing using authoritative database prices and migration 002 column names.
 *
 * Cart prices are never trusted. Product prices are re-fetched directly from the Supabase products table.
 * Supplier costs, landed cost, and autonomous procurement are intentionally staged for later milestones.
 */
export const CHECKOUT_SHIPPING_AMOUNT = 0
export const CHECKOUT_OTHER_FEES = 0
export const CHECKOUT_COMMISSION_AMOUNT = 0

export function getAuthoritativeUnitPrice(product: CatalogProduct): number {
  if (typeof product.price === 'number' && Number.isFinite(product.price) && product.price >= 0) {
    return product.price
  }

  return getPresentationPrice(product.id)
}

export function quoteCheckout(products: CatalogProduct[], requestedItems: CheckoutItemRequest[]): CheckoutQuote {
  const productsById = new Map(products.map((product) => [product.id, product]))
  const lines: CheckoutLine[] = []

  for (const item of requestedItems) {
    const product = productsById.get(item.productId)

    if (!product) {
      continue
    }

    const unit_price_inr = getAuthoritativeUnitPrice(product)
    const line_total_inr = unit_price_inr * item.quantity
    const shipping_inr = 0
    const other_fees_inr = 0
    const landed_cost_inr = 0
    const automart_commission_inr = 0

    lines.push({
      productId: product.id,
      name: product.name,
      imageUrl: product.image_url,
      quantity: item.quantity,
      unit_price_inr,
      shipping_inr,
      other_fees_inr,
      landed_cost_inr,
      automart_commission_inr,
      line_total_inr,
      // Transition aliases
      unitPrice: unit_price_inr,
      lineTotal: line_total_inr,
    })
  }

  const subtotal_inr = lines.reduce((total, line) => total + line.line_total_inr, 0)
  const shipping_inr = CHECKOUT_SHIPPING_AMOUNT
  const other_fees_inr = CHECKOUT_OTHER_FEES
  const total_inr = subtotal_inr + shipping_inr + other_fees_inr
  const automart_commission_inr = CHECKOUT_COMMISSION_AMOUNT

  return {
    lines,
    subtotal_inr,
    shipping_inr,
    other_fees_inr,
    total_inr,
    automart_commission_inr,
    currency: PRESENTATION_CURRENCY,
    // Transition aliases
    subtotal: subtotal_inr,
    shippingAmount: shipping_inr,
    otherFees: other_fees_inr,
    total: total_inr,
  }
}
