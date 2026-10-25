import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config'

/**
 * Browser Supabase client — uses the publishable anon key.
 * Safe to use in Client Components. Uses safe fallback if env is missing on cloud hosts.
 */
export function createClient() {
  return createBrowserClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )
}
