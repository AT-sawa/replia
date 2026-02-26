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

// ── YouTube video card ────────────────────────────────────────────────────────
function VideoCard({ query }: { query: string }) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  return (
    <a
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', display: 'block', marginTop: 8 }}
    >
      <div style={{
        background: '#0F0F0F',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #E8ECF0',
        maxWidth: 280,
      }}>
        {/* Thumbnail area */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* YouTube-style play button */}
          <div style={{
            width: 48, height: 34,
            background: '#FF0000',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polygon points="9.75 7 18 12 9.75 17 9.75 7" fill="white" />
            </svg>
          </div>
          {/* YouTube logo top-left */}
          <div style={{ position: 'absolute', top: 8, left: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="16" height="12" viewBox="0 0 24 17" fill="none">
              <path d="M23.5 2.5a3 3 0 00-2.1-2.1C19.5 0 12 0 12 0S4.5 0 2.6.4A3 3 0 00.5 2.5 31 31 0 000 8.5a31 31 0 00.5 6 3 3 0 002.1 2.1C4.5 17 12 17 12 17s7.5 0 9.4-.4a3 3 0 002.1-2.1 31 31 0 00.5-6 31 31 0 00-.5-6z" fill="#FF0000"/>
              <polygon points="9.75 12.02 15.5 8.5 9.75 4.98" fill="white"/>
            </svg>
            <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>YouTube</span>
          </div>
          {/* "tap to search" hint */}
          <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
            <span style={{ background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: 9, padding: '2px 6px', borderRadius: 4 }}>
              タップして検索
            </span>
          </div>
        </div>
        {/* Query label */}
        <div style={{ padding: '8px 10px', background: '#1a1a1a' }}>
          <p style={{ margin: 0, fontSize: 11, color: '#aaa', lineHeight: 1.4 }}>
            🔍 {query}
          </p>
        </div>
      </div>
    </a>
  )
}

// ── Content renderer (text + video cards) ─────────────────────────────────────
function renderContent(text: string, isUser: boolean) {
  // Split on [VIDEO: ...] markers
  const videoPattern = /\[VIDEO:\s*([^\]]+)\]/g
  const parts = text.split(videoPattern)
  // parts alternates: text, query, text, query, ...
  const result: React.ReactNode[] = []

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // Text part — render with URL linking
      const textPart = parts[i]
      const urlPattern = /https?:\/\/[^\s]+/g
      let lastIdx = 0
      let m: RegExpExecArray | null
      while ((m = urlPattern.exec(textPart)) !== null) {
        if (m.index > lastIdx) result.push(<span key={`t${i}-${lastIdx}`}>{textPart.slice(lastIdx, m.index)}</span>)
        const url = m[0]
        result.push(
          <a key={`u${i}-${m.index}`} href={url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, margin: '4px 0 2px', padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none', background: isUser ? 'rgba(255,255,255,0.18)' : '#EFF4FF', border: `1px solid ${isUser ? 'rgba(255,255,255,0.35)' : '#D6E4FF'}`, color: isUser ? 'white' : '#2563EB' }}
          >
            {url.includes('youtube.com') ? 'YouTubeで動画を見る' : url}
          </a>
        )
        lastIdx = m.index + url.length
      }
      if (lastIdx < textPart.length) result.push(<span key={`t${i}-end`}>{textPart.slice(lastIdx)}</span>)
    } else {
      // Video query part
      result.push(<VideoCard key={`v${i}`} query={parts[i].trim()} />)
    }
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
