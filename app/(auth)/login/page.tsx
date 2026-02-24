'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    router.push('/')
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
          <p
            style={{ fontSize: 13, color: '#98A2AE', marginTop: 6 }}
          >
            家電サポートAIアシスタント
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          {/* Email */}
          <div>
            <label
              style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}
            >
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              style={{
                width: '100%',
                height: 46,
                border: '1.5px solid #E8ECF0',
                borderRadius: 10,
                padding: '0 14px',
                fontSize: 14,
                color: '#0F1419',
                background: '#FAFBFC',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}
            >
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                height: 46,
                border: '1.5px solid #E8ECF0',
                borderRadius: 10,
                padding: '0 14px',
                fontSize: 14,
                color: '#0F1419',
                background: '#FAFBFC',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#0F1419',
              color: 'white',
              borderRadius: 100,
              height: 50,
              border: 'none',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: 8,
              width: '100%',
            }}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        {/* Sign up link */}
        <p
          style={{ fontSize: 13, color: '#98A2AE', textAlign: 'center', marginTop: 20 }}
        >
          アカウントをお持ちでない方は{' '}
          <Link
            href="#"
            style={{ color: '#0F1419', fontWeight: 700, textDecoration: 'underline' }}
          >
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
