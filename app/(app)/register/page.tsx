'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [purchaseDate, setPurchaseDate] = useState('')
  const [storeName, setStoreName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    await new Promise((r) => setTimeout(r, 800))
    router.push('/my-appliances')
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
            width: 32,
            height: 32,
            background: '#0F1419',
            borderRadius: '50%',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#0F1419', margin: 0 }}>
          保証登録
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: 16 }}>
        {/* Product Preview Card */}
        <div
          style={{
            background: 'white',
            border: '1px solid #E8ECF0',
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 1px 4px rgba(15,20,25,0.06)',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              background: '#F4F6F8',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            🧺
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0F1419', margin: 0 }}>
              全自動洗濯機
            </p>
            <p style={{ fontSize: 12, color: '#98A2AE', margin: '2px 0 0' }}>
              NA-VX900BL · Panasonic
            </p>
            <p style={{ fontSize: 11, color: '#98A2AE', margin: '2px 0 0' }}>
              S/N: PA2024031200458
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
          {/* Purchase Date */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#5B6570',
                display: 'block',
                marginBottom: 6,
              }}
            >
              購入日
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
              style={{
                width: '100%',
                height: 46,
                border: '1.5px solid #E8ECF0',
                borderRadius: 10,
                padding: '0 14px',
                fontSize: 14,
                color: '#0F1419',
                background: 'white',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>

          {/* Store Name */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#5B6570',
                display: 'block',
                marginBottom: 6,
              }}
            >
              購入店舗
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="例：ヨドバシカメラ 新宿店"
              style={{
                width: '100%',
                height: 46,
                border: '1.5px solid #E8ECF0',
                borderRadius: 10,
                padding: '0 14px',
                fontSize: 14,
                color: '#0F1419',
                background: 'white',
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
              }}
            />
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#5B6570',
              display: 'block',
              marginBottom: 6,
            }}
          >
            領収書・保証書の写真
          </label>
          <div
            style={{
              border: '2px dashed #E8ECF0',
              borderRadius: 12,
              padding: '28px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                background: '#F4F6F8',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M3 17L7.5 11L10.5 15L13.5 11L19 17H3Z"
                  stroke="#98A2AE"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="8" cy="7" r="2" stroke="#98A2AE" strokeWidth="1.5" />
                <rect x="1" y="2" width="20" height="18" rx="3" stroke="#98A2AE" strokeWidth="1.5" />
              </svg>
            </div>
            <p style={{ fontSize: 13, color: '#98A2AE', margin: 0, textAlign: 'center' }}>
              タップして写真をアップロード
            </p>
            <p style={{ fontSize: 11, color: '#C5CAD0', margin: 0 }}>
              JPG, PNG, PDF 対応
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitted}
          style={{
            background: '#0F1419',
            color: 'white',
            width: '100%',
            height: 50,
            borderRadius: 100,
            border: 'none',
            fontSize: 15,
            fontWeight: 700,
            cursor: submitted ? 'not-allowed' : 'pointer',
            opacity: submitted ? 0.7 : 1,
          }}
        >
          {submitted ? '登録中...' : '保証登録を完了する'}
        </button>
      </form>
    </div>
  )
}
