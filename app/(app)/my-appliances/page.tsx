'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Badge, { WarrantyStatus } from '@/components/ui/Badge'
import { ApplianceIcon } from '@/components/ui/ApplianceIcon'
import { formatDaysRemaining } from '@/lib/utils'

type SortKey = 'registered' | 'purchase' | 'warranty'

interface ApplianceItem {
  id: string
  name: string
  model: string
  brand: string
  category: string
  status: WarrantyStatus
  daysLeft: number
  purchaseDateMs: number
  href: string   // link target
  isUser: boolean
}

// ── helpers ──────────────────────────────────────────────────────────────────
function calcStatus(daysLeft: number): WarrantyStatus {
  if (daysLeft <= 0) return 'expired'
  if (daysLeft <= 60) return 'expiring'
  return 'active'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToItem(a: any): ApplianceItem {
  const purchaseDateMs = a.purchase_date ? new Date(a.purchase_date).getTime() : Date.now()
  const warrantyMs = (a.warranty_months ?? 12) * 30 * 24 * 60 * 60 * 1000
  const warrantyEndMs = purchaseDateMs + warrantyMs
  const daysLeft = Math.round((warrantyEndMs - Date.now()) / 86400000)
  return {
    id:             a.id,
    name:           a.appliance_type || 'その他',
    model:          a.model || '—',
    brand:          a.brand || '',
    category:       a.appliance_type || 'その他',
    status:         calcStatus(daysLeft),
    daysLeft:       Math.max(0, daysLeft),
    purchaseDateMs,
    href:           `/product/user/${a.id}`,
    isUser:         true,
  }
}

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'registered', label: '登録順' },
  { key: 'purchase',   label: '購入日順' },
  { key: 'warranty',   label: '保証期限順' },
]

export default function MyAppliancesPage() {
  const [items, setItems] = useState<ApplianceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('すべて')
  const [sortKey, setSortKey] = useState<SortKey>('registered')

  useEffect(() => {
    fetch('/api/appliances')
      .then(r => r.json())
      .then(d => setItems((d.appliances ?? []).map(dbToItem)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(
    () => ['すべて', ...Array.from(new Set(items.map(a => a.category)))],
    [items]
  )

  const filtered = useMemo(() => {
    let list = selectedCategory === 'すべて'
      ? [...items]
      : items.filter(a => a.category === selectedCategory)

    if (sortKey === 'purchase') {
      list = [...list].sort((a, b) => b.purchaseDateMs - a.purchaseDateMs)
    } else if (sortKey === 'warranty') {
      list = [...list].sort((a, b) => {
        if (a.status === 'expired' && b.status !== 'expired') return 1
        if (b.status === 'expired' && a.status !== 'expired') return -1
        return a.daysLeft - b.daysLeft
      })
    }
    return list
  }, [items, selectedCategory, sortKey])

  return (
    <div style={{ background: '#FAFBFC', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E8ECF0', padding: '14px 16px' }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#0F1419', margin: 0 }}>マイ家電</p>
        {!loading && (
          <p style={{ fontSize: 12, color: '#98A2AE', margin: '2px 0 0' }}>
            {items.length}台登録済み
          </p>
        )}
      </div>

      {/* Filter & Sort — only show when there are items */}
      {items.length > 0 && (
        <div style={{ background: 'white', borderBottom: '1px solid #E8ECF0', padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Category chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  flexShrink: 0, height: 30, padding: '0 13px', borderRadius: 100,
                  border: selectedCategory === cat ? 'none' : '1px solid #E8ECF0',
                  background: selectedCategory === cat ? '#0F1419' : 'white',
                  color: selectedCategory === cat ? 'white' : '#5B6570',
                  fontSize: 12, fontWeight: selectedCategory === cat ? 600 : 400,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >{cat}</button>
            ))}
          </div>
          {/* Sort options */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#98A2AE', flexShrink: 0 }}>並び替え：</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {sortOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSortKey(opt.key)}
                  style={{
                    height: 26, padding: '0 10px', borderRadius: 100,
                    border: '1px solid',
                    borderColor: sortKey === opt.key ? '#0F1419' : '#E8ECF0',
                    background: sortKey === opt.key ? '#0F1419' : 'white',
                    color: sortKey === opt.key ? 'white' : '#98A2AE',
                    fontSize: 11, fontWeight: sortKey === opt.key ? 600 : 400,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >{opt.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#98A2AE', fontSize: 13 }}>
          読み込み中...
        </div>
      ) : items.length === 0 ? (
        /* Empty state */
        <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 64, height: 64, background: '#F4F6F8', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="3" width="20" height="14" rx="2" stroke="#C5CAD0" strokeWidth="1.5" />
              <path d="M8 21H16M12 17V21" stroke="#C5CAD0" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#0F1419', margin: 0 }}>家電が登録されていません</p>
          <p style={{ fontSize: 13, color: '#98A2AE', margin: 0 }}>＋ボタンから家電を追加してみましょう</p>
          <Link
            href="/register"
            style={{
              marginTop: 4,
              background: '#0F1419', color: 'white',
              borderRadius: 100, height: 44, padding: '0 24px',
              display: 'flex', alignItems: 'center', gap: 8,
              textDecoration: 'none', fontSize: 14, fontWeight: 700,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2V14M2 8H14" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            家電を追加する
          </Link>
        </div>
      ) : (
        <div className="appliance-list">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#98A2AE', fontSize: 13 }}>
              このカテゴリの家電はありません
            </div>
          ) : (
            filtered.map(item => (
              <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                <div
                  className="appliance-card-inner"
                  style={{
                    background: 'white', border: '1px solid #E8ECF0',
                    borderRadius: 12, padding: '12px 14px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    boxShadow: '0 1px 4px rgba(15,20,25,0.06)',
                  }}
                >
                  <div className="appliance-card-img-wrap">
                    <div style={{ width: 44, height: 44, background: '#F4F6F8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ApplianceIcon type={item.name} size={24} />
                    </div>
                  </div>
                  <div className="appliance-card-body" style={{ flex: 1, minWidth: 0 }}>
                    <p className="appliance-card-name" style={{ fontSize: 14, fontWeight: 700, color: '#0F1419', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: 11, color: '#98A2AE', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {[item.model, item.brand].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className="appliance-card-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <Badge status={item.status} />
                    {item.status !== 'expired' && item.daysLeft > 0 && (
                      <p style={{ fontSize: 10, color: '#98A2AE', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                        残{formatDaysRemaining(item.daysLeft)}
                      </p>
                    )}
                  </div>
                  <svg className="appliance-card-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginLeft: -4 }}>
                    <path d="M6 4L10 8L6 12" stroke="#C5CAD0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Floating Add Button */}
      <Link href="/register" className="md:hidden" style={{ textDecoration: 'none' }}>
        <div
          style={{
            position: 'fixed', bottom: 70, right: 20,
            width: 56, height: 56, background: '#0F1419',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(15,20,25,0.25)', cursor: 'pointer',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </Link>
    </div>
  )
}
