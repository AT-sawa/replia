import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const JAPANESE_STATUSES = ['対応中', '解決済み', '修理依頼済み']

// GET /api/appliances/:id/history
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('tickets')
    .select('id, symptom, tried_solutions, status, warranty_status, photo_url, created_at')
    .eq('user_product_id', params.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ history: [] })

  // warranty_status に日本語ステータスが保存されていればそちらを優先して返す
  const history = (data ?? []).map(row => ({
    ...row,
    status: JAPANESE_STATUSES.includes(row.warranty_status ?? '')
      ? row.warranty_status
      : row.status,
  }))

  return NextResponse.json({ history })
}

// POST /api/appliances/:id/history
// body: { symptom, tried_solutions?, status, warranty_status? }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const body = await req.json()
  const { symptom, tried_solutions, status } = body

  if (!symptom?.trim()) return NextResponse.json({ error: 'symptom is required' }, { status: 400 })

  const { data, error } = await admin
    .from('tickets')
    .insert({
      user_product_id: params.id,
      symptom: symptom.trim(),
      tried_solutions: tried_solutions?.trim() || null,
      status: 'in_progress',            // DB CHECK 制約に対応した値
      warranty_status: status || '対応中', // 日本語表示用ステータスを保存
    })
    .select('id, symptom, tried_solutions, status, warranty_status, created_at')
    .single()

  if (error) {
    console.error('History insert error:', error)
    return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({
    entry: {
      ...data,
      status: data.warranty_status ?? data.status,
    },
  })
}
