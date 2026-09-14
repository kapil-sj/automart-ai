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
  unitPrice: number
  lineTotal: number
}

export type CheckoutQuote = {
  lines: CheckoutLine[]
  subtotal: number
  shippingAmount: number
  otherFees: number
  total: number
  currency: string
}

export type CheckoutReview = CheckoutQuote & {
  shipping: ShippingDetails
  customerEmail: string | null
  orderCreated: false
  paymentCharged: false
}

export type CheckoutFieldErrors = Partial<Record<keyof ShippingDetails | 'items', string>>

export type CheckoutActionResult =
  | { ok: true; review: CheckoutReview }
  | { ok: false; error: string; fieldErrors?: CheckoutFieldErrors }
