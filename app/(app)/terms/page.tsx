'use client'

import { useRouter } from 'next/navigation'

const sections = [
  {
    title: '第1条（サービスの概要）',
    body: 'repliaは、AI技術を活用して家電製品のトラブル解決を支援するサービスです。本サービスを利用することで、故障診断、操作方法の案内、修理依頼などのサポートを受けることができます。',
  },
  {
    title: '第2条（利用登録）',
    body: '本サービスを利用するには、メールアドレスによるアカウント登録が必要です。登録された情報は正確に維持していただく必要があります。',
  },
  {
    title: '第3条（禁止事項）',
    body: '本サービスの利用にあたり、以下の行為を禁止します：\n・虚偽の情報を登録する行為\n・サービスの運営を妨害する行為\n・他のユーザーへの迷惑行為\n・法令または公序良俗に反する行為',
  },
  {
    title: '第4条（個人情報の取り扱い）',
    body: '当社は、利用者の個人情報を適切に管理し、利用者の同意なく第三者に提供することはありません。個人情報の取り扱いについては、別途プライバシーポリシーに定めます。',
  },
  {
    title: '第5条（免責事項）',
    body: 'AIによる診断結果はあくまで参考情報です。実際の修理・交換の判断はメーカーまたは専門業者にご相談ください。当社はAIの回答内容による損害について責任を負いません。',
  },
  {
    title: '第6条（サービスの変更・終了）',
    body: '当社は、事前の通知なくサービスの内容を変更、または提供を終了することがあります。これによる損害について当社は責任を負いません。',
  },
]

export default function TermsPage() {
  const router = useRouter()

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
        <p style={{ fontSize: 16, fontWeight: 700, color: '#0F1419', margin: 0 }}>利用規約</p>
      </div>

      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 12, color: '#98A2AE', margin: '0 0 16px' }}>
          最終更新日：2025年1月1日
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sections.map((section) => (
            <div
              key={section.title}
              style={{
                background: 'white', border: '1px solid #E8ECF0',
                borderRadius: 12, padding: '16px',
                boxShadow: '0 1px 4px rgba(15,20,25,0.06)',
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F1419', margin: '0 0 8px' }}>
                {section.title}
              </p>
              <p style={{ fontSize: 12, color: '#5B6570', margin: 0, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
