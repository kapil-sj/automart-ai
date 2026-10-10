import 'server-only'

import type { CatalogProduct } from '@/lib/catalog/products'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { quoteCheckout } from './pricing'
import type { CheckoutItemRequest, OrderPlacementResult, ShippingDetails } from './types'

type CreateOrderParams = {
  userId: string
  shipping: ShippingDetails
  items: CheckoutItemRequest[]
  idempotencyKey?: string | null
}

const productFields = `
  id,
  name,
  description,
  price,
  currency,
  image_url,
  category:product_categories (
    id,
    name,
    slug
  )
`

export async function createOrder(params: CreateOrderParams): Promise<OrderPlacementResult> {
  const { userId, shipping, items, idempotencyKey } = params

  if (!userId) {
    return { ok: false, error: 'User must be authenticated to create an order.' }
  }

  if (!items || items.length === 0) {
    return { ok: false, error: 'Cannot create an order with an empty cart.' }
  }

  // 1. Acquire elevated server-only client early
  let serviceClient
  try {
    serviceClient = createServiceSupabaseClient()
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unable to initialize order processing. Check SUPABASE_SERVICE_ROLE_KEY configuration.',
    }
  }

  // 2. Authoritative re-fetch: Always verify products and prices directly from database
  let products: CatalogProduct[]
  try {
    const uniqueIds = [...new Set(items.map((item) => item.productId))]
    const { data, error } = await serviceClient
      .from('products')
      .select(productFields)
      .eq('status', 'active')
      .in('id', uniqueIds)

    if (error) {
      throw error
    }

    products = (data ?? []).map((raw) => {
      const record = raw as Record<string, unknown>
      const category = record.category
      return {
        id: String(record.id),
        name: String(record.name),
        description: record.description ? String(record.description) : null,
        image_url: record.image_url ? String(record.image_url) : null,
        price: typeof record.price === 'number' ? record.price : Number(record.price ?? 0),
        currency: typeof record.currency === 'string' ? record.currency : 'INR',
        category: Array.isArray(category)
          ? (category[0] as CatalogProduct['category']) ?? null
          : (category as CatalogProduct['category']) ?? null,
      }
    })
  } catch (error) {
    return {
      ok: false,
      error: `Failed to verify products: ${error instanceof Error ? error.message : 'Database error'}`,
    }
  }

  const foundIds = new Set(products.map((p) => p.id))
  const missing = items.filter((item) => !foundIds.has(item.productId))

  if (missing.length > 0) {
    return {
      ok: false,
      error: 'One or more products in your cart are no longer active or available.',
      fieldErrors: { items: 'Some items in your cart are unavailable.' },
    }
  }

  // 3. Authoritative server-side calculation of order totals and line items
  const quote = quoteCheckout(products, items)

  const lineItemsData = quote.lines.map((line, index) => ({
    line_number: index + 1,
    product_id: line.productId,
    quantity: line.quantity,
    unit_price_inr: line.unit_price_inr,
    shipping_inr: line.shipping_inr,
    other_costs_inr: line.other_fees_inr,
    landed_cost_inr: line.landed_cost_inr,
    automart_commission_inr: line.automart_commission_inr,
    supplier_offer_snapshot: {
      product_name: line.name,
      unit_price_inr: line.unit_price_inr,
    },
  }))

  const cleanIdempotencyKey = idempotencyKey?.trim() || null
  const metadata = cleanIdempotencyKey
    ? { idempotency_key: cleanIdempotencyKey, source: 'web_checkout' }
    : { source: 'web_checkout' }

  // 4. Persist order atomically via PostgreSQL RPC procedure (migration 003)
  // Strict fail-safe: order persistence occurs exclusively via the atomic transaction function.
  try {
    const { data: rpcData, error: rpcError } = await serviceClient.rpc('create_order_with_items', {
      p_user_id: userId,
      p_subtotal_inr: quote.subtotal_inr,
      p_shipping_inr: quote.shipping_inr,
      p_other_fees_inr: quote.other_fees_inr,
      p_automart_commission_inr: quote.automart_commission_inr,
      p_shipping_address: shipping,
      p_billing_address: shipping,
      p_metadata: metadata,
      p_items: lineItemsData,
    })

    if (rpcError) {
      return {
        ok: false,
        error: `Order persistence failed: ${rpcError.message}`,
      }
    }

    const result = (rpcData && typeof rpcData === 'object' ? rpcData : null) as {
      success?: boolean
      order_id?: string
      external_order_ref?: string
      status?: string
      total_inr?: number | string
      is_duplicate_replay?: boolean
      error?: string
    } | null

    if (!result || !result.success || typeof result.order_id !== 'string' || !result.order_id.trim()) {
      return {
        ok: false,
        error:
          result?.error ||
          'Order persistence failed: Database procedure returned an unsuccessful result or missing order ID.',
      }
    }

    return {
      ok: true,
      orderId: result.order_id,
      externalOrderRef: typeof result.external_order_ref === 'string' ? result.external_order_ref : '',
      status: typeof result.status === 'string' ? result.status : 'pending',
      totalInr: Number(result.total_inr ?? quote.total_inr),
      isDuplicateReplay: Boolean(result.is_duplicate_replay),
    }
  } catch (error) {
    return {
      ok: false,
      error: `Order persistence failed: ${error instanceof Error ? error.message : 'Unknown database error'}`,
    }
  }
}
