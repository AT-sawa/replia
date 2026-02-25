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

// ── per-product key wrapper ──────────────────────────────────────────────────
function ChatWithKey() {
  const searchParams = useSearchParams()
  const productId = searchParams.get('productId')
  const query = searchParams.get('query')
  const chatKey = productId ?? query ?? 'general'
  return <ChatContent key={chatKey} />
}

// ── URL → clickable link renderer ────────────────────────────────────────────
function renderContent(text: string, isUser: boolean) {
  const urlPattern = /https?:\/\/[^\s]+/g
  const result: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = urlPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(<span key={lastIndex}>{text.slice(lastIndex, match.index)}</span>)
    }
    const url = match[0]
    const isYoutube = url.includes('youtube.com')
    result.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          margin: '4px 0 2px',
          padding: '5px 10px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          textDecoration: 'none',
          background: isUser ? 'rgba(255,255,255,0.18)' : '#EFF4FF',
          border: `1px solid ${isUser ? 'rgba(255,255,255,0.35)' : '#D6E4FF'}`,
          color: isUser ? 'white' : '#2563EB',
        }}
      >
        {isYoutube && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" fill={isUser ? 'white' : '#2563EB'} />
            <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill={isUser ? '#2563EB' : 'white'} />
          </svg>
        )}
        {isYoutube ? 'YouTubeで動画を見る' : url}
      </a>
    )
    lastIndex = match.index + url.length
  }
  if (lastIndex < text.length) {
    result.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>)
  }
  return result
}

// ── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      <div style={{
        background: 'white', border: '1px solid #E8ECF0',
        borderRadius: '4px 14px 14px 14px',
        padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%', background: '#C5CAD0',
            animation: 'bounce 1.2s infinite',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  )
}

// ── main chat UI ─────────────────────────────────────────────────────────────
function ChatContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const query       = searchParams.get('query')
  const productName = searchParams.get('product')
  const brandName   = searchParams.get('brand')
  const modelName   = searchParams.get('model')

  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [autoSent, setAutoSent] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const productInfo = productName
    ? { name: productName, brand: brandName ?? '', model: modelName ?? '' }
    : undefined

  const sendMessage = async (text: string, currentMessages: Message[]) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() }
    const updatedMessages = [...currentMessages, userMsg]
    setMessages(updatedMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages
            .filter(m => m.id !== 'welcome')
            .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
          productInfo,
        }),
      })
      const data = await res.json()
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply ?? 'ご質問を承りました。',
        source: productName ? `${brandName ?? ''} 取扱説明書` : undefined,
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'エラーが発生しました。もう一度お試しください。',
      }])
    } finally {
      setLoading(false)
    }
  }

  // auto-send query param on mount
  useEffect(() => {
    if (!query || autoSent) return
    setAutoSent(true)
    const timer = setTimeout(() => {
      sendMessage(query, [WELCOME])
    }, 400)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSend = () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    sendMessage(text, messages)
  }

  const headerTitle    = productName ? (modelName ? `${productName} ${modelName}` : productName) : 'AIサポート'
  const headerSubtitle = productName ? (brandName ?? '') : 'replia'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* keyframe for bounce */}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>

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
              {renderContent(msg.content, msg.role === 'user')}
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

        {/* typing indicator */}
        {loading && <TypingIndicator />}

        {/* Quick actions */}
        {!loading && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            {['症状を詳しく教える', 'エラーコードを確認'].map(label => (
              <button
                key={label}
                onClick={() => {
                  setInput(label)
                }}
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
        )}

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
          placeholder={loading ? 'AIが回答中...' : 'メッセージを入力...'}
          disabled={loading}
          style={{
            flex: 1, height: 44, background: '#F4F6F8', border: 'none',
            borderRadius: 22, padding: '0 16px', fontSize: 14, color: '#0F1419',
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
            opacity: loading ? 0.6 : 1,
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            width: 42, height: 42,
            background: loading || !input.trim() ? '#C5CAD0' : '#0F1419',
            borderRadius: '50%', border: 'none',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: loading ? 'not-allowed' : 'pointer',
            flexShrink: 0, transition: 'background 0.15s',
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
