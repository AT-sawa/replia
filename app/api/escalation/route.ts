import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEscalation } from '@/lib/n8n/webhook'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // 認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      conversationId,
      userProductId,
      symptom,
      triedSolutions,
      warrantyStatus,
      photoUrl,
      aiSummary,
    } = await request.json()

    if (!conversationId || !symptom) {
      return NextResponse.json({ error: 'conversationId and symptom are required' }, { status: 400 })
    }

    // チケットをDBに保存
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        conversation_id: conversationId,
        user_product_id: userProductId ?? null,
        status: 'new',
        symptom,
        tried_solutions: triedSolutions ?? null,
        warranty_status: warrantyStatus ?? null,
        photo_url: photoUrl ?? null,
      })
      .select()
      .single()

    if (ticketError || !ticket) {
      console.error('Failed to create ticket:', ticketError)
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
    }

    // conversationをエスカレーション済みに更新
    await supabase
      .from('conversations')
      .update({ is_escalated: true, ai_summary: aiSummary ?? null })
      .eq('id', conversationId)

    // ユーザー製品情報を取得
    let userProductInfo: {
      userProductId: string
      productName?: string
      modelNumber?: string
      purchaseDate?: string | null
      warrantyEnd?: string | null
    } = { userProductId: userProductId ?? '' }
    if (userProductId) {
      const { data: up } = await supabase
        .from('user_products')
        .select('id, purchase_date, warranty_end, products(product_name, model_number)')
        .eq('id', userProductId)
        .single()

      if (up) {
        const product = up.products as { product_name?: string; model_number?: string } | null
        userProductInfo = {
          userProductId: up.id,
          productName: product?.product_name,
          modelNumber: product?.model_number,
          purchaseDate: up.purchase_date,
          warrantyEnd: up.warranty_end,
        }
      }
    }

    // n8n webhookにエスカレーション通知を送信
    try {
      await sendEscalation(ticket.id, symptom, aiSummary ?? null, userProductInfo)
    } catch (webhookError) {
      console.error('n8n escalation webhook error:', webhookError)
    }

    return NextResponse.json({
      ticketId: ticket.id,
      status: ticket.status,
      message: 'エスカレーションチケットを作成しました',
    })
  } catch (error) {
    console.error('Escalation API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
