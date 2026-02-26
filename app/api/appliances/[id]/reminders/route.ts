import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function calcNextDue(lastDone: string | null | undefined, intervalMonths: number): string | null {
  if (!lastDone) return null
  const d = new Date(lastDone)
  d.setMonth(d.getMonth() + (intervalMonths || 1))
  return d.toISOString().split('T')[0]
}

// GET /api/appliances/:id/reminders
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data } = await admin
    .from('maintenance_reminders')
    .select('*')
    .eq('user_product_id', params.id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ reminders: data ?? [] })
}

// POST /api/appliances/:id/reminders
// body: { title, interval_months, last_done_date? }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { title, interval_months, last_done_date } = await req.json()

  if (!title?.trim()) return NextResponse.json({ error: 'title is required' }, { status: 400 })

  const nextDue = calcNextDue(last_done_date, interval_months ?? 1)

  const { data, error } = await admin
    .from('maintenance_reminders')
    .insert({
      user_product_id: params.id,
      title: title.trim(),
      interval_months: interval_months ?? 1,
      last_done_date: last_done_date || null,
      next_due_date: nextDue,
    })
    .select('*')
    .single()

  if (error) {
    console.error('Reminder insert error:', error)
    return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 })
  }
  return NextResponse.json({ reminder: data })
}

// PATCH /api/appliances/:id/reminders
// body: { rid, ...updates }  — updates: enabled?, last_done_date?, title?, interval_months?
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const body = await req.json()
  const { rid, ...updates } = body

  if (!rid) return NextResponse.json({ error: 'rid is required' }, { status: 400 })

  // Recalculate next_due_date if last_done_date is being updated
  if (updates.last_done_date !== undefined) {
    updates.next_due_date = calcNextDue(updates.last_done_date, updates.interval_months ?? 1)
  }

  const { data, error } = await admin
    .from('maintenance_reminders')
    .update(updates)
    .eq('id', rid)
    .eq('user_product_id', params.id)
    .select('*')
    .single()

  if (error) {
    console.error('Reminder update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ reminder: data })
}

// DELETE /api/appliances/:id/reminders?rid=xxx
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const rid = new URL(req.url).searchParams.get('rid')
  if (!rid) return NextResponse.json({ error: 'rid is required' }, { status: 400 })

  const { error } = await admin
    .from('maintenance_reminders')
    .delete()
    .eq('id', rid)
    .eq('user_product_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
