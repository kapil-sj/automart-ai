import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

if (typeof window !== 'undefined') {
  throw new Error('This module is server-only and cannot be executed in the browser.')
}

/**
 * Server-only Supabase client using SUPABASE_SERVICE_ROLE_KEY.
 *
 * CAUTION:
 * This client bypasses Row Level Security (RLS) policies.
 * It must NEVER be imported by client components or exposed via NEXT_PUBLIC_* variables.
 * Use strictly within verified server actions or server-side background handlers.
 */
export function createServiceSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured.')
  }

  if (!serviceRoleKey || serviceRoleKey.trim() === '') {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured in .env.local. Server-side operations requiring elevated permissions cannot run without it.'
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
