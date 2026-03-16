'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)
    if (error) {
      const msg = error.message
      if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
        setError('メールアドレスまたはパスワードが正しくありません')
      } else if (msg.includes('Email not confirmed')) {
        setError('メールアドレスの確認が完了していません。届いたメールのリンクをクリックしてください')
      } else if (msg.includes('rate limit') || msg.includes('too many')) {
        setError('ログイン試行が多すぎます。しばらく時間をおいてから再試行してください')
      } else {
        setError('ログインに失敗しました。時間をおいて再度お試しください')
      }
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div
      style={{ background: '#0F1419', minHeight: '100vh' }}
      className="flex items-center justify-center p-5"
    >
      <div
        style={{
          background: 'white',
          borderRadius: 20,
          padding: 40,
          width: '100%',
          maxWidth: 310,
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: '#0F1419',
            }}
          >
            replia
          </span>
          <p style={{ fontSize: 13, color: '#98A2AE', marginTop: 6 }}>
            家電サポートAIアシスタント
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#FFEBEE',
              border: '1px solid #FFCDD2',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 13,
              color: '#DC2626',
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              style={{
                width: '100%', height: 46,
                border: '1.5px solid #E8ECF0', borderRadius: 10,
                padding: '0 14px', fontSize: 14, color: '#0F1419',
                background: '#FAFBFC', fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', height: 46,
                border: '1.5px solid #E8ECF0', borderRadius: 10,
                padding: '0 14px', fontSize: 14, color: '#0F1419',
                background: '#FAFBFC', fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#0F1419', color: 'white',
              borderRadius: 100, height: 50, border: 'none',
              fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: 8, width: '100%',
            }}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <p style={{ fontSize: 13, textAlign: 'center', marginTop: 16 }}>
          <Link href="/forgot-password" style={{ color: '#98A2AE', textDecoration: 'underline' }}>
            パスワードをお忘れですか？
          </Link>
        </p>

        <p style={{ fontSize: 13, color: '#98A2AE', textAlign: 'center', marginTop: 8 }}>
          アカウントをお持ちでない方は{' '}
          <Link href="/signup" style={{ color: '#0F1419', fontWeight: 700, textDecoration: 'underline' }}>
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
