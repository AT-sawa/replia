'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const suggestChips = [
  '洗濯機が動かない',
  'エアコンが冷えない',
  'レンジのエラー',
  'テレビが映らない',
  '冷蔵庫の異音',
]

const recentConsultations = [
  { emoji: '❄️', name: 'エアコン AN40YRS', date: '昨日' },
  { emoji: '🧺', name: '洗濯機 NA-VX900BL', date: '3日前' },
  { emoji: '📺', name: 'テレビ TH-65LX950', date: '1週間前' },
]

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/chat?query=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div style={{ padding: '20px 16px 24px', background: '#FAFBFC', minHeight: '100%' }}>
      {/* Welcome Card */}
      <div
        className="welcome-card"
        style={{
          background: '#0F1419',
          borderRadius: 16,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <p
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 4,
          }}
        >
          こんにちは 👋
        </p>
        <p
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.3,
            marginBottom: 16,
          }}
        >
          家電のトラブル、<br />AIが即解決します
        </p>

        {/* Suggest Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {suggestChips.map((chip) => (
            <Link
              key={chip}
              href={`/chat?query=${encodeURIComponent(chip)}`}
              style={{
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 100,
                padding: '6px 12px',
                fontSize: 12,
                color: 'rgba(255,255,255,0.85)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {chip}
            </Link>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
        <div
          style={{
            background: '#F4F6F8',
            borderRadius: 100,
            height: 50,
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px 0 16px',
            gap: 10,
          }}
        >
          {/* Search Icon */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="5.5" stroke="#98A2AE" strokeWidth="1.5" />
            <path d="M13 13L16 16" stroke="#98A2AE" strokeWidth="1.5" strokeLinecap="round" />
          </svg>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="家電のトラブルを入力..."
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: 14,
              color: '#0F1419',
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
            }}
          />

          {/* QR Button */}
          <button
            type="button"
            style={{
              width: 32,
              height: 32,
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="white" strokeWidth="1.5" />
              <rect x="9.5" y="1" width="5.5" height="5.5" rx="1" stroke="white" strokeWidth="1.5" />
              <rect x="1" y="9.5" width="5.5" height="5.5" rx="1" stroke="white" strokeWidth="1.5" />
              <rect x="2.5" y="2.5" width="2.5" height="2.5" fill="white" />
              <rect x="11" y="2.5" width="2.5" height="2.5" fill="white" />
              <rect x="2.5" y="11" width="2.5" height="2.5" fill="white" />
              <path d="M9.5 9.5H11V11H9.5V9.5ZM12.5 9.5H14V11H12.5V9.5ZM11 11H12.5V12.5H11V11ZM9.5 12.5H11V14H9.5V12.5ZM12.5 12.5H14V14H12.5V12.5Z" fill="white" />
            </svg>
          </button>
        </div>
      </form>

      {/* Recent Consultations */}
      <div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#0F1419',
            marginBottom: 10,
          }}
        >
          最近の相談
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recentConsultations.map((item, i) => (
            <Link
              key={i}
              href={`/chat?query=${encodeURIComponent(item.name)}`}
              style={{
                background: '#FAFBFC',
                border: '1px solid #E8ECF0',
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textDecoration: 'none',
              }}
            >
              <span style={{ fontSize: 20 }}>{item.emoji}</span>
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#0F1419',
                }}
              >
                {item.name}
              </span>
              <span style={{ fontSize: 11, color: '#98A2AE' }}>{item.date}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
