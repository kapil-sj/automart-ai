import { getActiveProductsByIds } from '@/lib/catalog/products'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { parseCheckoutItems } from './items'
import { quoteCheckout } from './pricing'
import { parseShippingDetails } from './shipping'
import type { CheckoutActionResult } from './types'

export async function createCheckoutReview(payload: unknown): Promise<CheckoutActionResult> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: 'Please sign in to continue checkout.' }
  }

  const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {}
  const { shipping, fieldErrors: shippingErrors } = parseShippingDetails(record.shipping)
  const { items, fieldErrors: itemErrors } = parseCheckoutItems(record.items)
  const fieldErrors = { ...shippingErrors, ...itemErrors }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: 'Please correct the highlighted checkout details.', fieldErrors }
  }

  let products
  try {
    products = await getActiveProductsByIds(items.map((item) => item.productId))
  } catch {
    return { ok: false, error: 'We could not verify your products. Please try again.' }
  }

  const foundIds = new Set(products.map((product) => product.id))
  const missing = items.filter((item) => !foundIds.has(item.productId))

  if (missing.length > 0) {
    return {
      ok: false,
      error: 'One or more products are no longer available. Remove unavailable items and try again.',
      fieldErrors: { items: 'Some products in this checkout are inactive or do not exist.' },
    }
  }

  const quote = quoteCheckout(products, items)

  return {
    ok: true,
    review: {
      ...quote,
      shipping,
      customerEmail: user.email ?? null,
      orderCreated: false,
      paymentCharged: false,
    },
  }
}
