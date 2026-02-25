import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/appliances — list the current user's appliances
export async function GET() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('user_appliances')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ appliances: data ?? [] })
}

// POST /api/appliances — create a new appliance
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const { data, error } = await supabase
    .from('user_appliances')
    .insert({
      user_id:         user.id,
      appliance_type:  body.appliance_type  || 'その他',
      brand:           body.brand           || '',
      model:           body.model           || '',
      purchase_date:   body.purchase_date   || null,
      warranty_months: body.warranty_months ?? 12,
      store_name:      body.store_name      || '',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ appliance: data })
}
