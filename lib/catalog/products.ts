import { createServerSupabaseClient } from '@/lib/supabase/server'

export type CatalogCategory = {
  id: string
  name: string
  slug: string
}

export type CatalogProduct = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  category: CatalogCategory | null
}

type SupabaseProduct = Omit<CatalogProduct, 'category'> & {
  category: CatalogCategory | CatalogCategory[] | null
}

const productFields = `
  id,
  name,
  description,
  image_url,
  category:product_categories (
    id,
    name,
    slug
  )
`

export async function getActiveProducts(): Promise<CatalogProduct[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('products')
    .select(productFields)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Unable to load products: ${error.message}`)
  }

  return (data ?? []).map(normalizeProduct)
}

export async function getActiveProductById(id: string): Promise<CatalogProduct | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('products')
    .select(productFields)
    .eq('id', id)
    .eq('status', 'active')
    .maybeSingle()

  if (error) {
    throw new Error(`Unable to load product: ${error.message}`)
  }

  return data ? normalizeProduct(data) : null
}

export async function getActiveProductsByIds(ids: string[]): Promise<CatalogProduct[]> {
  const uniqueIds = [...new Set(ids)]

  if (uniqueIds.length === 0) {
    return []
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('products')
    .select(productFields)
    .eq('status', 'active')
    .in('id', uniqueIds)

  if (error) {
    throw new Error(`Unable to load products: ${error.message}`)
  }

  return (data ?? []).map(normalizeProduct)
}

function normalizeProduct(product: SupabaseProduct): CatalogProduct {
  return {
    ...product,
    category: Array.isArray(product.category) ? product.category[0] ?? null : product.category,
  }
}