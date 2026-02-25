'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Badge, { WarrantyStatus } from '@/components/ui/Badge'
import { ApplianceIcon } from '@/components/ui/ApplianceIcon'
import { formatDaysRemaining } from '@/lib/utils'

interface Appliance {
  id: string
  appliance_type: string
  brand: string
  model: string
  purchase_date: string | null
  warranty_months: number
  store_name: string
  created_at: string
}

function calcStatus(daysLeft: number): WarrantyStatus {
  if (daysLeft <= 0) return 'expired'
  if (daysLeft <= 60) return 'expiring'
  return 'active'
}

const statusColor: Record<WarrantyStatus, string> = {
  active:   '#059669',
  expiring: '#D97706',
  expired:  '#DC2626',
}

export default function UserProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [appliance, setAppliance] = useState<Appliance | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    fetch(`/api/appliances/${params.id}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); return null }
        return r.json()
      })
      .then(d => d && setAppliance(d.appliance))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleDelete = async () => {
    setDeleting(true)
    await fetch(`/api/appliances/${params.id}`, { method: 'DELETE' })
    router.push('/my-appliances')
  }

  if (loading) return (
    <div style={{ background: '#FAFBFC', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#98A2AE', fontSize: 13 }}>読み込み中...</p>
    </div>
  )

  if (notFound || !appliance) return (
    <div style={{ background: '#FAFBFC', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <p style={{ color: '#0F1419', fontWeight: 700, fontSize: 15 }}>製品が見つかりません</p>
      <Link href="/my-appliances" style={{ color: '#2563EB', fontSize: 13 }}>マイ家電に戻る</Link>
    </div>
  )

  const purchaseDateMs = appliance.purchase_date ? new Date(appliance.purchase_date).getTime() : null
  const warrantyMs     = appliance.warranty_months * 30 * 24 * 60 * 60 * 1000
  const warrantyEndMs  = purchaseDateMs ? purchaseDateMs + warrantyMs : null
  const daysLeft       = warrantyEndMs ? Math.round((warrantyEndMs - Date.now()) / 86400000) : null
  const status         = daysLeft !== null ? calcStatus(daysLeft) : 'active'

  const warrantyEndStr = warrantyEndMs
    ? new Date(warrantyEndMs).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const purchaseDateStr = appliance.purchase_date
    ? new Date(appliance.purchase_date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const chatHref = `/chat?product=${encodeURIComponent(appliance.appliance_type)}&brand=${encodeURIComponent(appliance.brand)}&model=${encodeURIComponent(appliance.model)}`

  const progressPct = daysLeft !== null && warrantyMs > 0
    ? Math.max(5, Math.round(((warrantyMs / 86400000 - Math.max(0, daysLeft)) / (warrantyMs / 86400000)) * 100))
    : status === 'expired' ? 100 : 50

  return (
    <div style={{ background: '#FAFBFC', minHeight: '100%', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E8ECF0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/my-appliances" style={{ width: 32, height: 32, background: '#0F1419', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#0F1419', margin: 0 }}>製品詳細</p>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Product card */}
        <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 16, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, boxShadow: '0 1px 4px rgba(15,20,25,0.06)' }}>
          <div style={{ width: 72, height: 72, background: '#F4F6F8', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ApplianceIcon type={appliance.appliance_type} size={40} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#0F1419', margin: 0 }}>{appliance.appliance_type}</p>
            <p style={{ fontSize: 13, color: '#98A2AE', margin: '4px 0' }}>
              {[appliance.model, appliance.brand].filter(Boolean).join(' · ')}
            </p>
            <Badge status={status} />
          </div>

          {daysLeft !== null && (
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#98A2AE' }}>保証期間</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: statusColor[status], fontFamily: "'DM Sans', sans-serif" }}>
                  {status === 'expired' ? '期限切れ' : `残 ${formatDaysRemaining(Math.max(0, daysLeft))}`}
                </span>
              </div>
              <div style={{ height: 8, background: '#F4F6F8', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progressPct}%`, background: statusColor[status], borderRadius: 4 }} />
              </div>
              {warrantyEndStr && (
                <p style={{ fontSize: 10, color: '#98A2AE', margin: '4px 0 0', textAlign: 'right' }}>{warrantyEndStr}まで</p>
              )}
            </div>
          )}
        </div>

        {/* Product info */}
        <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,20,25,0.06)' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8ECF0' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#5B6570', margin: 0 }}>製品情報</p>
          </div>
          {[
            { label: '製品の種類', value: appliance.appliance_type },
            appliance.brand  ? { label: 'ブランド', value: appliance.brand }  : null,
            appliance.model  ? { label: 'モデル番号', value: appliance.model }  : null,
            purchaseDateStr  ? { label: '購入日',   value: purchaseDateStr }  : null,
            appliance.store_name ? { label: '購入店舗', value: appliance.store_name } : null,
            warrantyEndStr   ? { label: '保証終了日', value: warrantyEndStr } : null,
          ]
            .filter(Boolean)
            .map((row, i, arr) => (
              <div key={row!.label} style={{ display: 'flex', padding: '11px 16px', borderBottom: i < arr.length - 1 ? '1px solid #E8ECF0' : 'none' }}>
                <span style={{ fontSize: 12, color: '#98A2AE', flex: '0 0 100px' }}>{row!.label}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#0F1419', wordBreak: 'break-all' }}>{row!.value}</span>
              </div>
            ))}
        </div>

        {/* AI Chat button */}
        <Link href={chatHref} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#0F1419', color: 'white', borderRadius: 100, height: 50, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M15 1.5H3C2.175 1.5 1.5 2.175 1.5 3V16.5L4.5 13.5H15C15.825 13.5 16.5 12.825 16.5 12V3C16.5 2.175 15.825 1.5 15 1.5Z" fill="white" />
          </svg>
          この製品についてAIに相談
        </Link>

        {/* Delete */}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{ background: 'none', border: 'none', color: '#98A2AE', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', textAlign: 'center', padding: 4 }}
          >
            この家電を削除する
          </button>
        ) : (
          <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 600, margin: 0, textAlign: 'center' }}>本当に削除しますか？</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, height: 38, border: '1px solid #E8ECF0', borderRadius: 100, background: 'white', fontSize: 13, cursor: 'pointer' }}>
                キャンセル
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, height: 38, border: 'none', borderRadius: 100, background: '#DC2626', color: 'white', fontSize: 13, fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer' }}>
                {deleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
