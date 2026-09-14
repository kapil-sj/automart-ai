'use server'

import { createCheckoutReview } from '@/lib/checkout/review'
import type { CheckoutActionResult } from '@/lib/checkout/types'

export async function reviewCheckoutAction(payload: unknown): Promise<CheckoutActionResult> {
  return createCheckoutReview(payload)
}
