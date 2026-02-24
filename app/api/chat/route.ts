import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendChatMessage } from '@/lib/n8n/webhook'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // 認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId, message, productInfo } = await request.json()

    if (!conversationId || !message) {
      return NextResponse.json({ error: 'conversationId and message are required' }, { status: 400 })
    }

    // ユーザーメッセージをDBに保存
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
      })

    if (insertError) {
      console.error('Failed to save user message:', insertError)
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    // n8n webhookにメッセージを送信してAI応答を取得
    let aiResponse: string
    try {
      const webhookResult = await sendChatMessage(conversationId, message, productInfo) as { reply?: string; content?: string }
      aiResponse = webhookResult?.reply ?? webhookResult?.content ?? 'ご質問を承りました。しばらくお待ちください。'
    } catch (webhookError) {
      console.error('n8n webhook error:', webhookError)
      aiResponse = 'AIサービスに接続できませんでした。しばらくしてから再試行してください。'
    }

    // AI応答をDBに保存
    const { data: savedReply, error: replyError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
      })
      .select()
      .single()

    if (replyError) {
      console.error('Failed to save AI reply:', replyError)
    }

    return NextResponse.json({
      reply: aiResponse,
      message: savedReply,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
