const N8N_WEBHOOK_BASE_URL = process.env.N8N_WEBHOOK_BASE_URL ?? ''

async function postWebhook<T = unknown>(
  path: string,
  payload: Record<string, unknown>
): Promise<T> {
  const url = `${N8N_WEBHOOK_BASE_URL}/${path}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`n8n webhook error: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export interface ProductInfo {
  productId?: string
  productName?: string
  modelNumber?: string
  manufacturer?: string
}

export interface UserProductInfo {
  userProductId: string
  productName?: string
  modelNumber?: string
  purchaseDate?: string | null
  warrantyEnd?: string | null
}

/**
 * AIチャットメッセージをn8nに送信
 */
export async function sendChatMessage(
  conversationId: string,
  message: string,
  productInfo?: ProductInfo
) {
  return postWebhook('ai-chat', {
    conversationId,
    message,
    productInfo: productInfo ?? null,
    timestamp: new Date().toISOString(),
  })
}

/**
 * エスカレーション情報をn8nに送信
 */
export async function sendEscalation(
  ticketId: string,
  symptom: string,
  aiSummary: string | null,
  userProduct: UserProductInfo
) {
  return postWebhook('escalation', {
    ticketId,
    symptom,
    aiSummary,
    userProduct,
    timestamp: new Date().toISOString(),
  })
}
