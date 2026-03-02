'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/update-password`,
    })

    setLoading(false)
    if (error) {
      setError('送信に失敗しました。メールアドレスを確認してください。')
      return
    }
    setSent(true)
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
          <p style={{ fontSize: 13, color: '#98A2AE', marginTop: 6 }}>パスワードのリセット</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📧</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0F1419', margin: '0 0 8px' }}>
              メールを送信しました
            </p>
            <p style={{ fontSize: 13, color: '#5B6570', lineHeight: 1.7, margin: '0 0 24px' }}>
              <strong>{email}</strong> にパスワードリセット用のリンクを送りました。メールをご確認ください。
            </p>
            <Link
              href="/login"
              style={{ display: 'block', textAlign: 'center', color: '#0F1419', fontSize: 13, fontWeight: 700, textDecoration: 'underline' }}
            >
              ログインに戻る
            </Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: '#5B6570', lineHeight: 1.7, marginBottom: 20 }}>
              登録時のメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
            </p>

            {error && (
              <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#DC2626', marginBottom: 16, lineHeight: 1.6 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  style={{ width: '100%', height: 46, border: '1.5px solid #E8ECF0', borderRadius: 10, padding: '0 14px', fontSize: 14, color: '#0F1419', background: '#FAFBFC', fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{ background: '#0F1419', color: 'white', borderRadius: 100, height: 50, border: 'none', fontSize: 15, fontWeight: 700, cursor: (loading || !email.trim()) ? 'not-allowed' : 'pointer', opacity: (loading || !email.trim()) ? 0.6 : 1, marginTop: 8, width: '100%' }}
              >
                {loading ? '送信中...' : 'リセットメールを送信'}
              </button>
            </form>

            <p style={{ fontSize: 13, color: '#98A2AE', textAlign: 'center', marginTop: 20 }}>
              <Link href="/login" style={{ color: '#98A2AE', textDecoration: 'underline' }}>
                ログインに戻る
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
