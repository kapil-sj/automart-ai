import { getPresentationPrice, PRESENTATION_CURRENCY } from '@/lib/catalog/presentation-price'
import type { CatalogProduct } from '@/lib/catalog/products'
import type { CheckoutItemRequest, CheckoutLine, CheckoutQuote } from './types'

/**
 * Temporary server-side checkout pricing.
 *
 * Cart prices are never used. Supplier costs, landed cost, and procurement
 * are intentionally out of scope. Unit prices currently reuse the isolated
 * presentation-price helper after products have been re-fetched as active.
 */
export const CHECKOUT_SHIPPING_AMOUNT = 0
export const CHECKOUT_OTHER_FEES = 0

export function getAuthoritativeUnitPrice(productId: string): number {
  return getPresentationPrice(productId)
}

export function quoteCheckout(products: CatalogProduct[], requestedItems: CheckoutItemRequest[]): CheckoutQuote {
  const productsById = new Map(products.map((product) => [product.id, product]))
  const lines: CheckoutLine[] = []

  for (const item of requestedItems) {
    const product = productsById.get(item.productId)

    if (!product) {
      continue
    }

    const unitPrice = getAuthoritativeUnitPrice(product.id)
    lines.push({
      productId: product.id,
      name: product.name,
      imageUrl: product.image_url,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    })
  }

  const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0)
  const shippingAmount = CHECKOUT_SHIPPING_AMOUNT
  const otherFees = CHECKOUT_OTHER_FEES

  return {
    lines,
    subtotal,
    shippingAmount,
    otherFees,
    total: subtotal + shippingAmount + otherFees,
    currency: PRESENTATION_CURRENCY,
  }
}
