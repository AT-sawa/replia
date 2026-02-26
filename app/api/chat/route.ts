import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ProductInfo {
  name?: string
  brand?: string
  model?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages, productInfo }: { messages: ChatMessage[]; productInfo?: ProductInfo } =
      await request.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'messages is required' }, { status: 400 })
    }

    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json({ reply: 'AIサービスの設定が完了していません。' })
    }

    const productContext = productInfo?.name
      ? `【対象製品】${productInfo.brand ?? ''} ${productInfo.name} ${productInfo.model ?? ''}`
      : ''

    const systemPrompt = `あなたは「replia」というAI家電サポートアシスタントです。日本の家電製品のトラブル解決を専門としています。
${productContext}

以下のガイドラインで回答してください：
- 日本語で丁寧かつ簡潔に回答する
- ユーザーが自分で試せる具体的な手順を①②③のように番号で説明する
- エラーコード（例：E1、F3、H8、U4など英字+数字の組み合わせ）が入力されたら、まず「このエラーコードは〇〇を意味します」と即座に原因を説明し、次に対処手順を番号で答える
- 手順の説明が複数ステップになる場合や、操作がわかりにくい場合は、回答の最後に必ず「[VIDEO: 検索クエリ]」という形式で動画を案内する。検索クエリには製品名・メーカー名・操作名・「やり方」などを含める。例：[VIDEO: パナソニック 洗濯機 フィルター掃除 やり方]
- 解決しない場合は「🔧 修理依頼」ボタンを使うよう案内する
- 500文字以内で回答する
- 同じ答えを繰り返さず、会話の流れに合わせて回答を変える
- **や##などのMarkdown記号は絶対に使わない。プレーンテキストのみ。
- 手順の番号（①②③など）のあとに補足説明が続く場合は、番号と行動の一文だけを書いてから改行し、補足説明を次の行に書く。例：「① 電源を確認する。\nプラグがしっかり差さっているか確認してください。」`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: ChatMessage) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('OpenAI API error:', response.status, errBody)
      return NextResponse.json({
        reply: 'AIサービスに一時的な問題が発生しました。しばらくしてから再試行してください。',
      })
    }

    const data = await response.json()
    const reply: string = data.choices?.[0]?.message?.content ?? 'ご質問を承りました。'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      reply: 'エラーが発生しました。もう一度お試しください。',
    })
  }
}
