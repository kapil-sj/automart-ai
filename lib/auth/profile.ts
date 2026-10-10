import 'server-only'

import type { User } from '@supabase/supabase-js'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

export type AppProfile = {
  user_id: string
  display_name: string | null
  role: 'customer' | 'admin' | 'operations' | 'finance' | 'procurement'
  created_at: string
  updated_at: string
}

/**
 * Ensures an authenticated user has a corresponding row in public.app_profiles.
 * Safe, idempotent fallback for users whose automated profile hook may have been bypassed.
 */
export async function ensureUserProfile(user: User): Promise<AppProfile | null> {
  if (!user || !user.id) return null

  try {
    const serviceClient = createServiceSupabaseClient()

    // 1. Check if profile already exists
    const { data: existing, error: selectError } = await serviceClient
      .from('app_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing && !selectError) {
      return existing as AppProfile
    }

    // 2. Derive display name from metadata or email
    const metadata = user.user_metadata || {}
    const displayName =
      (typeof metadata.full_name === 'string' && metadata.full_name.trim()) ||
      (typeof metadata.name === 'string' && metadata.name.trim()) ||
      (user.email ? user.email.split('@')[0] : 'Customer')

    // 3. Upsert profile safely
    const { data: created, error: insertError } = await serviceClient
      .from('app_profiles')
      .upsert(
        {
          user_id: user.id,
          display_name: displayName,
          role: 'customer',
        },
        { onConflict: 'user_id' }
      )
      .select('*')
      .maybeSingle()

    if (insertError) {
      console.warn('ensureUserProfile insert failed:', insertError.message)
      return null
    }

    return created as AppProfile
  } catch (error) {
    console.warn('ensureUserProfile unexpected error:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}
