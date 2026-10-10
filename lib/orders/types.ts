export type ShippingAddress = {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type CustomerOrderSummary = {
  id: string
  externalOrderRef: string
  status: string
  currency: string
  totalInr: number
  totalItems: number
  placedAt: string | null
  createdAt: string
}

export type CustomerOrderItem = {
  id: string
  lineNumber: number
  productId: string
  productName: string
  productImageUrl: string | null
  quantity: number
  unitPriceInr: number
  totalPriceInr: number
  status: string
}

export type CustomerOrderDetail = {
  id: string
  externalOrderRef: string
  status: string
  currency: string
  subtotalInr: number
  shippingInr: number
  otherFeesInr: number
  totalInr: number
  shippingAddress: ShippingAddress | null
  placedAt: string | null
  createdAt: string
  items: CustomerOrderItem[]
}
