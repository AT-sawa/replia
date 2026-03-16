'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    if (error) {
      const msg = error.message
      if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('User already')) {
        setError('このメールアドレスはすでに登録されています')
      } else if (msg.includes('invalid') && msg.includes('email')) {
        setError('メールアドレスの形式が正しくありません')
      } else if (msg.includes('Password should be at least') || msg.includes('password')) {
        setError('パスワードは6文字以上で入力してください')
      } else if (msg.includes('rate limit') || msg.includes('too many')) {
        setError('送信制限に達しました。しばらく時間をおいてから再試行してください')
      } else {
        setError('登録に失敗しました。時間をおいて再度お試しください')
      }
      return
    }
    setDone(true)
  }

  if (done) {
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
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#0F1419', marginBottom: 8 }}>
            確認メールを送信しました
          </p>
          <p style={{ fontSize: 13, color: '#98A2AE', lineHeight: 1.7, marginBottom: 24 }}>
            <strong>{email}</strong> に確認メールを送りました。
            メール内の「メールアドレスを確認する」をクリックしてからログインしてください。
          </p>
          <Link
            href="/login"
            style={{
              display: 'block',
              background: '#0F1419',
              color: 'white',
              borderRadius: 100,
              height: 50,
              lineHeight: '50px',
              fontSize: 15,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            ログイン画面へ
          </Link>
        </div>
      </div>
    )
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
            アカウントを新規作成
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
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-3">
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
              パスワード（6文字以上）
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
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
            {loading ? '登録中...' : 'アカウントを作成'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: '#98A2AE', textAlign: 'center', marginTop: 20 }}>
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" style={{ color: '#0F1419', fontWeight: 700, textDecoration: 'underline' }}>
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
