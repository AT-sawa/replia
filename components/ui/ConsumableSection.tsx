'use client'

import { useState, useEffect } from 'react'

interface Consumable {
  id: string
  name: string
  intervalDays: number
  intervalLabel: string
}

interface ConsumableSectionProps {
  productId: string
  consumables: Consumable[]
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    width="16" height="16" viewBox="0 0 16 16" fill="none"
    style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
  >
    <path d="M4 6L8 10L12 6" stroke="#C5CAD0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export function ConsumableSection({ productId, consumables }: ConsumableSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [lastDates, setLastDates] = useState<Record<string, string>>({})

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`consumables_${productId}`)
      if (stored) setLastDates(JSON.parse(stored))
    } catch {}
  }, [productId])

  const markReplaced = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const today = new Date().toISOString().split('T')[0]
    const updated = { ...lastDates, [id]: today }
    setLastDates(updated)
    try {
      localStorage.setItem(`consumables_${productId}`, JSON.stringify(updated))
    } catch {}
  }

  const getStatus = (consumableId: string, intervalDays: number) => {
    const lastDate = lastDates[consumableId]
    if (!lastDate) return { nextLabel: '未記録', daysUntil: null, state: 'unknown' as const }
    const next = new Date(lastDate)
    next.setDate(next.getDate() + intervalDays)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysUntil = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const nextLabel = next.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })
    if (daysUntil <= 0) return { nextLabel, daysUntil, state: 'overdue' as const }
    if (daysUntil <= 7) return { nextLabel, daysUntil, state: 'soon' as const }
    return { nextLabel, daysUntil, state: 'ok' as const }
  }

  // Count items needing attention for the collapsed summary
  const overdueCount = consumables.filter((c) => {
    const s = getStatus(c.id, c.intervalDays)
    return s.state === 'overdue' || s.state === 'soon'
  }).length

  if (consumables.length === 0) return null

  return (
    <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,20,25,0.06)' }}>
      {/* Header — tappable */}
      <div
        onClick={() => setIsOpen((v) => !v)}
        style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#5B6570" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#5B6570', margin: 0, flex: 1 }}>消耗品・メンテナンス</p>
        {!isOpen && overdueCount > 0 && (
          <span style={{ fontSize: 10, color: '#DC2626', background: '#FFEBEE', borderRadius: 100, padding: '2px 8px', fontWeight: 700 }}>
            {overdueCount}件要確認
          </span>
        )}
        <Chevron open={isOpen} />
      </div>

      {/* Content */}
      {isOpen && (
        <div style={{ borderTop: '1px solid #E8ECF0' }}>
          {consumables.map((c, i) => {
            const { nextLabel, daysUntil, state } = getStatus(c.id, c.intervalDays)
            const isOverdue = state === 'overdue'
            const isSoon = state === 'soon'

            return (
              <div
                key={c.id}
                style={{
                  padding: '12px 16px',
                  borderBottom: i < consumables.length - 1 ? '1px solid #F4F6F8' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: isOverdue ? '#FFF9FA' : 'transparent',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0F1419' }}>{c.name}</span>
                    {isOverdue && (
                      <span style={{ fontSize: 10, color: '#DC2626', background: '#FFEBEE', borderRadius: 100, padding: '2px 7px', fontWeight: 700 }}>要交換</span>
                    )}
                    {isSoon && (
                      <span style={{ fontSize: 10, color: '#D97706', background: '#FEF3C7', borderRadius: 100, padding: '2px 7px', fontWeight: 700 }}>あと{daysUntil}日</span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: '#98A2AE', margin: '3px 0 0' }}>
                    {c.intervalLabel}
                    {state !== 'unknown' && ` · 次回: ${nextLabel}`}
                    {state === 'unknown' && ' · 未記録'}
                  </p>
                </div>
                <button
                  onClick={(e) => markReplaced(e, c.id)}
                  style={{ height: 30, padding: '0 12px', background: isOverdue ? '#DC2626' : '#0F1419', color: 'white', border: 'none', borderRadius: 100, fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                  交換した
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
