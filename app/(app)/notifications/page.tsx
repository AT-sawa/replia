'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const notificationItems = [
  { id: 'chat', label: 'チャット返信', description: 'AIからの返信を通知', defaultOn: true },
  { id: 'repair', label: '修理依頼の進捗', description: 'サポート状況の更新を通知', defaultOn: true },
  { id: 'warranty', label: '保証期限のお知らせ', description: '保証期限が近づいたら通知', defaultOn: true },
  { id: 'news', label: 'お知らせ', description: '重要なお知らせを通知', defaultOn: false },
]

export default function NotificationsPage() {
  const router = useRouter()
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationItems.map((item) => [item.id, item.defaultOn]))
  )

  const handleToggle = (id: string) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div style={{ background: '#FAFBFC', minHeight: '100%' }}>
      {/* Header */}
      <div
        style={{
          background: 'white',
          borderBottom: '1px solid #E8ECF0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            width: 32, height: 32, background: '#0F1419',
            borderRadius: '50%', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#0F1419', margin: 0 }}>通知設定</p>
      </div>

      <div style={{ padding: 16 }}>
        <div
          style={{
            background: 'white', border: '1px solid #E8ECF0',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(15,20,25,0.06)',
          }}
        >
          {notificationItems.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 16px',
                borderBottom: i < notificationItems.length - 1 ? '1px solid #E8ECF0' : 'none',
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1419', margin: 0 }}>{item.label}</p>
                <p style={{ fontSize: 12, color: '#98A2AE', margin: '2px 0 0' }}>{item.description}</p>
              </div>
              {/* Toggle Switch */}
              <div
                onClick={() => handleToggle(item.id)}
                style={{
                  width: 46, height: 26,
                  background: toggles[item.id] ? '#0F1419' : '#E8ECF0',
                  borderRadius: 100,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 3, left: toggles[item.id] ? 23 : 3,
                    width: 20, height: 20,
                    background: 'white',
                    borderRadius: '50%',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
