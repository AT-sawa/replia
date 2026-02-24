'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Badge from '@/components/ui/Badge'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  source?: string
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'こんにちは！replia AIサポートです。\n家電のトラブルについて、何でもご相談ください。製品名や症状をお聞かせいただけますか？',
  },
  {
    id: '2',
    role: 'user',
    content: 'エアコンが全然冷えないんですが...',
  },
  {
    id: '3',
    role: 'assistant',
    content: 'ご不便をおかけして申し訳ございません。エアコンが冷えない場合、いくつかの原因が考えられます。\n\nまず、以下の製品に関するご相談でしょうか？',
    source: 'Panasonic 製品マニュアル',
  },
]

function ProductConfirmCard({ onConfirm, onDeny }: { onConfirm: () => void; onDeny: () => void }) {
  return (
    <div
      style={{
        background: 'white',
        border: '1.5px solid #E8ECF0',
        borderRadius: 12,
        padding: 14,
        maxWidth: '82%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            background: '#F4F6F8',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
          }}
        >
          ❄️
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0F1419', margin: 0 }}>
            エアコン CS-X402D2
          </p>
          <p style={{ fontSize: 11, color: '#98A2AE', margin: 0 }}>Panasonic</p>
        </div>
        <Badge status="active" />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onConfirm}
          style={{
            flex: 1,
            background: '#0F1419',
            color: 'white',
            borderRadius: 100,
            height: 36,
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          はい
        </button>
        <button
          onClick={onDeny}
          style={{
            flex: 1,
            background: 'white',
            border: '1.5px solid #E8ECF0',
            borderRadius: 100,
            height: 36,
            fontSize: 13,
            fontWeight: 600,
            color: '#5B6570',
            cursor: 'pointer',
          }}
        >
          違う製品
        </button>
      </div>
    </div>
  )
}

function ChatContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('query')
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState(initialQuery || '')
  const [showConfirmCard, setShowConfirmCard] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setShowConfirmCard(false)

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'ご確認ありがとうございます。エアコンが冷えない主な原因をご説明します。\n\n① フィルターの汚れ：2週間に1度の清掃をお勧めします\n② 設定温度の確認：外気温より十分低く設定されているか確認してください\n③ 室外機の周囲：遮蔽物がないか確認してください\n\n上記を確認しても改善しない場合は、修理が必要な可能性があります。',
        source: 'Panasonic 取扱説明書 p.42',
      }
      setMessages((prev) => [...prev, aiMsg])
    }, 1200)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Product Bar */}
      <div
        style={{
          background: 'white',
          borderBottom: '1px solid #E8ECF0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 18 }}>❄️</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0F1419', margin: 0 }}>
            エアコン CS-X402D2
          </p>
          <p style={{ fontSize: 11, color: '#98A2AE', margin: 0 }}>Panasonic · 2022年購入</p>
        </div>
        <Badge status="active" />
      </div>

      {/* Messages */}
      <div
        className="chat-scroll"
        style={{
          flex: 1,
          background: '#FAFBFC',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflowY: 'auto',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                background: msg.role === 'user' ? '#0F1419' : 'white',
                color: msg.role === 'user' ? 'white' : '#0F1419',
                borderRadius:
                  msg.role === 'user'
                    ? '14px 14px 4px 14px'
                    : '4px 14px 14px 14px',
                border: msg.role === 'assistant' ? '1px solid #E8ECF0' : 'none',
                padding: '11px 14px',
                fontSize: 13,
                lineHeight: 1.7,
                maxWidth: msg.role === 'user' ? '78%' : '82%',
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.content}
            </div>
            {msg.source && (
              <div
                style={{
                  background: '#EFF4FF',
                  border: '1px solid #D6E4FF',
                  borderRadius: 100,
                  padding: '3px 8px',
                  fontSize: 10,
                  color: '#2563EB',
                  marginTop: 4,
                }}
              >
                📄 {msg.source}
              </div>
            )}
          </div>
        ))}

        {/* Product Confirm Card */}
        {showConfirmCard && (
          <ProductConfirmCard
            onConfirm={() => {
              setShowConfirmCard(false)
              const msg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content:
                  '確認ありがとうございます。エアコンが冷えない原因を調べます。\n少々お待ちください...',
              }
              setMessages((prev) => [...prev, msg])
            }}
            onDeny={() => setShowConfirmCard(false)}
          />
        )}

        {/* Quick Action Buttons */}
        {!showConfirmCard && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['フィルター清掃方法', 'エラーコードを確認'].map((label) => (
              <button
                key={label}
                onClick={() => {
                  setInput(label)
                }}
                style={{
                  border: '1.5px solid #E8ECF0',
                  borderRadius: 100,
                  height: 36,
                  padding: '0 14px',
                  fontSize: 12,
                  color: '#0F1419',
                  background: 'white',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div
        style={{
          borderTop: '1px solid #E8ECF0',
          padding: '10px 14px',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="メッセージを入力..."
          style={{
            flex: 1,
            height: 44,
            background: '#F4F6F8',
            border: 'none',
            borderRadius: 22,
            padding: '0 16px',
            fontSize: 14,
            color: '#0F1419',
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            width: 42,
            height: 42,
            background: '#0F1419',
            borderRadius: '50%',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M16 9L2 2L5.5 9L2 16L16 9Z"
              fill="white"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 24, textAlign: 'center', color: '#98A2AE' }}>読み込み中...</div>
      }
    >
      <ChatContent />
    </Suspense>
  )
}
