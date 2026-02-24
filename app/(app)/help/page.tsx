'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const faqs = [
  {
    q: 'AIチャットで解決しない場合はどうすればいいですか？',
    a: 'チャット画面の「🔧 修理依頼」ボタンから、メーカーサポートへのエスカレーション申請ができます。担当者が対応いたします。',
  },
  {
    q: '家電の登録はどうやってするのですか？',
    a: 'ホーム画面の検索バー右のQRアイコン、またはマイ家電画面の「＋」ボタンから保証登録ページに進んでください。',
  },
  {
    q: '対応しているメーカーはどこですか？',
    a: '現在はPanasonic、Sharp、Hitachi、Daikin、Mitsubishi Electricなど主要家電メーカーに対応しています。順次拡大予定です。',
  },
  {
    q: 'チャット履歴はどこで確認できますか？',
    a: 'マイページの「相談履歴」からチャット履歴一覧をご確認いただけます。',
  },
  {
    q: '個人情報はどのように管理されますか？',
    a: 'お客様の個人情報は暗号化して安全に管理しています。第三者への提供は行いません。詳細は利用規約をご確認ください。',
  },
]

export default function HelpPage() {
  const router = useRouter()
  const [open, setOpen] = useState<number | null>(null)

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
            width: 32, height: 32, background: '#0F1419',
            borderRadius: '50%', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#0F1419', margin: 0 }}>ヘルプ・よくある質問</p>
      </div>

      <div style={{ padding: 16 }}>
        <div
          style={{
            background: 'white', border: '1px solid #E8ECF0',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(15,20,25,0.06)',
          }}
        >
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{ borderBottom: i < faqs.length - 1 ? '1px solid #E8ECF0' : 'none' }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  padding: '16px', textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0F1419', background: '#F4F6F8', borderRadius: 100, padding: '2px 8px', flexShrink: 0, marginTop: 1 }}>
                  Q
                </span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#0F1419', lineHeight: 1.5, textAlign: 'left' }}>
                  {faq.q}
                </span>
                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  style={{ flexShrink: 0, transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginTop: 2 }}
                >
                  <path d="M4 6L8 10L12 6" stroke="#98A2AE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {open === i && (
                <div style={{ padding: '0 16px 16px', display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'white', background: '#0F1419', borderRadius: 100, padding: '2px 8px', flexShrink: 0, height: 'fit-content' }}>
                    A
                  </span>
                  <p style={{ fontSize: 13, color: '#5B6570', margin: 0, lineHeight: 1.7 }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div
          style={{
            background: 'white', border: '1px solid #E8ECF0',
            borderRadius: 12, padding: '16px',
            boxShadow: '0 1px 4px rgba(15,20,25,0.06)',
            marginTop: 16, textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0F1419', margin: '0 0 4px' }}>
            解決しない場合は
          </p>
          <p style={{ fontSize: 12, color: '#98A2AE', margin: '0 0 12px' }}>
            チャットからAIに相談するか、修理依頼をご利用ください
          </p>
          <button
            onClick={() => router.push('/chat')}
            style={{
              background: '#0F1419', color: 'white',
              border: 'none', borderRadius: 100,
              padding: '10px 24px', fontSize: 14,
              fontWeight: 700, cursor: 'pointer',
              width: '100%',
            }}
          >
            AIに相談する
          </button>
        </div>
      </div>
    </div>
  )
}
