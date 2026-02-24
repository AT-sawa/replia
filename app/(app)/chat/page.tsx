'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ApplianceIcon } from '@/components/ui/ApplianceIcon'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  source?: string
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'こんにちは！replia AIサポートです。\n家電のトラブルについて、何でもご相談ください。製品名や症状をお聞かせいただけますか？',
}

// ── per-product key wrapper ──────────────────────────────
function ChatWithKey() {
  const searchParams = useSearchParams()
  const productId = searchParams.get('productId')
  const query = searchParams.get('query')
  const chatKey = productId ?? query ?? 'general'
  return <ChatContent key={chatKey} />
}

// ── main chat UI ─────────────────────────────────────────
function ChatContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const query       = searchParams.get('query')
  const productName = searchParams.get('product')
  const brandName   = searchParams.get('brand')
  const modelName   = searchParams.get('model')

  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput]       = useState('')
  const [autoSent, setAutoSent] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // auto-send query param once on mount
  useEffect(() => {
    if (!query || autoSent) return
    setAutoSent(true)
    const timer1 = setTimeout(() => {
      const userMsg: Message = { id: 'auto-user', role: 'user', content: query }
      setMessages(prev => [...prev, userMsg])
      const timer2 = setTimeout(() => {
        const aiMsg: Message = {
          id: 'auto-ai',
          role: 'assistant',
          content: `「${query}」について承りました。\n症状やエラーコードなど、もう少し詳しく教えていただけますか？`,
        }
        setMessages(prev => [...prev, aiMsg])
      }, 1000)
      return () => clearTimeout(timer2)
    }, 400)
    return () => clearTimeout(timer1)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'ご確認ありがとうございます。いくつかの点を確認してみてください。\n\n① フィルター・通気口の清掃を行ってください\n② 電源を一度切り、数分後に再起動してください\n③ 改善しない場合はエラーコードをお知らせください',
        source: productName ? `${brandName ?? ''} 取扱説明書` : undefined,
      }
      setMessages(prev => [...prev, aiMsg])
    }, 1200)
  }

  // header display
  const headerTitle    = productName ? (modelName ? `${productName} ${modelName}` : productName) : 'AIサポート'
  const headerSubtitle = productName ? (brandName ?? '') : 'replia'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Product / context bar ── */}
      <div style={{
        background: 'white', borderBottom: '1px solid #E8ECF0',
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        <div style={{
          width: 34, height: 34,
          background: productName ? '#F4F6F8' : '#0F1419',
          borderRadius: productName ? 8 : '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: productName ? '#0F1419' : 'white', flexShrink: 0,
        }}>
          {productName ? (
            <ApplianceIcon type={productName} size={18} />
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 1.5H3C2.175 1.5 1.5 2.175 1.5 3V13.5L4 11H13C13.825 11 14.5 10.325 14.5 9.5V3C14.5 2.175 13.825 1.5 13 1.5Z" fill="white" />
            </svg>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0F1419', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {headerTitle}
          </p>
          <p style={{ fontSize: 11, color: '#98A2AE', margin: 0 }}>{headerSubtitle}</p>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="chat-scroll" style={{
        flex: 1, background: '#FAFBFC', padding: 16,
        display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto',
      }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              background: msg.role === 'user' ? '#0F1419' : 'white',
              color: msg.role === 'user' ? 'white' : '#0F1419',
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
              border: msg.role === 'assistant' ? '1px solid #E8ECF0' : 'none',
              padding: '11px 14px', fontSize: 13, lineHeight: 1.7,
              maxWidth: msg.role === 'user' ? '78%' : '82%',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
            {msg.source && (
              <div style={{
                background: '#EFF4FF', border: '1px solid #D6E4FF',
                borderRadius: 100, padding: '3px 8px',
                fontSize: 10, color: '#2563EB', marginTop: 4,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M6.5 1H2.5C2.2 1 2 1.2 2 1.5V8.5C2 8.8 2.2 9 2.5 9H7.5C7.8 9 8 8.8 8 8.5V2.5L6.5 1Z" stroke="#2563EB" strokeWidth="0.8" strokeLinejoin="round" />
                  <path d="M6.5 1V2.5H8" stroke="#2563EB" strokeWidth="0.8" />
                  <path d="M3.5 5.5H6.5M3.5 7H5" stroke="#2563EB" strokeWidth="0.8" strokeLinecap="round" />
                </svg>
                {msg.source}
              </div>
            )}
          </div>
        ))}

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
          {['症状を詳しく教える', 'エラーコードを確認'].map(label => (
            <button
              key={label}
              onClick={() => setInput(label)}
              style={{
                border: '1.5px solid #E8ECF0', borderRadius: 100, height: 36,
                padding: '0 14px', fontSize: 12, color: '#0F1419',
                background: 'white', cursor: 'pointer', fontWeight: 500,
              }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => router.push('/escalation')}
            style={{
              border: '1.5px solid #FFCDD2', borderRadius: 100, height: 36,
              padding: '0 14px', fontSize: 12, color: '#DC2626',
              background: '#FFEBEE', cursor: 'pointer', fontWeight: 500,
            }}
          >
            修理依頼
          </button>
        </div>

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div style={{
        borderTop: '1px solid #E8ECF0', padding: '10px 14px',
        background: 'white', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="メッセージを入力..."
          style={{
            flex: 1, height: 44, background: '#F4F6F8', border: 'none',
            borderRadius: 22, padding: '0 16px', fontSize: 14, color: '#0F1419',
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            width: 42, height: 42, background: '#0F1419', borderRadius: '50%',
            border: 'none', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M16 9L2 2L5.5 9L2 16L16 9Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, textAlign: 'center', color: '#98A2AE' }}>読み込み中...</div>}>
      <ChatWithKey />
    </Suspense>
  )
}
