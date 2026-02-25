import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/household  →  current user's household info
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ household: null })

  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) return NextResponse.json({ household: null })

  const { data: household } = await supabase
    .from('households')
    .select('id, code')
    .eq('id', membership.household_id)
    .single()

  const { data: members } = await supabase
    .from('household_members')
    .select('display_name, role, joined_at')
    .eq('household_id', membership.household_id)

  return NextResponse.json({ household: { ...household, members: members ?? [] } })
}

// POST { action: 'create' }          →  create a new household
// POST { action: 'join', code: '…' } →  join by invite code
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action, code } = body
  const displayName =
    user.user_metadata?.full_name || user.email?.split('@')[0] || 'メンバー'

  // ── CREATE ──────────────────────────────────────────
  if (action === 'create') {
    // Generate a random 6-char alphanumeric code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let newCode = ''
    for (let i = 0; i < 6; i++) {
      newCode += chars[Math.floor(Math.random() * chars.length)]
    }

    const { data: h, error: hErr } = await supabase
      .from('households')
      .insert({ code: newCode, created_by: user.id })
      .select('id, code')
      .single()

    if (hErr || !h) {
      return NextResponse.json({ error: 'グループの作成に失敗しました' }, { status: 500 })
    }

    await supabase.from('household_members').insert({
      household_id: h.id,
      user_id: user.id,
      display_name: displayName,
      role: 'owner',
    })

    return NextResponse.json({
      household: { ...h, members: [{ display_name: displayName, role: 'owner', joined_at: new Date().toISOString() }] },
    })
  }

  // ── JOIN ─────────────────────────────────────────────
  if (action === 'join') {
    if (!code) return NextResponse.json({ error: 'コードを入力してください' }, { status: 400 })

    const { data: h } = await supabase
      .from('households')
      .select('id, code')
      .eq('code', (code as string).toUpperCase().trim())
      .maybeSingle()

    if (!h) {
      return NextResponse.json({ error: 'そのコードは見つかりません' }, { status: 404 })
    }

    const { error: mErr } = await supabase.from('household_members').insert({
      household_id: h.id,
      user_id: user.id,
      display_name: displayName,
      role: 'member',
    })

    if (mErr) {
      return NextResponse.json({ error: 'すでにグループに参加済みです' }, { status: 400 })
    }

    // Re-fetch with full member list
    const { data: members } = await supabase
      .from('household_members')
      .select('display_name, role, joined_at')
      .eq('household_id', h.id)

    return NextResponse.json({ household: { ...h, members: members ?? [] } })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
