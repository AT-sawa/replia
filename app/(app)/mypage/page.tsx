'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const menuItems = [
  { icon: '🔔', label: '通知設定', href: null },
  { icon: '📋', label: '相談履歴', href: '/chat' },
  { icon: '🔒', label: 'アカウント設定', href: null },
  { icon: '❓', label: 'ヘルプ・よくある質問', href: null },
  { icon: '📝', label: '利用規約', href: null },
]

export default function MyPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  const handleLogout = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div style={{ background: '#FAFBFC', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E8ECF0', padding: '14px 16px' }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#0F1419', margin: 0 }}>
          マイページ
        </p>
      </div>

      <div style={{ padding: 16 }}>
        {/* Profile Card */}
        <div
          style={{
            background: 'white', border: '1px solid #E8ECF0',
            borderRadius: 16, padding: '20px 16px',
            display: 'flex', alignItems: 'center', gap: 14,
            marginBottom: 16, boxShadow: '0 1px 4px rgba(15,20,25,0.06)',
          }}
        >
          <div
            style={{
              width: 56, height: 56, background: '#0F1419',
              borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}
          >
            👤
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#0F1419', margin: 0 }}>
              {email ? email.split('@')[0] : '読み込み中...'}
            </p>
            <p style={{ fontSize: 12, color: '#98A2AE', margin: '2px 0 0' }}>
              {email ?? ''}
            </p>
          </div>
        </div>

        {/* Menu */}
        <div
          style={{
            background: 'white', border: '1px solid #E8ECF0',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(15,20,25,0.06)',
          }}
        >
          {menuItems.map((item, i) => {
            const rowStyle: React.CSSProperties = {
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px',
              borderBottom: i < menuItems.length - 1 ? '1px solid #E8ECF0' : 'none',
              cursor: item.href ? 'pointer' : 'default',
              textDecoration: 'none',
              color: 'inherit',
            }
            const inner = (
              <>
                <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: 14, color: '#0F1419', fontWeight: 500 }}>
                  {item.label}
                </span>
                {item.href && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4L10 8L6 12" stroke="#C5CAD0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </>
            )

            return item.href ? (
              <Link key={item.label} href={item.href} style={rowStyle}>
                {inner}
              </Link>
            ) : (
              <div key={item.label} style={rowStyle}>
                {inner}
              </div>
            )
          })}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loading}
          style={{
            width: '100%', height: 50, background: 'white',
            border: '1.5px solid #E8ECF0', borderRadius: 100,
            fontSize: 15, fontWeight: 700, color: '#DC2626',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1, marginTop: 16,
          }}
        >
          {loading ? 'ログアウト中...' : 'ログアウト'}
        </button>
      </div>
    </div>
  )
}
