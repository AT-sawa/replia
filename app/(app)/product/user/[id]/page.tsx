'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
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
  image_url: string | null
  created_at: string
  receipt_photo_url: string | null
  warranty_photo_url: string | null
  manual_url: string | null
  notes: string | null
}

interface HistoryEntry {
  id: string
  symptom: string
  tried_solutions: string | null
  status: string
  warranty_status: string | null
  created_at: string
}

interface Reminder {
  id: string
  title: string
  interval_months: number
  last_done_date: string | null
  next_due_date: string | null
  enabled: boolean
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

function getDueStatus(nextDue: string | null): 'overdue' | 'soon' | 'ok' | 'unset' {
  if (!nextDue) return 'unset'
  const days = Math.round((new Date(nextDue).getTime() - Date.now()) / 86400000)
  if (days < 0) return 'overdue'
  if (days <= 30) return 'soon'
  return 'ok'
}

async function uploadToStorage(file: File, path: string): Promise<string | null> {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase.storage.from('appliance-photos').upload(path, file, { upsert: true })
    if (error) return null
    const { data } = supabase.storage.from('appliance-photos').getPublicUrl(path)
    return data.publicUrl
  } catch {
    return null
  }
}

// ── Skeleton components ───────────────────────────────────────────────────────
function Sk({ w = '100%', h = 14, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r }} />
}

function ProductCardSkeleton() {
  return (
    <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 16, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(15,20,25,0.06)' }}>
      <div className="skeleton" style={{ width: 72, height: 72, borderRadius: 16 }} />
      <Sk w={140} h={20} r={8} />
      <Sk w={100} h={14} r={6} />
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Sk w={60} h={10} r={4} />
          <Sk w={70} h={10} r={4} />
        </div>
        <Sk w="100%" h={8} r={4} />
      </div>
    </div>
  )
}

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,20,25,0.06)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8ECF0' }}>
        <Sk w={80} h={12} r={4} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', padding: '11px 16px', gap: 12, borderBottom: i < rows - 1 ? '1px solid #E8ECF0' : 'none', alignItems: 'center' }}>
          <Sk w={80} h={12} r={4} />
          <Sk w={120} h={12} r={4} />
        </div>
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function UserProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [appliance, setAppliance] = useState<Appliance | null>(null)
  const [appLoading, setAppLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Notes / Memo
  const [notes, setNotes] = useState('')
  const [notesEditMode, setNotesEditMode] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)

  // Documents section
  const [docEditMode, setDocEditMode] = useState(false)
  const [manualUrl, setManualUrl] = useState('')
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [warrantyDocUrl, setWarrantyDocUrl] = useState<string | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [warrantyDocFile, setWarrantyDocFile] = useState<File | null>(null)
  const [savingDocs, setSavingDocs] = useState(false)
  const receiptFileRef = useRef<HTMLInputElement>(null)
  const warrantyDocFileRef = useRef<HTMLInputElement>(null)

  // Reminders
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showAddReminder, setShowAddReminder] = useState(false)
  const [newReminderTitle, setNewReminderTitle] = useState('')
  const [newReminderInterval, setNewReminderInterval] = useState('1')
  const [newReminderLastDone, setNewReminderLastDone] = useState('')
  const [savingReminder, setSavingReminder] = useState(false)

  // Repair/trouble history
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [showAddHistory, setShowAddHistory] = useState(false)
  const [newSymptom, setNewSymptom] = useState('')
  const [newTried, setNewTried] = useState('')
  const [newStatus, setNewStatus] = useState('対応中')
  const [savingHistory, setSavingHistory] = useState(false)

  useEffect(() => {
    // Appliance (main — blocks skeleton)
    fetch(`/api/appliances/${params.id}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); return null }
        return r.json()
      })
      .then(d => {
        if (!d) return
        setAppliance(d.appliance)
        setNotes(d.appliance.notes || '')
        setManualUrl(d.appliance.manual_url || '')
        setReceiptUrl(d.appliance.receipt_photo_url || null)
        setWarrantyDocUrl(d.appliance.warranty_photo_url || null)
      })
      .finally(() => setAppLoading(false))

    // History (non-blocking — shows once ready)
    fetch(`/api/appliances/${params.id}/history`)
      .then(r => r.json())
      .then(d => setHistory(d.history ?? []))
      .catch(() => {})

    // Reminders (non-blocking — shows once ready)
    fetch(`/api/appliances/${params.id}/reminders`)
      .then(r => r.json())
      .then(d => setReminders(d.reminders ?? []))
      .catch(() => {})
  }, [params.id])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    await fetch(`/api/appliances/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: notes.trim() || null }),
    })
    if (appliance) setAppliance({ ...appliance, notes: notes.trim() || null })
    setNotesEditMode(false)
    setSavingNotes(false)
  }

  const handleSaveDocs = async () => {
    setSavingDocs(true)
    let newReceiptUrl = receiptUrl
    let newWarrantyDocUrl = warrantyDocUrl

    if (receiptFile) {
      const ext = receiptFile.name.split('.').pop() ?? 'jpg'
      const url = await uploadToStorage(receiptFile, `receipts/${params.id}-receipt-${Date.now()}.${ext}`)
      if (url) newReceiptUrl = url
    }
    if (warrantyDocFile) {
      const ext = warrantyDocFile.name.split('.').pop() ?? 'jpg'
      const url = await uploadToStorage(warrantyDocFile, `receipts/${params.id}-warranty-${Date.now()}.${ext}`)
      if (url) newWarrantyDocUrl = url
    }

    await fetch(`/api/appliances/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        manual_url: manualUrl || null,
        receipt_photo_url: newReceiptUrl,
        warranty_photo_url: newWarrantyDocUrl,
      }),
    })

    setReceiptUrl(newReceiptUrl)
    setWarrantyDocUrl(newWarrantyDocUrl)
    setReceiptFile(null)
    setWarrantyDocFile(null)
    setDocEditMode(false)
    setSavingDocs(false)
  }

  const handleAddReminder = async () => {
    if (!newReminderTitle.trim()) return
    setSavingReminder(true)
    try {
      const res = await fetch(`/api/appliances/${params.id}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newReminderTitle,
          interval_months: parseInt(newReminderInterval),
          last_done_date: newReminderLastDone || null,
        }),
      })
      if (res.ok) {
        const d = await res.json()
        setReminders(prev => [...prev, d.reminder])
        setNewReminderTitle('')
        setNewReminderInterval('1')
        setNewReminderLastDone('')
        setShowAddReminder(false)
      }
    } catch { /* silent */ }
    finally { setSavingReminder(false) }
  }

  const handleMarkDone = async (r: Reminder) => {
    const today = new Date().toISOString().split('T')[0]
    try {
      const res = await fetch(`/api/appliances/${params.id}/reminders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rid: r.id, last_done_date: today, interval_months: r.interval_months }),
      })
      if (res.ok) {
        const d = await res.json()
        setReminders(prev => prev.map(x => x.id === r.id ? d.reminder : x))
      }
    } catch { /* silent */ }
  }

  const handleAddHistory = async () => {
    if (!newSymptom.trim()) return
    setSavingHistory(true)
    try {
      const res = await fetch(`/api/appliances/${params.id}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptom: newSymptom, tried_solutions: newTried, status: newStatus }),
      })
      if (res.ok) {
        const d = await res.json()
        setHistory(prev => [d.entry, ...prev])
        setNewSymptom('')
        setNewTried('')
        setNewStatus('対応中')
        setShowAddHistory(false)
      }
    } catch { /* silent */ }
    finally { setSavingHistory(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    await fetch(`/api/appliances/${params.id}`, { method: 'DELETE' })
    router.push('/my-appliances')
  }

  // ── Computed values (only when appliance loaded) ──────────────────────────
  const purchaseDateMs = appliance?.purchase_date ? new Date(appliance.purchase_date).getTime() : null
  const warrantyMs     = (appliance?.warranty_months ?? 12) * 30 * 24 * 60 * 60 * 1000
  const warrantyEndMs  = purchaseDateMs ? purchaseDateMs + warrantyMs : null
  const daysLeft       = warrantyEndMs ? Math.round((warrantyEndMs - Date.now()) / 86400000) : null
  const status         = daysLeft !== null ? calcStatus(daysLeft) : 'active'

  const warrantyEndStr = warrantyEndMs
    ? new Date(warrantyEndMs).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const purchaseDateStr = appliance?.purchase_date
    ? new Date(appliance.purchase_date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const chatHref = appliance
    ? `/chat?product=${encodeURIComponent(appliance.appliance_type)}&brand=${encodeURIComponent(appliance.brand)}&model=${encodeURIComponent(appliance.model)}`
    : '/chat'

  const progressPct = daysLeft !== null && warrantyMs > 0
    ? Math.max(5, Math.round(((warrantyMs / 86400000 - Math.max(0, daysLeft)) / (warrantyMs / 86400000)) * 100))
    : status === 'expired' ? 100 : 50

  const overdueSoon = reminders.filter(r => {
    const s = getDueStatus(r.next_due_date)
    return r.enabled && (s === 'overdue' || s === 'soon')
  }).length

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#FAFBFC', minHeight: '100%', width: '100%', boxSizing: 'border-box' }}>

      {/* Header — always visible */}
      <div style={{ background: 'white', borderBottom: '1px solid #E8ECF0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/my-appliances" style={{ width: 32, height: 32, background: '#0F1419', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#0F1419', margin: 0 }}>製品詳細</p>
      </div>

      {/* Not found */}
      {!appLoading && notFound && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '80px 20px' }}>
          <p style={{ color: '#0F1419', fontWeight: 700, fontSize: 15, margin: 0 }}>製品が見つかりません</p>
          <Link href="/my-appliances" style={{ color: '#2563EB', fontSize: 13 }}>マイ家電に戻る</Link>
        </div>
      )}

      {/* Content */}
      {!notFound && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ── Product card ── */}
          {appLoading ? <ProductCardSkeleton /> : (
            <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 16, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, boxShadow: '0 1px 4px rgba(15,20,25,0.06)' }}>
              <div style={{ width: 72, height: 72, background: '#F4F6F8', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {appliance!.image_url ? (
                  <img src={appliance!.image_url} alt={appliance!.appliance_type}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <ApplianceIcon type={appliance!.appliance_type} size={40} />
                )}
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#0F1419', margin: 0 }}>{appliance!.appliance_type}</p>
                <p style={{ fontSize: 13, color: '#98A2AE', margin: '4px 0' }}>
                  {[appliance!.model, appliance!.brand].filter(Boolean).join(' · ')}
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
                    <div style={{ height: '100%', width: `${progressPct}%`, background: statusColor[status], borderRadius: 4, transition: 'width 0.6s ease' }} />
                  </div>
                  {warrantyEndStr && (
                    <p style={{ fontSize: 10, color: '#98A2AE', margin: '4px 0 0', textAlign: 'right' }}>{warrantyEndStr}まで</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Product info ── */}
          {appLoading ? <SectionSkeleton rows={4} /> : (
            <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,20,25,0.06)' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8ECF0' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#5B6570', margin: 0 }}>製品情報</p>
              </div>
              {[
                { label: '製品の種類', value: appliance!.appliance_type },
                appliance!.brand      ? { label: 'ブランド',   value: appliance!.brand }      : null,
                appliance!.model      ? { label: 'モデル番号', value: appliance!.model }      : null,
                purchaseDateStr       ? { label: '購入日',     value: purchaseDateStr }       : null,
                appliance!.store_name ? { label: '購入店舗',   value: appliance!.store_name } : null,
                warrantyEndStr        ? { label: '保証終了日', value: warrantyEndStr }        : null,
              ]
                .filter(Boolean)
                .map((row, i, arr) => (
                  <div key={row!.label} style={{ display: 'flex', padding: '11px 16px', borderBottom: i < arr.length - 1 ? '1px solid #E8ECF0' : 'none' }}>
                    <span style={{ fontSize: 12, color: '#98A2AE', flex: '0 0 90px' }}>{row!.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#0F1419', wordBreak: 'break-all' }}>{row!.value}</span>
                  </div>
                ))}
            </div>
          )}

          {/* ── Memo section ── */}
          {!appLoading && (
            <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,20,25,0.06)' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8ECF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#5B6570', margin: 0 }}>メモ</p>
                <button
                  onClick={() => { if (notesEditMode) { setNotes(appliance?.notes || '') } setNotesEditMode(v => !v) }}
                  style={{ fontSize: 11, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                >
                  {notesEditMode ? 'キャンセル' : '✎ 編集'}
                </button>
              </div>
              {notesEditMode ? (
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="この製品に関するメモを自由に書けます（購入経緯、設置場所、カスタマイズ内容など）"
                    rows={5}
                    style={{ width: '100%', border: '1.5px solid #E8ECF0', borderRadius: 8, padding: '10px 12px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6 }}
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    style={{ height: 38, background: '#0F1419', color: 'white', border: 'none', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: savingNotes ? 'not-allowed' : 'pointer', opacity: savingNotes ? 0.7 : 1 }}
                  >
                    {savingNotes ? '保存中...' : '保存する'}
                  </button>
                </div>
              ) : (
                <div style={{ padding: '12px 16px' }}>
                  {notes ? (
                    <p style={{ fontSize: 13, color: '#0F1419', margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{notes}</p>
                  ) : (
                    <p style={{ fontSize: 12, color: '#C5CAD0', margin: 0 }}>メモはありません。「✎ 編集」から追加できます。</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Documents section ── */}
          {!appLoading && (
            <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,20,25,0.06)' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8ECF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#5B6570', margin: 0 }}>書類・マニュアル</p>
                <button
                  onClick={() => setDocEditMode(v => !v)}
                  style={{ fontSize: 11, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                >
                  {docEditMode ? '閉じる' : '✎ 編集'}
                </button>
              </div>

              {docEditMode ? (
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#5B6570', fontWeight: 600, display: 'block', marginBottom: 4 }}>取扱説明書URL</label>
                    <input
                      type="url"
                      value={manualUrl}
                      onChange={e => setManualUrl(e.target.value)}
                      placeholder="https://panasonic.net/..."
                      style={{ width: '100%', height: 40, border: '1.5px solid #E8ECF0', borderRadius: 8, padding: '0 12px', fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#5B6570', fontWeight: 600, display: 'block', marginBottom: 4 }}>領収書・レシート</label>
                    <input ref={receiptFileRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) setReceiptFile(f) }} />
                    <div onClick={() => receiptFileRef.current?.click()}
                      style={{ border: `1.5px dashed ${receiptFile || receiptUrl ? '#86EFAC' : '#E8ECF0'}`, borderRadius: 8, padding: '10px 12px', cursor: 'pointer', background: receiptFile || receiptUrl ? '#F0FDF4' : 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>🧾</span>
                      <span style={{ fontSize: 12, color: receiptFile || receiptUrl ? '#059669' : '#98A2AE' }}>
                        {receiptFile ? `✓ ${receiptFile.name}` : receiptUrl ? '✓ 登録済み（タップで変更）' : '写真をタップして追加'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#5B6570', fontWeight: 600, display: 'block', marginBottom: 4 }}>保証書</label>
                    <input ref={warrantyDocFileRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) setWarrantyDocFile(f) }} />
                    <div onClick={() => warrantyDocFileRef.current?.click()}
                      style={{ border: `1.5px dashed ${warrantyDocFile || warrantyDocUrl ? '#86EFAC' : '#E8ECF0'}`, borderRadius: 8, padding: '10px 12px', cursor: 'pointer', background: warrantyDocFile || warrantyDocUrl ? '#F0FDF4' : 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>📋</span>
                      <span style={{ fontSize: 12, color: warrantyDocFile || warrantyDocUrl ? '#059669' : '#98A2AE' }}>
                        {warrantyDocFile ? `✓ ${warrantyDocFile.name}` : warrantyDocUrl ? '✓ 登録済み（タップで変更）' : '写真をタップして追加'}
                      </span>
                    </div>
                  </div>
                  <button onClick={handleSaveDocs} disabled={savingDocs}
                    style={{ height: 38, background: '#0F1419', color: 'white', border: 'none', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: savingDocs ? 'not-allowed' : 'pointer', opacity: savingDocs ? 0.7 : 1 }}>
                    {savingDocs ? '保存中...' : '保存する'}
                  </button>
                </div>
              ) : (
                <div>
                  {manualUrl ? (
                    <a href={manualUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', padding: '11px 16px', gap: 10, textDecoration: 'none', borderBottom: '1px solid #F4F6F8', alignItems: 'center' }}>
                      <span style={{ fontSize: 16 }}>📖</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#2563EB', flex: 1 }}>取扱説明書を開く</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 10L10 2M10 2H4M10 2V8" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </a>
                  ) : (
                    <div style={{ display: 'flex', padding: '11px 16px', gap: 10, alignItems: 'center', borderBottom: '1px solid #F4F6F8' }}>
                      <span style={{ fontSize: 16 }}>📖</span>
                      <span style={{ fontSize: 12, color: '#C5CAD0' }}>取扱説明書（未登録）</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', padding: '11px 16px', gap: 10, alignItems: 'center', borderBottom: '1px solid #F4F6F8' }}>
                    <span style={{ fontSize: 16 }}>🧾</span>
                    {receiptUrl
                      ? <a href={receiptUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 500, color: '#2563EB', textDecoration: 'none' }}>領収書・レシートを開く</a>
                      : <span style={{ fontSize: 12, color: '#C5CAD0' }}>領収書・レシート（未登録）</span>}
                  </div>
                  <div style={{ display: 'flex', padding: '11px 16px', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 16 }}>📋</span>
                    {warrantyDocUrl
                      ? <a href={warrantyDocUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 500, color: '#2563EB', textDecoration: 'none' }}>保証書を開く</a>
                      : <span style={{ fontSize: 12, color: '#C5CAD0' }}>保証書（未登録）</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Edit button ── */}
          {!appLoading && (
            <Link
              href={`/product/user/${params.id}/edit`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'white', color: '#0F1419', border: '1.5px solid #E8ECF0', borderRadius: 100, height: 46, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4C2.9 4 2 4.9 2 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7" stroke="#0F1419" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5Z" stroke="#0F1419" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              編集する
            </Link>
          )}

          {/* ── Maintenance Reminders ── */}
          {!appLoading && (
            <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,20,25,0.06)' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8ECF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#5B6570', margin: 0 }}>メンテナンス</p>
                  {overdueSoon > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: '#FEF3C7', color: '#D97706', padding: '1px 6px', borderRadius: 100 }}>
                      要確認 {overdueSoon}件
                    </span>
                  )}
                </div>
                <button onClick={() => setShowAddReminder(v => !v)}
                  style={{ fontSize: 11, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                  {showAddReminder ? '閉じる' : '+ 追加'}
                </button>
              </div>

              {showAddReminder && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8ECF0', background: '#FAFBFC', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    placeholder="メンテナンス名（例：エアコンフィルター掃除）"
                    value={newReminderTitle}
                    onChange={e => setNewReminderTitle(e.target.value)}
                    style={{ height: 40, border: '1.5px solid #E8ECF0', borderRadius: 8, padding: '0 12px', fontSize: 13, boxSizing: 'border-box', width: '100%', fontFamily: 'inherit' }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, color: '#5B6570', display: 'block', marginBottom: 3 }}>繰り返し</label>
                      <select value={newReminderInterval} onChange={e => setNewReminderInterval(e.target.value)}
                        style={{ width: '100%', height: 38, border: '1.5px solid #E8ECF0', borderRadius: 8, padding: '0 8px', fontSize: 13, background: 'white' }}>
                        {([['1','毎月'],['2','2ヶ月'],['3','3ヶ月'],['6','6ヶ月'],['12','1年'],['24','2年']] as [string,string][]).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, color: '#5B6570', display: 'block', marginBottom: 3 }}>最後に実施した日</label>
                      <input type="date" value={newReminderLastDone} onChange={e => setNewReminderLastDone(e.target.value)}
                        style={{ width: '100%', height: 38, border: '1.5px solid #E8ECF0', borderRadius: 8, padding: '0 8px', fontSize: 13, boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <button onClick={handleAddReminder}
                    disabled={savingReminder || !newReminderTitle.trim()}
                    style={{ height: 38, background: '#0F1419', color: 'white', border: 'none', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: (savingReminder || !newReminderTitle.trim()) ? 'not-allowed' : 'pointer', opacity: (savingReminder || !newReminderTitle.trim()) ? 0.5 : 1 }}>
                    {savingReminder ? '保存中...' : '追加する'}
                  </button>
                </div>
              )}

              {reminders.length === 0 && !showAddReminder && (
                <p style={{ fontSize: 12, color: '#98A2AE', textAlign: 'center', padding: '20px 16px', margin: 0 }}>まだリマインダーはありません</p>
              )}
              {reminders.map((r, i) => {
                const dueStatus = getDueStatus(r.next_due_date)
                return (
                  <div key={r.id} style={{ padding: '12px 16px', borderBottom: i < reminders.length - 1 ? '1px solid #F4F6F8' : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: r.enabled ? '#0F1419' : '#98A2AE', margin: 0 }}>{r.title}</p>
                        {r.enabled && dueStatus === 'overdue' && (
                          <span style={{ fontSize: 10, fontWeight: 700, background: '#FEE2E2', color: '#DC2626', padding: '1px 6px', borderRadius: 100 }}>期限切れ</span>
                        )}
                        {r.enabled && dueStatus === 'soon' && (
                          <span style={{ fontSize: 10, fontWeight: 700, background: '#FEF3C7', color: '#D97706', padding: '1px 6px', borderRadius: 100 }}>まもなく</span>
                        )}
                      </div>
                      <p style={{ fontSize: 11, color: '#98A2AE', margin: 0 }}>
                        {r.next_due_date
                          ? `次回: ${new Date(r.next_due_date).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}`
                          : `${r.interval_months}ヶ月ごと（最終実施未設定）`}
                      </p>
                    </div>
                    <button onClick={() => handleMarkDone(r)}
                      style={{ flexShrink: 0, height: 30, padding: '0 10px', fontSize: 11, fontWeight: 600, border: '1px solid #E8ECF0', borderRadius: 100, background: 'white', color: '#5B6570', cursor: 'pointer' }}>
                      完了
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Repair / Trouble History ── */}
          {!appLoading && (
            <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,20,25,0.06)' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8ECF0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#5B6570', margin: 0 }}>修理・トラブル履歴</p>
                <button onClick={() => setShowAddHistory(v => !v)}
                  style={{ fontSize: 11, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                  {showAddHistory ? '閉じる' : '+ 記録を追加'}
                </button>
              </div>

              {showAddHistory && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8ECF0', background: '#FAFBFC', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea
                    placeholder="トラブルの内容（必須）"
                    value={newSymptom}
                    onChange={e => setNewSymptom(e.target.value)}
                    style={{ width: '100%', minHeight: 64, border: '1.5px solid #E8ECF0', borderRadius: 8, padding: '8px 10px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                  <textarea
                    placeholder="試したこと（任意）"
                    value={newTried}
                    onChange={e => setNewTried(e.target.value)}
                    style={{ width: '100%', minHeight: 48, border: '1.5px solid #E8ECF0', borderRadius: 8, padding: '8px 10px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                    style={{ height: 38, border: '1.5px solid #E8ECF0', borderRadius: 8, padding: '0 10px', fontSize: 13, background: 'white' }}>
                    <option value="対応中">対応中</option>
                    <option value="解決済み">解決済み</option>
                    <option value="修理依頼済み">修理依頼済み</option>
                  </select>
                  <button onClick={handleAddHistory}
                    disabled={savingHistory || !newSymptom.trim()}
                    style={{ height: 38, background: '#0F1419', color: 'white', border: 'none', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: (savingHistory || !newSymptom.trim()) ? 'not-allowed' : 'pointer', opacity: (savingHistory || !newSymptom.trim()) ? 0.5 : 1 }}>
                    {savingHistory ? '保存中...' : '保存する'}
                  </button>
                </div>
              )}

              {history.length === 0 && !showAddHistory && (
                <p style={{ fontSize: 12, color: '#98A2AE', textAlign: 'center', padding: '20px 16px', margin: 0 }}>まだ記録はありません</p>
              )}
              {history.map((h, i) => (
                <div key={h.id} style={{ padding: '12px 16px', borderBottom: i < history.length - 1 ? '1px solid #F4F6F8' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: '#98A2AE' }}>
                      {new Date(h.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                      background: h.status === '解決済み' ? '#DCFCE7' : h.status === '修理依頼済み' ? '#FEF3C7' : '#EFF6FF',
                      color: h.status === '解決済み' ? '#059669' : h.status === '修理依頼済み' ? '#D97706' : '#2563EB',
                    }}>
                      {h.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#0F1419', margin: '0 0 4px' }}>{h.symptom}</p>
                  {h.tried_solutions && (
                    <p style={{ fontSize: 11, color: '#5B6570', margin: 0 }}>試したこと: {h.tried_solutions}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── AI Chat — 一番下 ── */}
          {!appLoading && (
            <Link href={chatHref} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#0F1419', color: 'white', borderRadius: 100, height: 50, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M15 1.5H3C2.175 1.5 1.5 2.175 1.5 3V16.5L4.5 13.5H15C15.825 13.5 16.5 12.825 16.5 12V3C16.5 2.175 15.825 1.5 15 1.5Z" fill="white" />
              </svg>
              この製品についてAIに相談
            </Link>
          )}

          {/* ── Delete ── */}
          {!appLoading && (
            !confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                style={{ background: 'none', border: 'none', color: '#98A2AE', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', textAlign: 'center', padding: 4 }}>
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
            )
          )}

          {/* Bottom spacing */}
          <div style={{ height: 8 }} />

        </div>
      )}
    </div>
  )
}
