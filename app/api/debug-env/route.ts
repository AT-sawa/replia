import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    has_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    has_supabase_url:     !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_anon_key:         !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    key_prefix:           process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) ?? 'MISSING',
  })
}
