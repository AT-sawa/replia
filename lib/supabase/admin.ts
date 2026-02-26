import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS, use only in server-side API routes.
// Always verify the user via createClient().auth.getUser() first.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
