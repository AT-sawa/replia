'use client'

import { useState, useEffect } from 'react'

type ReminderPreset = '1month' | '3months' | '6months'
type ReminderType = ReminderPreset | 'custom' | null

interface ReminderSectionProps {
  productId: string
  warrantyEnd: string
  status: 'active' | 'expiring' | 'expired'
}

const presets: { key: ReminderPreset; label: string; days: number }[] = [
  { key: '1month', label: '1ヶ月前', days: 30 },
  { key: '3months', label: '3ヶ月前', days: 90 },
  { key: '6months', label: '6ヶ月前', days: 180 },
]

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    width="16" height="16" viewBox="0 0 16 16" fill="none"
    style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
  >
    <path d="M4 6L8 10L12 6" stroke="#C5CAD0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export function ReminderSection({ productId, warrantyEnd, status }: ReminderSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<ReminderType>(null)
  const [customDate, setCustomDate] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`reminder_${productId}`)
      if (stored) {
        const data = JSON.parse(stored)
        setSelected(data.type)
        if (data.customDate) setCustomDate(data.customDate)
        setSaved(true)
      }
    } catch {}
  }, [productId])

  const handleSelect = (key: ReminderType) => {
    setSelected(key)
    setSaved(false)
  }

  const handleSave = () => {
    try {
      localStorage.setItem(
        `reminder_${productId}`,
        JSON.stringify({ type: selected, customDate: selected === 'custom' ? customDate : undefined })
      )
    } catch {}
    setSaved(true)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    try { localStorage.removeItem(`reminder_${productId}`) } catch {}
    setSelected(null)
    setCustomDate('')
    setSaved(false)
  }

  if (status === 'expired') return null

  const canSave = selected !== null && (selected !== 'custom' || customDate !== '')

  const savedLabel = saved && selected
    ? (selected === 'custom' ? customDate : presets.find((p) => p.key === selected)?.label ?? '')
    : null

  return (
    <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,20,25,0.06)' }}>
      {/* Header — tappable */}
      <div
        onClick={() => setIsOpen((v) => !v)}
        style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M18 16H6l2-4V9a4 4 0 018 0v3l2 4Z" stroke="#5B6570" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M10 20a2 2 0 004 0" stroke="#5B6570" strokeWidth="1.5" />
        </svg>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#5B6570', margin: 0, flex: 1 }}>保証切れリマインド</p>
        {/* Show saved badge in collapsed state */}
        {savedLabel && (
          <span style={{ fontSize: 10, color: '#059669', background: '#D1FAE5', borderRadius: 100, padding: '2px 8px', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {savedLabel}設定済み
          </span>
        )}
        <Chevron open={isOpen} />
      </div>

      {/* Content */}
      {isOpen && (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid #E8ECF0' }}>
          <p style={{ fontSize: 11, color: '#98A2AE', margin: 0 }}>
            保証終了（{warrantyEnd}）の何日前に通知しますか？
          </p>

          {/* Preset chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {presets.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleSelect(opt.key)}
                style={{
                  height: 32, padding: '0 14px', borderRadius: 100, border: '1px solid',
                  borderColor: selected === opt.key ? '#0F1419' : '#E8ECF0',
                  background: selected === opt.key ? '#0F1419' : 'white',
                  color: selected === opt.key ? 'white' : '#5B6570',
                  fontSize: 12, fontWeight: selected === opt.key ? 600 : 400, cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={() => handleSelect('custom')}
              style={{
                height: 32, padding: '0 14px', borderRadius: 100, border: '1px solid',
                borderColor: selected === 'custom' ? '#0F1419' : '#E8ECF0',
                background: selected === 'custom' ? '#0F1419' : 'white',
                color: selected === 'custom' ? 'white' : '#5B6570',
                fontSize: 12, fontWeight: selected === 'custom' ? 600 : 400, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke={selected === 'custom' ? 'white' : '#5B6570'} strokeWidth="2" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke={selected === 'custom' ? 'white' : '#5B6570'} strokeWidth="2" strokeLinecap="round" />
              </svg>
              日付を指定
            </button>
          </div>

          {/* Custom date picker */}
          {selected === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => { setCustomDate(e.target.value); setSaved(false) }}
              style={{ width: '100%', height: 44, border: '1.5px solid #E8ECF0', borderRadius: 10, padding: '0 14px', fontSize: 13, color: '#0F1419', background: 'white', fontFamily: "'DM Sans', sans-serif" }}
            />
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSave}
              disabled={!canSave}
              style={{
                flex: 1, height: 42,
                background: saved ? '#059669' : canSave ? '#0F1419' : '#E8ECF0',
                color: saved || canSave ? 'white' : '#98A2AE',
                border: 'none', borderRadius: 100, fontSize: 13, fontWeight: 700,
                cursor: canSave ? 'pointer' : 'not-allowed',
              }}
            >
              {saved ? '✓ 保存済み' : 'リマインドを設定'}
            </button>
            {saved && selected && (
              <button
                onClick={handleRemove}
                style={{ height: 42, padding: '0 16px', background: 'transparent', color: '#98A2AE', border: '1px solid #E8ECF0', borderRadius: 100, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                解除
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
