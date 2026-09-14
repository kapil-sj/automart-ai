import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // Log a helpful warning during development if env vars are missing
  // eslint-disable-next-line no-console
  console.warn('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
}

/**
 * Create a Supabase client intended for browser usage.
 * Use this inside client components or hooks.
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
}

export default createBrowserSupabaseClient
