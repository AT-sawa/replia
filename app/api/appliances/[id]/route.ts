import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/appliances/[id] — fetch a single appliance
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('user_appliances')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ appliance: data })
}

// PATCH /api/appliances/[id] — update an appliance
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const updates: Record<string, unknown> = {}
  if (body.appliance_type  !== undefined) updates.appliance_type  = body.appliance_type
  if (body.brand           !== undefined) updates.brand           = body.brand
  if (body.model           !== undefined) updates.model           = body.model
  if (body.purchase_date   !== undefined) updates.purchase_date   = body.purchase_date || null
  if (body.warranty_months !== undefined) updates.warranty_months = body.warranty_months
  if (body.store_name      !== undefined) updates.store_name      = body.store_name

  const { data, error } = await supabase
    .from('user_appliances')
    .update(updates)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ appliance: data })
}

// DELETE /api/appliances/[id] — delete an appliance
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('user_appliances')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
