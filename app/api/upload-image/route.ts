import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/upload-image — multipart: file + path
// Uploads to appliance-photos bucket using admin client (bypasses RLS)
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const path = formData.get('path') as string | null
  if (!file || !path) return NextResponse.json({ error: 'file and path required' }, { status: 400 })

  const admin = createAdminClient()
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await admin.storage
    .from('appliance-photos')
    .upload(path, buffer, { upsert: true, contentType: file.type || 'image/jpeg' })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: pub } = admin.storage.from('appliance-photos').getPublicUrl(path)
  return NextResponse.json({ url: pub.publicUrl })
}
