export type CartItem = {
  productId: string
  name: string
  imageUrl: string | null
  /** Customer-facing presentation price only. Not authoritative for checkout. */
  unitPrice: number
  quantity: number
}

export type CartItemInput = {
  productId: string
  name: string
  imageUrl: string | null
  unitPrice: number
  quantity: number
}
