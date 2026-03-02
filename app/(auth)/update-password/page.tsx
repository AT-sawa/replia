'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      return
    }
    if (password !== confirm) {
      setError('パスワードが一致しません')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError('更新に失敗しました。リンクが期限切れの場合は再度パスワードリセットを行ってください。')
      return
    }
    setDone(true)
    setTimeout(() => router.push('/'), 2000)
  }

  return (
    <div
      style={{ background: '#0F1419', minHeight: '100vh' }}
      className="flex items-center justify-center p-5"
    >
      <div style={{ background: 'white', borderRadius: 20, padding: 40, width: '100%', maxWidth: 310 }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', color: '#0F1419' }}>
            replia
          </span>
          <p style={{ fontSize: 13, color: '#98A2AE', marginTop: 6 }}>新しいパスワードの設定</p>
        </div>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0F1419', margin: '0 0 8px' }}>
              パスワードを更新しました
            </p>
            <p style={{ fontSize: 13, color: '#5B6570' }}>ホームに移動します...</p>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#DC2626', marginBottom: 16, lineHeight: 1.6 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>
                  新しいパスワード（8文字以上）
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', height: 46, border: '1.5px solid #E8ECF0', borderRadius: 10, padding: '0 14px', fontSize: 14, color: '#0F1419', background: '#FAFBFC', fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>
                  パスワードの確認
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', height: 46, border: '1.5px solid #E8ECF0', borderRadius: 10, padding: '0 14px', fontSize: 14, color: '#0F1419', background: '#FAFBFC', fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                style={{ background: '#0F1419', color: 'white', borderRadius: 100, height: 50, border: 'none', fontSize: 15, fontWeight: 700, cursor: (loading || !password || !confirm) ? 'not-allowed' : 'pointer', opacity: (loading || !password || !confirm) ? 0.6 : 1, marginTop: 8, width: '100%' }}
              >
                {loading ? '更新中...' : 'パスワードを更新する'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
