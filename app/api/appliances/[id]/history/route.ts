import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/appliances/:id/history
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('tickets')
    .select('id, symptom, tried_solutions, status, warranty_status, photo_url, created_at')
    .eq('user_product_id', params.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ history: [] })
  return NextResponse.json({ history: data ?? [] })
}

// POST /api/appliances/:id/history
// body: { symptom, tried_solutions?, status, warranty_status? }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { symptom, tried_solutions, status, warranty_status } = body

  if (!symptom?.trim()) return NextResponse.json({ error: 'symptom is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      user_product_id: params.id,
      symptom: symptom.trim(),
      tried_solutions: tried_solutions?.trim() || null,
      status: status || '対応中',
      warranty_status: warranty_status || null,
    })
    .select('id, symptom, tried_solutions, status, warranty_status, created_at')
    .single()

  if (error) {
    console.error('History insert error:', error)
    return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 })
  }
  return NextResponse.json({ entry: data })
}
