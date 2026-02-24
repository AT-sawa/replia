'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EscalationPage() {
  const router = useRouter()
  const [symptoms, setSymptoms] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    await new Promise((r) => setTimeout(r, 1000))
    router.push('/')
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
          修理・サポート依頼
        </p>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Warning Card */}
        <div
          style={{
            background: '#FFEBEE',
            border: '1px solid #FFCDD2',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#DC2626',
                margin: '0 0 4px',
              }}
            >
              AIで解決できませんでした
            </p>
            <p style={{ fontSize: 12, color: '#5B6570', margin: 0, lineHeight: 1.6 }}>
              この問題はメーカーサポートへのエスカレーションが必要です。以下の情報を送信するとサポートに引き継ぎます。
            </p>
          </div>
        </div>

        {/* AI Summary */}
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#5B6570',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            AI 会話サマリー
          </p>
          <div
            style={{
              background: '#F4F6F8',
              borderRadius: 12,
              padding: '12px 14px',
            }}
          >
            <p style={{ fontSize: 12, color: '#5B6570', margin: 0, lineHeight: 1.7 }}>
              ユーザーはエアコン（CS-X402D2）が全く冷えないと報告。フィルター清掃・室外機確認・設定温度確認を試みたが改善なし。エラーコード H11 が表示されており、冷媒ガス漏れの可能性が高い。
            </p>
          </div>
        </div>

        {/* Manufacturer Info */}
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#5B6570',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            連絡先
          </p>
          <div
            style={{
              background: 'white',
              border: '1px solid #E8ECF0',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(15,20,25,0.06)',
            }}
          >
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E8ECF0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: '#F4F6F8',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                  }}
                >
                  🏢
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0F1419', margin: 0 }}>
                    Panasonic お客様相談センター
                  </p>
                  <p style={{ fontSize: 11, color: '#98A2AE', margin: 0 }}>
                    平日 9:00〜18:00
                  </p>
                </div>
              </div>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <a
                href="tel:0120-878-365"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: '#E8F5E9',
                  color: '#059669',
                  borderRadius: 100,
                  height: 42,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 1H6L7.5 5L5.5 6C6.5 8 8 9.5 10 10.5L11 8.5L15 10V13C15 14 14 15 13 15C7 15 1 9 1 3C1 2 2 1 3 1Z"
                    fill="#059669"
                  />
                </svg>
                0120-878-365
              </a>
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <form onSubmit={handleSubmit}>
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
              追記事項（任意）
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="症状の詳細や気になる点をご記入ください..."
              rows={4}
              style={{
                width: '100%',
                border: '1.5px solid #E8ECF0',
                borderRadius: 12,
                padding: '12px 14px',
                fontSize: 13,
                color: '#0F1419',
                background: 'white',
                resize: 'none',
                fontFamily: "'Zen Kaku Gothic New', sans-serif",
                lineHeight: 1.7,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitted}
            style={{
              background: '#DC2626',
              color: 'white',
              width: '100%',
              height: 50,
              borderRadius: 100,
              border: 'none',
              fontSize: 15,
              fontWeight: 700,
              cursor: submitted ? 'not-allowed' : 'pointer',
              opacity: submitted ? 0.7 : 1,
              marginTop: 14,
            }}
          >
            {submitted ? '送信中...' : '修理依頼を送信する'}
          </button>
        </form>
      </div>
    </div>
  )
}
