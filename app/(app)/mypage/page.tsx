'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M18 16H6l2-4V9a4 4 0 018 0v3l2 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 20a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
const IconHistory = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M20 2H4C2.9 2 2 2.9 2 4v14l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M7 9h10M7 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="11" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
  </svg>
)
const IconHelp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9.5 9.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5c0 1.8-2.5 2-2.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="17.5" r="1" fill="currentColor" />
  </svg>
)
const IconDoc = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const menuItems = [
  { Icon: IconUsers,   label: 'データ共有',           href: '/share' },
  { Icon: IconBell,    label: '通知設定',           href: '/notifications' },
  { Icon: IconHistory, label: '相談履歴',            href: '/chat' },
  { Icon: IconLock,    label: 'アカウント設定',       href: '/account' },
  { Icon: IconHelp,    label: 'ヘルプ・よくある質問', href: '/help' },
  { Icon: IconDoc,     label: '利用規約',            href: '/terms' },
]

export default function MyPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string>('')
  const [editing, setEditing] = useState(false)
  const [tempName, setTempName] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    // Use getSession() (reads from local storage, no network round-trip)
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      if (!user) return
      setEmail(user.email ?? null)
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || ''
      setDisplayName(name)
    })
  }, [])

  const handleEditStart = () => {
    setTempName(displayName)
    setEditing(true)
  }

  const handleSaveName = async () => {
    const trimmed = tempName.trim()
    if (!trimmed) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: { full_name: trimmed },
    })
    setSaving(false)
    if (!error) {
      setDisplayName(trimmed)
      setEditing(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div style={{ background: '#FAFBFC', minHeight: '100%', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
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
              flexShrink: 0,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="1.5" />
              <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              /* 名前編集モード */
              <div>
                <input
                  autoFocus
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  placeholder="名前を入力"
                  style={{
                    width: '100%', height: 36,
                    border: '1.5px solid #0F1419', borderRadius: 8,
                    padding: '0 10px', fontSize: 14, color: '#0F1419',
                    background: '#FAFBFC', marginBottom: 8,
                    fontFamily: "'Zen Kaku Gothic New', sans-serif",
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleSaveName}
                    disabled={saving || !tempName.trim()}
                    style={{
                      flex: 1, height: 30, background: '#0F1419', color: 'white',
                      border: 'none', borderRadius: 100, fontSize: 12, fontWeight: 700,
                      cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
                    }}
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    style={{
                      flex: 1, height: 30, background: 'white', color: '#5B6570',
                      border: '1px solid #E8ECF0', borderRadius: 100, fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              /* 表示モード */
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#0F1419', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName || '読み込み中...'}
                  </p>
                  <p style={{ fontSize: 12, color: '#98A2AE', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {email ?? ''}
                  </p>
                </div>
                {/* 編集ボタン */}
                <button
                  onClick={handleEditStart}
                  style={{
                    width: 28, height: 28, background: '#F4F6F8', border: 'none',
                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4C2.9 4 2 4.9 2 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7" stroke="#5B6570" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5Z" stroke="#5B6570" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
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
                <span style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B6570' }}>
                  <item.Icon />
                </span>
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
