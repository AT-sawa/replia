'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const APPLIANCE_TYPES = [
  'エアコン', '洗濯機', '冷蔵庫', 'テレビ', '電子レンジ',
  '食洗機', '掃除機', '炊飯器', 'ドライヤー', 'その他',
]

export default function EditAppliancePage({ params }: { params: { id: string } }) {
  const router = useRouter()

  const [applianceType, setApplianceType] = useState('')
  const [brand, setBrand] = useState('')
  const [modelNumber, setModelNumber] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [storeName, setStoreName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Fetch current data
  useEffect(() => {
    fetch(`/api/appliances/${params.id}`)
      .then(r => r.json())
      .then(d => {
        const a = d.appliance
        if (!a) return
        setApplianceType(a.appliance_type || '')
        setBrand(a.brand || '')
        setModelNumber(a.model || '')
        setPurchaseDate(a.purchase_date || '')
        setStoreName(a.store_name || '')
      })
      .finally(() => setLoading(false))
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError('')
    setSaving(true)
    try {
      const res = await fetch(`/api/appliances/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appliance_type:  applianceType || 'その他',
          brand,
          model:           modelNumber,
          purchase_date:   purchaseDate || null,
          store_name:      storeName,
        }),
      })
      if (!res.ok) {
        setSaveError('保存に失敗しました。もう一度お試しください。')
        setSaving(false)
        return
      }
      router.push(`/product/user/${params.id}`)
    } catch {
      setSaveError('ネットワークエラーが発生しました。接続を確認してください。')
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ background: '#FAFBFC', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#98A2AE', fontSize: 13 }}>読み込み中...</p>
    </div>
  )

  return (
    <div style={{ background: '#FAFBFC', minHeight: '100%', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E8ECF0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link
          href={`/product/user/${params.id}`}
          style={{ width: 32, height: 32, background: '#0F1419', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#0F1419', margin: 0 }}>家電を編集</p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Appliance Type */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>製品の種類</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {APPLIANCE_TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setApplianceType(t)}
                style={{
                  height: 32, padding: '0 12px', borderRadius: 100,
                  border: applianceType === t ? 'none' : '1px solid #E8ECF0',
                  background: applianceType === t ? '#0F1419' : 'white',
                  color: applianceType === t ? 'white' : '#5B6570',
                  fontSize: 12, fontWeight: applianceType === t ? 600 : 400,
                  cursor: 'pointer',
                }}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* Brand */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>ブランド・メーカー</label>
          <input
            type="text"
            value={brand}
            onChange={e => setBrand(e.target.value)}
            placeholder="例：Panasonic, SHARP, HITACHI"
            style={{ width: '100%', height: 46, border: '1.5px solid #E8ECF0', borderRadius: 10, padding: '0 14px', fontSize: 14, color: '#0F1419', background: 'white', boxSizing: 'border-box', fontFamily: "'Zen Kaku Gothic New', sans-serif" }}
          />
        </div>

        {/* Model Number */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>型番</label>
          <input
            type="text"
            value={modelNumber}
            onChange={e => setModelNumber(e.target.value)}
            placeholder="例：NA-VX900BL"
            style={{ width: '100%', height: 46, border: '1.5px solid #E8ECF0', borderRadius: 10, padding: '0 14px', fontSize: 14, color: '#0F1419', background: 'white', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>

        {/* Purchase Date */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>購入日</label>
          <input
            type="date"
            value={purchaseDate}
            onChange={e => setPurchaseDate(e.target.value)}
            style={{ width: '100%', height: 46, border: '1.5px solid #E8ECF0', borderRadius: 10, padding: '0 14px', fontSize: 14, color: '#0F1419', background: 'white', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>

        {/* Store */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>購入店舗</label>
          <input
            type="text"
            value={storeName}
            onChange={e => setStoreName(e.target.value)}
            placeholder="例：ヨドバシカメラ 新宿店"
            style={{ width: '100%', height: 46, border: '1.5px solid #E8ECF0', borderRadius: 10, padding: '0 14px', fontSize: 14, color: '#0F1419', background: 'white', boxSizing: 'border-box', fontFamily: "'Zen Kaku Gothic New', sans-serif" }}
          />
        </div>

        {saveError && (
          <p style={{ fontSize: 12, color: '#DC2626', textAlign: 'center', margin: 0 }}>{saveError}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{ background: '#0F1419', color: 'white', width: '100%', height: 50, borderRadius: 100, border: 'none', fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? '保存中...' : '変更を保存する'}
        </button>
      </form>
    </div>
  )
}
