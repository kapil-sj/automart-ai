'use server'

import { createCheckoutReview } from '@/lib/checkout/review'
import { createOrder } from '@/lib/checkout/order'
import { parseCheckoutItems } from '@/lib/checkout/items'
import { parseShippingDetails } from '@/lib/checkout/shipping'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { CheckoutActionResult, OrderPlacementResult } from '@/lib/checkout/types'

export async function reviewCheckoutAction(payload: unknown): Promise<CheckoutActionResult> {
  return createCheckoutReview(payload)
}

export async function placeOrderAction(payload: unknown): Promise<OrderPlacementResult> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: 'You must be signed in to place an order.' }
  }

  const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {}
  const { shipping, fieldErrors: shippingErrors } = parseShippingDetails(record.shipping)
  const { items, fieldErrors: itemErrors } = parseCheckoutItems(record.items)
  const fieldErrors = { ...shippingErrors, ...itemErrors }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: 'Please correct the checkout details before placing your order.', fieldErrors }
  }

  const idempotencyKey = typeof record.idempotencyKey === 'string' ? record.idempotencyKey : null

  return createOrder({
    userId: user.id,
    shipping,
    items,
    idempotencyKey,
  })
}
