import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/upload-image — body: { path: string }
// Returns a signed upload URL so the client can upload DIRECTLY to Supabase Storage
// (bypasses Vercel 4.5MB body limit and Storage RLS)
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { path } = await req.json()
  if (!path) return NextResponse.json({ error: 'path required' }, { status: 400 })

  const admin = createAdminClient()

  // Ensure bucket exists (creates silently if already present)
  await admin.storage.createBucket('appliance-photos', { public: true }).catch(() => {})

  // Create a signed upload URL (expires in 60s)
  const { data, error } = await admin.storage
    .from('appliance-photos')
    .createSignedUploadUrl(path)

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'failed' }, { status: 500 })

  // Also return the public URL so the client doesn't need to calculate it
  const { data: pub } = admin.storage.from('appliance-photos').getPublicUrl(path)

  return NextResponse.json({ signedUrl: data.signedUrl, publicUrl: pub.publicUrl })
}
