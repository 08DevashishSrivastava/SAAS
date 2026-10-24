import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Administrative Supabase client — uses the service-role key.
 *
 * SECURITY RULES:
 * - Only import this module in server-only code.
 * - Never use this client to bypass RLS for normal user operations.
 * - Only use for: webhook processing, system operations, admin-only tasks.
 * - Audit all usage carefully.
 */

if (typeof window !== 'undefined') {
  throw new Error(
    'Admin Supabase client must not be imported in browser/client code. ' +
    'This module is server-only.'
  )
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY'
  )
}

/**
 * Admin client — bypasses RLS. Use with extreme care.
 * Prefer the server client for user-owned data.
 */
export const adminSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
