'use client'

import { useState, useEffect } from 'react'

type Member = { display_name: string | null; role: string; joined_at: string }
type Household = { id: string; code: string; members: Member[] }

export default function SharePage() {
  const [loading, setLoading] = useState(true)
  const [household, setHousehold] = useState<Household | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [creating, setCreating] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/household')
      .then((r) => r.json())
      .then((d) => setHousehold(d.household ?? null))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    setCreating(true)
    const res = await fetch('/api/household', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create' }),
    })
    const data = await res.json()
    setCreating(false)
    if (data.household) setHousehold(data.household)
  }

  const handleJoin = async () => {
    if (!joinCode.trim()) return
    setJoining(true)
    setJoinError('')
    const res = await fetch('/api/household', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join', code: joinCode.trim() }),
    })
    const data = await res.json()
    setJoining(false)
    if (data.error) {
      setJoinError(data.error)
    } else {
      setHousehold(data.household)
      setJoinCode('')
    }
  }

  const handleCopy = () => {
    if (!household) return
    navigator.clipboard.writeText(household.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleShare = () => {
    if (!household) return
    if (navigator.share) {
      navigator.share({
        title: 'Replia 家族共有',
        text: `Repliaの招待コード: ${household.code}\nhttps://replia-eta.vercel.app/share`,
      }).catch(() => {})
    } else {
      handleCopy()
    }
  }

  const memberCount = household?.members.length ?? 0

  return (
    <div style={{ background: '#FAFBFC', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E8ECF0', padding: '14px 16px' }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#0F1419', margin: 0 }}>家族共有</p>
        <p style={{ fontSize: 12, color: '#98A2AE', margin: '2px 0 0' }}>招待コードで家族と家電情報をシェア</p>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#98A2AE', fontSize: 13 }}>
            読み込み中...
          </div>
        ) : household ? (
          /* ── Already in a household ─────────────────────── */
          <>
            {/* Status card */}
            <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 16, padding: '20px 16px', boxShadow: '0 1px 4px rgba(15,20,25,0.06)', textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: '#98A2AE', margin: '0 0 8px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                招待コード
              </p>
              {/* Big code display */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, margin: '0 0 16px' }}>
                {household.code.split('').map((ch, i) => (
                  <div
                    key={i}
                    style={{
                      width: 42, height: 52, background: '#F4F6F8', borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, fontWeight: 700, color: '#0F1419',
                      fontFamily: "'DM Sans', monospace", letterSpacing: 0,
                      border: '1px solid #E8ECF0',
                    }}
                  >
                    {ch}
                  </div>
                ))}
              </div>

              <p style={{ fontSize: 12, color: '#98A2AE', margin: '0 0 16px' }}>
                このコードを家族に伝えてください
              </p>

              {/* Share/Copy buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleShare}
                  style={{
                    flex: 1, height: 42, background: '#0F1419', color: 'white',
                    border: 'none', borderRadius: 100, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="18" cy="5" r="3" stroke="white" strokeWidth="2" />
                    <circle cx="6" cy="12" r="3" stroke="white" strokeWidth="2" />
                    <circle cx="18" cy="19" r="3" stroke="white" strokeWidth="2" />
                    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="white" strokeWidth="2" />
                  </svg>
                  シェア
                </button>
                <button
                  onClick={handleCopy}
                  style={{
                    flex: 1, height: 42, background: copied ? '#F0FDF4' : 'white',
                    color: copied ? '#16A34A' : '#0F1419',
                    border: `1.5px solid ${copied ? '#86EFAC' : '#E8ECF0'}`,
                    borderRadius: 100, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? '✓ コピー済み' : 'コードをコピー'}
                </button>
              </div>
            </div>

            {/* Members list */}
            <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,20,25,0.06)' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8ECF0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0F1419' }}>メンバー</p>
                <span style={{ fontSize: 12, color: '#98A2AE' }}>{memberCount}人</span>
              </div>
              {household.members.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    borderBottom: i < memberCount - 1 ? '1px solid #E8ECF0' : 'none',
                  }}
                >
                  <div style={{ width: 36, height: 36, background: m.role === 'owner' ? '#0F1419' : '#F4F6F8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke={m.role === 'owner' ? 'white' : '#5B6570'} strokeWidth="1.5" />
                      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke={m.role === 'owner' ? 'white' : '#5B6570'} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0F1419' }}>
                      {m.display_name || 'メンバー'}
                    </p>
                    <p style={{ margin: '1px 0 0', fontSize: 11, color: '#98A2AE' }}>
                      {m.role === 'owner' ? 'オーナー' : 'メンバー'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ── Not in any household ────────────────────────── */
          <>
            {/* Illustration / description */}
            <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 16, padding: '24px 16px', boxShadow: '0 1px 4px rgba(15,20,25,0.06)', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: '#F4F6F8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#5B6570" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9" cy="7" r="4" stroke="#5B6570" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#5B6570" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0F1419', margin: '0 0 6px' }}>家族と家電をシェアしよう</p>
              <p style={{ fontSize: 13, color: '#98A2AE', margin: 0, lineHeight: 1.6 }}>
                グループを作成して招待コードを家族に送るか、<br />受け取ったコードを入力して参加できます
              </p>
            </div>

            {/* Create group */}
            <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(15,20,25,0.06)' }}>
              <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#0F1419' }}>新しいグループを作る</p>
              <p style={{ margin: '0 0 12px', fontSize: 12, color: '#98A2AE', lineHeight: 1.5 }}>招待コードが発行されます。家族にシェアしてください。</p>
              <button
                onClick={handleCreate}
                disabled={creating}
                style={{
                  width: '100%', height: 46, background: '#0F1419', color: 'white',
                  border: 'none', borderRadius: 100, fontSize: 14, fontWeight: 700,
                  cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1,
                }}
              >
                {creating ? '作成中...' : 'グループを作成する'}
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: '#E8ECF0' }} />
              <span style={{ fontSize: 12, color: '#98A2AE', flexShrink: 0 }}>または</span>
              <div style={{ flex: 1, height: 1, background: '#E8ECF0' }} />
            </div>

            {/* Join by code */}
            <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(15,20,25,0.06)' }}>
              <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#0F1419' }}>コードで参加する</p>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="招待コードを入力（例：ABC123）"
                maxLength={6}
                style={{
                  width: '100%', height: 46, border: `1.5px solid ${joinError ? '#DC2626' : '#E8ECF0'}`,
                  borderRadius: 10, padding: '0 14px', fontSize: 16, color: '#0F1419',
                  background: 'white', letterSpacing: '0.15em', fontFamily: "'DM Sans', monospace",
                  fontWeight: 700, textTransform: 'uppercase',
                }}
              />
              {joinError && (
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#DC2626' }}>{joinError}</p>
              )}
              <button
                onClick={handleJoin}
                disabled={joining || joinCode.trim().length < 6}
                style={{
                  width: '100%', height: 46, background: 'white',
                  color: '#0F1419', border: '1.5px solid #0F1419',
                  borderRadius: 100, fontSize: 14, fontWeight: 700,
                  cursor: joining || joinCode.trim().length < 6 ? 'not-allowed' : 'pointer',
                  opacity: joining || joinCode.trim().length < 6 ? 0.5 : 1,
                  marginTop: 10,
                }}
              >
                {joining ? '参加中...' : '参加する'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
