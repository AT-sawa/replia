'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Badge, { WarrantyStatus } from '@/components/ui/Badge'
import { ProductImage } from '@/components/ui/ProductImage'
import { formatDaysRemaining } from '@/lib/utils'

type SortKey = 'registered' | 'purchase' | 'warranty'

const appliances = [
  {
    id: '1',
    name: 'エアコン',
    model: 'CS-X402D2',
    brand: 'Panasonic',
    category: '空調',
    status: 'active' as WarrantyStatus,
    daysLeft: 284,
    purchaseDateMs: new Date('2022-07-14').getTime(),
    imageUrl: 'https://img1.kakaku.k-img.com/images/productimage/l/K0001387191.jpg',
  },
  {
    id: '2',
    name: '全自動洗濯機',
    model: 'NA-VX900BL',
    brand: 'Panasonic',
    category: '洗濯',
    status: 'expiring' as WarrantyStatus,
    daysLeft: 28,
    purchaseDateMs: new Date('2022-03-12').getTime(),
    imageUrl: 'https://img1.kakaku.k-img.com/images/productimage/l/J0000033345.jpg',
  },
  {
    id: '3',
    name: '液晶テレビ',
    model: 'TH-65LX950',
    brand: 'Panasonic',
    category: 'テレビ',
    status: 'expired' as WarrantyStatus,
    daysLeft: 0,
    purchaseDateMs: new Date('2021-09-05').getTime(),
    imageUrl: 'https://img1.kakaku.k-img.com/images/productimage/l/K0001435839.jpg',
  },
  {
    id: '4',
    name: '冷蔵庫',
    model: 'NR-F605WPX',
    brand: 'Panasonic',
    category: '冷蔵庫',
    status: 'active' as WarrantyStatus,
    daysLeft: 512,
    purchaseDateMs: new Date('2023-12-01').getTime(),
    imageUrl: 'https://img1.kakaku.k-img.com/images/productimage/l/J0000029607.jpg',
  },
]

const categories = ['すべて', ...Array.from(new Set(appliances.map((a) => a.category)))]

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'registered', label: '登録順' },
  { key: 'purchase', label: '購入日順' },
  { key: 'warranty', label: '保証期限順' },
]

export default function MyAppliancesPage() {
  const [selectedCategory, setSelectedCategory] = useState('すべて')
  const [sortKey, setSortKey] = useState<SortKey>('registered')

  const filtered = useMemo(() => {
    let list =
      selectedCategory === 'すべて'
        ? [...appliances]
        : appliances.filter((a) => a.category === selectedCategory)

    if (sortKey === 'purchase') {
      list = [...list].sort((a, b) => b.purchaseDateMs - a.purchaseDateMs)
    } else if (sortKey === 'warranty') {
      list = [...list].sort((a, b) => {
        // expired items go to the bottom
        if (a.status === 'expired' && b.status !== 'expired') return 1
        if (b.status === 'expired' && a.status !== 'expired') return -1
        return a.daysLeft - b.daysLeft
      })
    }

    return list
  }, [selectedCategory, sortKey])

  return (
    <div style={{ background: '#FAFBFC', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E8ECF0', padding: '14px 16px' }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#0F1419', margin: 0 }}>マイ家電</p>
        <p style={{ fontSize: 12, color: '#98A2AE', margin: '2px 0 0' }}>{appliances.length}台登録済み</p>
      </div>

      {/* Filter & Sort */}
      <div style={{ background: 'white', borderBottom: '1px solid #E8ECF0', padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Category chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                flexShrink: 0,
                height: 30,
                padding: '0 13px',
                borderRadius: 100,
                border: selectedCategory === cat ? 'none' : '1px solid #E8ECF0',
                background: selectedCategory === cat ? '#0F1419' : 'white',
                color: selectedCategory === cat ? 'white' : '#5B6570',
                fontSize: 12,
                fontWeight: selectedCategory === cat ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#98A2AE', flexShrink: 0 }}>並び替え：</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {sortOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortKey(opt.key)}
                style={{
                  height: 26,
                  padding: '0 10px',
                  borderRadius: 100,
                  border: '1px solid',
                  borderColor: sortKey === opt.key ? '#0F1419' : '#E8ECF0',
                  background: sortKey === opt.key ? '#0F1419' : 'white',
                  color: sortKey === opt.key ? 'white' : '#98A2AE',
                  fontSize: 11,
                  fontWeight: sortKey === opt.key ? 600 : 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List — flex column on mobile, 3-col grid on desktop */}
      <div className="appliance-list">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#98A2AE', fontSize: 13 }}>
            このカテゴリの家電はありません
          </div>
        ) : (
          filtered.map((item) => (
            <Link key={item.id} href={`/product/${item.id}`} style={{ textDecoration: 'none' }}>
              <div
                className="appliance-card-inner"
                style={{
                  background: 'white',
                  border: '1px solid #E8ECF0',
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: '0 1px 4px rgba(15,20,25,0.06)',
                }}
              >
                <div className="appliance-card-img-wrap">
                  <ProductImage imageUrl={item.imageUrl} name={item.name} size={44} iconSize={24} borderRadius={8} />
                </div>

                <div className="appliance-card-body" style={{ flex: 1, minWidth: 0 }}>
                  <p className="appliance-card-name" style={{ fontSize: 14, fontWeight: 700, color: '#0F1419', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: 11, color: '#98A2AE', margin: '2px 0 0' }}>
                    {item.model} · {item.brand}
                  </p>
                </div>

                <div className="appliance-card-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <Badge status={item.status} />
                  {item.status !== 'expired' && (
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

      {/* Floating Add Button — mobile only (desktop has sidebar button) */}
      <Link href="/register" className="md:hidden" style={{ textDecoration: 'none' }}>
        <div
          style={{
            position: 'fixed',
            bottom: 100,
            right: 20,
            width: 56,
            height: 56,
            background: '#0F1419',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(15,20,25,0.25)',
            cursor: 'pointer',
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
