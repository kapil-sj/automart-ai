export type ShippingDetails = {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type CheckoutItemRequest = {
  productId: string
  quantity: number
}

export type CheckoutLine = {
  productId: string
  name: string
  imageUrl: string | null
  quantity: number
  unit_price_inr: number
  shipping_inr: number
  other_fees_inr: number
  landed_cost_inr: number
  automart_commission_inr: number
  line_total_inr: number
  // Transition aliases
  unitPrice: number
  lineTotal: number
}

export type CheckoutQuote = {
  lines: CheckoutLine[]
  subtotal_inr: number
  shipping_inr: number
  other_fees_inr: number
  total_inr: number
  automart_commission_inr: number
  currency: string
  // Transition aliases
  subtotal: number
  shippingAmount: number
  otherFees: number
  total: number
}

export type CheckoutReview = CheckoutQuote & {
  user_id: string | null
  shipping: ShippingDetails
  customerEmail: string | null
  orderCreated: boolean
  paymentCharged: boolean
}

export type CheckoutFieldErrors = Partial<Record<keyof ShippingDetails | 'items', string>>

export type CheckoutActionResult =
  | { ok: true; review: CheckoutReview }
  | { ok: false; error: string; fieldErrors?: CheckoutFieldErrors }

export type OrderPlacementResult =
  | {
      ok: true
      orderId: string
      externalOrderRef: string
      status: string
      totalInr: number
      isDuplicateReplay?: boolean
    }
  | {
      ok: false
      error: string
      fieldErrors?: CheckoutFieldErrors
    }
