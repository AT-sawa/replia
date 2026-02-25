import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { imageBase64, mimeType } = await req.json()

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ modelNumber: null, purchaseDate: null, storeName: null }, { status: 400 })
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
              detail: 'low',
            },
          },
          {
            type: 'text',
            text: 'このレシートから製品情報を読み取り、以下のJSON形式のみで返してください（他のテキスト不要）:\n{"modelNumber":"型番またはnull","purchaseDate":"YYYY-MM-DD形式またはnull","storeName":"購入店舗名またはnull"}',
          },
        ],
      }],
    }),
  })

  const data = await res.json()
  const text: string = data.choices?.[0]?.message?.content ?? '{}'

  try {
    const extracted = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
    return NextResponse.json({
      modelNumber: extracted.modelNumber ?? null,
      purchaseDate: extracted.purchaseDate ?? null,
      storeName: extracted.storeName ?? null,
    })
  } catch {
    return NextResponse.json({ modelNumber: null, purchaseDate: null, storeName: null })
  }
}
