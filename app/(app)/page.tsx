'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ApplianceIcon } from '@/components/ui/ApplianceIcon'

const suggestChips = [
  '洗濯機が動かない',
  'エアコンが冷えない',
  'レンジのエラー',
  'テレビが映らない',
  '冷蔵庫の異音',
]

interface ApplianceItem {
  id: string
  appliance_type: string
  brand: string
  model: string
  image_url: string | null
}

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [appliances, setAppliances] = useState<ApplianceItem[]>([])
  const [appsLoading, setAppsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/appliances')
      .then(r => r.json())
      .then(d => setAppliances((d.appliances ?? []).slice(0, 4)))
      .catch(() => {})
      .finally(() => setAppsLoading(false))
  }, [])

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
        style={{ background: '#0F1419', borderRadius: 16, padding: 24, marginBottom: 20 }}
      >
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
          こんにちは 👋
        </p>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: 16 }}>
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
                borderRadius: 100, padding: '6px 12px',
                fontSize: 12, color: 'rgba(255,255,255,0.85)',
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}
            >
              {chip}
            </Link>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: 24, width: '100%' }}>
        <div style={{
          background: '#F4F6F8', borderRadius: 100, height: 50,
          display: 'flex', alignItems: 'center', padding: '0 10px 0 16px',
          gap: 10, overflow: 'hidden', width: '100%',
        }}>
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
              flex: 1, minWidth: 0, border: 'none', outline: 'none',
              background: 'transparent', fontSize: 14, color: '#0F1419',
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
            }}
          />
          <button
            type="submit"
            disabled={!searchQuery.trim()}
            style={{
              width: 34, height: 34,
              background: searchQuery.trim() ? '#0F1419' : '#C5CAD0',
              borderRadius: '50%', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: searchQuery.trim() ? 'pointer' : 'default',
              flexShrink: 0, transition: 'background 0.15s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M16 9L2 2L5.5 9L2 16L16 9Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </form>

      {/* My Appliances Quick Chat */}
      {(appsLoading || appliances.length > 0) && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0F1419', margin: 0 }}>
              マイ家電から相談
            </p>
            <Link href="/my-appliances" style={{ fontSize: 12, color: '#2563EB', textDecoration: 'none' }}>
              すべて見る
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {appsLoading ? (
              // Skeleton
              [1, 2, 3].map(i => (
                <div key={i} style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="skeleton" style={{ width: '60%', height: 13 }} />
                    <div className="skeleton" style={{ width: '40%', height: 11 }} />
                  </div>
                  <div className="skeleton" style={{ width: 60, height: 28, borderRadius: 100 }} />
                </div>
              ))
            ) : (
              appliances.map(item => {
                const chatHref = `/chat?product=${encodeURIComponent(item.appliance_type)}&brand=${encodeURIComponent(item.brand)}&model=${encodeURIComponent(item.model)}`
                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'white', border: '1px solid #E8ECF0',
                      borderRadius: 12, padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      boxShadow: '0 1px 4px rgba(15,20,25,0.06)',
                    }}
                  >
                    <div style={{ width: 40, height: 40, background: '#F4F6F8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.appliance_type}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      ) : (
                        <ApplianceIcon type={item.appliance_type} size={22} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0F1419', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.appliance_type}
                      </p>
                      {(item.brand || item.model) && (
                        <p style={{ fontSize: 11, color: '#98A2AE', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {[item.brand, item.model].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <Link
                      href={chatHref}
                      style={{
                        flexShrink: 0, height: 30, padding: '0 12px',
                        background: '#0F1419', color: 'white',
                        borderRadius: 100, fontSize: 12, fontWeight: 600,
                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                        <path d="M15 1.5H3C2.175 1.5 1.5 2.175 1.5 3V16.5L4.5 13.5H15C15.825 13.5 16.5 12.825 16.5 12V3C16.5 2.175 15.825 1.5 15 1.5Z" fill="white" />
                      </svg>
                      相談
                    </Link>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* 家電未登録の場合のCTA */}
      {!appsLoading && appliances.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{ fontSize: 13, color: '#98A2AE', margin: '0 0 12px' }}>
            家電を登録すると、ここからすぐに相談できます
          </p>
          <Link
            href="/register"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#0F1419', color: 'white',
              borderRadius: 100, height: 42, padding: '0 20px',
              fontSize: 13, fontWeight: 700, textDecoration: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2V14M2 8H14" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            家電を登録する
          </Link>
        </div>
      )}

    </div>
  )
}
