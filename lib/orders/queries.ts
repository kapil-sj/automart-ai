import 'server-only'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { CustomerOrderDetail, CustomerOrderItem, CustomerOrderSummary, ShippingAddress } from './types'

export function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function parseShippingAddress(raw: unknown): ShippingAddress | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>

  return {
    fullName: typeof obj.fullName === 'string' ? obj.fullName : '',
    phone: typeof obj.phone === 'string' ? obj.phone : '',
    addressLine1: typeof obj.addressLine1 === 'string' ? obj.addressLine1 : '',
    addressLine2: typeof obj.addressLine2 === 'string' ? obj.addressLine2 : undefined,
    city: typeof obj.city === 'string' ? obj.city : '',
    state: typeof obj.state === 'string' ? obj.state : '',
    postalCode: typeof obj.postalCode === 'string' ? obj.postalCode : '',
    country: typeof obj.country === 'string' ? obj.country : 'India',
  }
}

export async function getUserOrders(userId: string): Promise<CustomerOrderSummary[]> {
  if (!userId) return []

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      external_order_ref,
      status,
      currency,
      total_inr,
      placed_at,
      created_at,
      order_items (
        quantity
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !data) {
    return []
  }

  return data.map((order) => {
    const rawItems = Array.isArray(order.order_items) ? order.order_items : []
    const totalItems = rawItems.reduce((acc, item) => {
      const q = typeof item.quantity === 'number' ? item.quantity : 1
      return acc + q
    }, 0)

    return {
      id: String(order.id),
      externalOrderRef: String(order.external_order_ref ?? 'AM-ORDER'),
      status: String(order.status ?? 'pending'),
      currency: String(order.currency ?? 'INR'),
      totalInr: Number(order.total_inr ?? 0),
      totalItems,
      placedAt: order.placed_at ? String(order.placed_at) : null,
      createdAt: String(order.created_at),
    }
  })
}

export async function getUserOrderById(orderId: string, userId: string): Promise<CustomerOrderDetail | null> {
  if (!isValidUuid(orderId) || !userId) return null

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      external_order_ref,
      status,
      currency,
      subtotal_inr,
      shipping_inr,
      other_fees_inr,
      total_inr,
      shipping_address,
      placed_at,
      created_at,
      order_items (
        id,
        line_number,
        product_id,
        quantity,
        unit_price_inr,
        total_price_inr,
        supplier_offer_snapshot,
        status,
        created_at,
        product:products (
          id,
          name,
          image_url
        )
      )
    `)
    .eq('id', orderId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  const rawItems = Array.isArray(data.order_items) ? data.order_items : []
  const items: CustomerOrderItem[] = rawItems
    .map((raw) => {
      const item = raw as Record<string, unknown>
      const snapshot = (item.supplier_offer_snapshot && typeof item.supplier_offer_snapshot === 'object'
        ? item.supplier_offer_snapshot
        : {}) as Record<string, unknown>

      const product = (item.product && typeof item.product === 'object'
        ? item.product
        : null) as Record<string, unknown> | null

      const productName =
        (typeof snapshot.product_name === 'string' && snapshot.product_name.trim()) ||
        (product && typeof product.name === 'string' && product.name.trim()) ||
        'AutoMart Product'

      const productImageUrl = product && typeof product.image_url === 'string' ? product.image_url : null
      const quantity = typeof item.quantity === 'number' ? item.quantity : 1
      const unitPriceInr = typeof item.unit_price_inr === 'number' ? item.unit_price_inr : Number(item.unit_price_inr ?? 0)
      const totalPriceInr = typeof item.total_price_inr === 'number'
        ? item.total_price_inr
        : unitPriceInr * quantity

      return {
        id: String(item.id),
        lineNumber: typeof item.line_number === 'number' ? item.line_number : 1,
        productId: String(item.product_id),
        productName,
        productImageUrl,
        quantity,
        unitPriceInr,
        totalPriceInr,
        status: String(item.status ?? 'pending'),
      }
    })
    .sort((a, b) => a.lineNumber - b.lineNumber)

  return {
    id: String(data.id),
    externalOrderRef: String(data.external_order_ref ?? 'AM-ORDER'),
    status: String(data.status ?? 'pending'),
    currency: String(data.currency ?? 'INR'),
    subtotalInr: Number(data.subtotal_inr ?? 0),
    shippingInr: Number(data.shipping_inr ?? 0),
    otherFeesInr: Number(data.other_fees_inr ?? 0),
    totalInr: Number(data.total_inr ?? 0),
    shippingAddress: parseShippingAddress(data.shipping_address),
    placedAt: data.placed_at ? String(data.placed_at) : null,
    createdAt: String(data.created_at),
    items,
  }
}
