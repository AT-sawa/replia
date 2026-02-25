'use client'

import { useState, useEffect } from 'react'

interface MemoSectionProps {
  productId: string
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    width="16" height="16" viewBox="0 0 16 16" fill="none"
    style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
  >
    <path d="M4 6L8 10L12 6" stroke="#C5CAD0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export function MemoSection({ productId }: MemoSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [memo, setMemo] = useState('')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`memo_${productId}`)
      if (stored) setMemo(stored)
    } catch {}
  }, [productId])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setMemo(val)
    try { localStorage.setItem(`memo_${productId}`, val) } catch {}
  }

  const preview = memo.trim()
    ? memo.replace(/\n/g, ' ').slice(0, 22) + (memo.length > 22 ? '…' : '')
    : null

  return (
    <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,20,25,0.06)' }}>
      {/* Header — tappable */}
      <div
        onClick={() => setIsOpen((v) => !v)}
        style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#5B6570" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#5B6570" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#5B6570', margin: 0 }}>メモ</p>
        {/* Preview when collapsed */}
        {!isOpen && preview && (
          <span style={{ fontSize: 11, color: '#98A2AE', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: 4 }}>
            {preview}
          </span>
        )}
        {!isOpen && !preview && (
          <span style={{ fontSize: 11, color: '#C5CAD0', flex: 1, marginLeft: 4 }}>未入力</span>
        )}
        <Chevron open={isOpen} />
      </div>

      {/* Content */}
      {isOpen && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid #E8ECF0' }}>
          <textarea
            value={memo}
            onChange={handleChange}
            placeholder="製品に関するメモを自由に入力&#10;例：リモコンの電池は2024年3月に交換&#10;　　購入時の設定：冷却モード3"
            rows={5}
            style={{
              width: '100%',
              marginTop: 12,
              border: '1.5px solid #E8ECF0',
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 13,
              lineHeight: 1.7,
              color: '#0F1419',
              background: 'white',
              resize: 'none',
              fontFamily: "'Zen Kaku Gothic New', sans-serif",
              boxSizing: 'border-box',
            }}
          />
          <p style={{ fontSize: 11, color: '#C5CAD0', margin: '4px 0 0', textAlign: 'right' }}>
            自動保存
          </p>
        </div>
      )}
    </div>
  )
}
