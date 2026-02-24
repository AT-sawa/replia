'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AccountPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [createdAt, setCreatedAt] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? null)
        const d = new Date(data.user.created_at)
        setCreatedAt(`${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`)
      }
    })
  }, [])

  const rows = [
    { label: 'メールアドレス', value: email ?? '読み込み中...' },
    { label: 'アカウント作成日', value: createdAt ?? '読み込み中...' },
    { label: 'プラン', value: '無料プラン' },
  ]

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
        <p style={{ fontSize: 16, fontWeight: 700, color: '#0F1419', margin: 0 }}>アカウント設定</p>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Account Info */}
        <div
          style={{
            background: 'white', border: '1px solid #E8ECF0',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(15,20,25,0.06)',
          }}
        >
          {rows.map((row, i) => (
            <div
              key={row.label}
              style={{
                padding: '14px 16px',
                borderBottom: i < rows.length - 1 ? '1px solid #E8ECF0' : 'none',
              }}
            >
              <p style={{ fontSize: 11, color: '#98A2AE', fontWeight: 600, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {row.label}
              </p>
              <p style={{ fontSize: 14, color: '#0F1419', fontWeight: 500, margin: 0 }}>
                {row.value}
              </p>
            </div>
          ))}
        </div>

        {/* Delete Account */}
        <div
          style={{
            background: 'white', border: '1px solid #FFCDD2',
            borderRadius: 12, padding: '14px 16px',
            boxShadow: '0 1px 4px rgba(15,20,25,0.06)',
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', margin: '0 0 4px' }}>
            アカウントの削除
          </p>
          <p style={{ fontSize: 12, color: '#5B6570', margin: '0 0 12px', lineHeight: 1.6 }}>
            アカウントを削除すると、すべてのデータが失われます。この操作は取り消せません。
          </p>
          <button
            onClick={() => router.push('/mypage')}
            style={{
              background: 'white', border: '1.5px solid #FFCDD2',
              borderRadius: 100, padding: '8px 20px',
              fontSize: 13, fontWeight: 700, color: '#DC2626', cursor: 'pointer',
            }}
          >
            削除を申請する
          </button>
        </div>
      </div>
    </div>
  )
}
