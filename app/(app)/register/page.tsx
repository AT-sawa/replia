'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ApplianceIcon } from '@/components/ui/ApplianceIcon'

const APPLIANCE_TYPES = [
  'エアコン', '洗濯機', '冷蔵庫', 'テレビ', '電子レンジ',
  '食洗機', '掃除機', '炊飯器', 'ドライヤー', 'その他',
]

export default function RegisterPage() {
  const router = useRouter()
  const [applianceType, setApplianceType] = useState('')
  const [brand, setBrand] = useState('')
  const [modelNumber, setModelNumber] = useState('')
  const [purchaseYear, setPurchaseYear] = useState('')
  const [purchaseMonth, setPurchaseMonth] = useState('')
  const [purchaseDay, setPurchaseDay] = useState('')
  const [storeName, setStoreName] = useState('')
  const [saveError, setSaveError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Product image from model number
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)

  // Auto-fetch product image + brand when model number changes (debounced)
  useEffect(() => {
    const trimmed = modelNumber.trim()
    if (trimmed.length < 3) {
      setProductImageUrl(null)
      return
    }
    const timer = setTimeout(async () => {
      setImageLoading(true)
      try {
        const res = await fetch(`/api/product-image?model=${encodeURIComponent(trimmed)}`)
        const data = await res.json()
        setProductImageUrl(data.imageUrl ?? null)
        // Auto-fill brand only if the user hasn't typed one themselves
        if (data.brand && !brand.trim()) {
          setBrand(data.brand)
        }
      } catch {
        setProductImageUrl(null)
      } finally {
        setImageLoading(false)
      }
    }, 900)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelNumber])

  // Receipt scanner
  const [receiptLoading, setReceiptLoading] = useState(false)
  const [receiptSuccess, setReceiptSuccess] = useState(false)
  const receiptInputRef = useRef<HTMLInputElement>(null)

  const handleReceiptFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setReceiptLoading(true)
    setReceiptSuccess(false)

    try {
      // Resize to max 1024px using Canvas API before sending
      const bitmap = await createImageBitmap(file)
      const MAX = 1024
      const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(bitmap.width * scale)
      canvas.height = Math.round(bitmap.height * scale)
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1]

      const res = await fetch('/api/read-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType: 'image/jpeg' }),
      })
      const data = await res.json()

      if (data.modelNumber) setModelNumber(data.modelNumber)
      if (data.purchaseDate) {
        const [y, m, d] = data.purchaseDate.split('-')
        if (y) setPurchaseYear(y)
        if (m) setPurchaseMonth(String(parseInt(m)))
        if (d) setPurchaseDay(String(parseInt(d)))
      }
      if (data.storeName) setStoreName(data.storeName)
      setReceiptSuccess(true)
    } catch {
      // silent fail — user can fill in manually
    } finally {
      setReceiptLoading(false)
      e.target.value = ''
    }
  }

  // Barcode scanner
  const [showScanner, setShowScanner] = useState(false)
  const [scanMessage, setScanMessage] = useState('バーコードをカメラに向けてください')
  const [scanError, setScanError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningRef = useRef(false)
  const animFrameRef = useRef<number | null>(null)

  const stopScanner = useCallback(() => {
    scanningRef.current = false
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setShowScanner(false)
  }, [])

  useEffect(() => () => { stopScanner() }, [stopScanner])

  const startScanner = async () => {
    setScanError('')
    setScanMessage('バーコードをカメラに向けてください')
    setShowScanner(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ('BarcodeDetector' in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const detector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'code_93', 'qr_code'],
        })
        scanningRef.current = true
        const scan = async () => {
          if (!scanningRef.current || !videoRef.current) return
          try {
            const results = await detector.detect(videoRef.current)
            if (results.length > 0) {
              setModelNumber(results[0].rawValue)
              stopScanner()
              return
            }
          } catch {}
          if (scanningRef.current) animFrameRef.current = requestAnimationFrame(scan)
        }
        animFrameRef.current = requestAnimationFrame(scan)
      } else {
        setScanError('このブラウザはバーコードスキャンに未対応です。\nAndroid Chrome または PC Chrome をお試しください。')
      }
    } catch {
      setScanError('カメラへのアクセスが拒否されました。\nブラウザの設定でカメラを許可してください。')
    }
  }

  // Photo upload
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photoName, setPhotoName] = useState('')

  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPhotoName(file.name)
    e.target.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError('')
    setSubmitted(true)
    try {
      const res = await fetch('/api/appliances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appliance_type:  applianceType || 'その他',
          brand,
          model:           modelNumber,
          purchase_date:   (purchaseYear && purchaseMonth && purchaseDay)
            ? `${purchaseYear}-${purchaseMonth.padStart(2,'0')}-${purchaseDay.padStart(2,'0')}`
            : null,
          warranty_months: 12,
          store_name:      storeName,
          image_url:       productImageUrl,
        }),
      })
      if (!res.ok) {
        setSaveError('保存に失敗しました。もう一度お試しください。')
        setSubmitted(false)
        return
      }
      router.push('/my-appliances')
    } catch {
      setSaveError('ネットワークエラーが発生しました。接続を確認してください。')
      setSubmitted(false)
    }
  }

  return (
    <div style={{ background: '#FAFBFC', minHeight: '100%' }}>
      <style>{`@keyframes scanLine{0%{top:12%}50%{top:82%}100%{top:12%}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Barcode Scanner Modal ── */}
      {showScanner && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 300, aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
            <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {!scanError && (
              <>
                {[{top:16,left:16,bt:'borderTop',bl:'borderLeft',br:'2px 0 0 0'},{top:16,right:16,bt:'borderTop',bl:'borderRight',br:'0 2px 0 0'},{bottom:16,left:16,bt:'borderBottom',bl:'borderLeft',br:'0 0 0 2px'},{bottom:16,right:16,bt:'borderBottom',bl:'borderRight',br:'0 0 2px 0'}].map((c, i) => (
                  <div key={i} style={{ position: 'absolute', ...Object.fromEntries(Object.entries(c).filter(([k]) => !['bt','bl','br'].includes(k))), width: 24, height: 24, [c.bt]: '2px solid white', [c.bl]: '2px solid white', borderRadius: c.br }} />
                ))}
                <div style={{ position: 'absolute', left: '8%', right: '8%', height: 2, background: 'rgba(255,255,255,0.8)', animation: 'scanLine 2s ease-in-out infinite' }} />
              </>
            )}
          </div>
          <p style={{ color: 'white', fontSize: 13, marginTop: 18, textAlign: 'center', lineHeight: 1.7, whiteSpace: 'pre-line', maxWidth: 280 }}>
            {scanError || scanMessage}
          </p>
          <button onClick={stopScanner} style={{ marginTop: 16, color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, height: 42, padding: '0 24px', fontSize: 13, cursor: 'pointer' }}>
            キャンセル
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E8ECF0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ width: 32, height: 32, background: '#0F1419', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#0F1419', margin: 0 }}>保証登録</p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: 16 }}>
        {/* Product Preview Card */}
        <div style={{ background: 'white', border: '1px solid #E8ECF0', borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 4px rgba(15,20,25,0.06)' }}>
          {/* Image / Icon area */}
          <div style={{ width: 52, height: 52, background: '#F4F6F8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
            {productImageUrl ? (
              <img
                src={productImageUrl}
                alt={applianceType}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={() => setProductImageUrl(null)}
              />
            ) : imageLoading ? (
              <div style={{ width: 20, height: 20, border: '2px solid #E8ECF0', borderTopColor: '#0F1419', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : applianceType ? (
              <span style={{ color: '#5B6570' }}><ApplianceIcon type={applianceType} size={26} /></span>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="3" width="20" height="14" rx="2" stroke="#C5CAD0" strokeWidth="1.5" />
                <path d="M8 21H16M12 17V21" stroke="#C5CAD0" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: applianceType ? '#0F1419' : '#C5CAD0', margin: 0 }}>
              {applianceType ? `${applianceType}${brand ? ` · ${brand}` : ''}` : '製品の種類を選択してください'}
            </p>
            <p style={{ fontSize: 12, color: modelNumber ? '#5B6570' : '#C5CAD0', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {modelNumber || '型番を入力してください'}
            </p>
          </div>
        </div>

        {/* ── Receipt scan ── */}
        <input ref={receiptInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleReceiptFile} />
        <button
          type="button"
          onClick={() => receiptInputRef.current?.click()}
          disabled={receiptLoading}
          style={{
            width: '100%',
            border: `1.5px dashed ${receiptSuccess ? '#86EFAC' : '#E8ECF0'}`,
            borderRadius: 12, padding: '13px 16px',
            background: receiptSuccess ? '#F0FDF4' : 'white',
            display: 'flex', alignItems: 'center', gap: 10,
            cursor: receiptLoading ? 'not-allowed' : 'pointer', marginBottom: 16,
          }}
        >
          <div style={{ width: 36, height: 36, background: '#F4F6F8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M7 3H17a1 1 0 011 1v17l-3-2-2 2-2-2-2 2-3-2V4a1 1 0 011-1z" stroke="#5B6570" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 8h6M9 12h6M9 16h4" stroke="#5B6570" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: receiptSuccess ? '#16A34A' : '#0F1419' }}>
              {receiptLoading ? '読み取り中...' : receiptSuccess ? '✓ レシートから情報を取得しました' : 'レシートから自動入力'}
            </p>
            {!receiptSuccess && !receiptLoading && (
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#98A2AE' }}>型番・購入日・店舗名を自動で入力</p>
            )}
          </div>
          {receiptLoading && (
            <div style={{ width: 18, height: 18, border: '2px solid #E8ECF0', borderTopColor: '#0F1419', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          )}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>

          {/* Appliance Type */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>製品の種類</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {APPLIANCE_TYPES.map(t => (
                <button
                  key={t} type="button"
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

          {/* Model Number + Barcode Scan */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>型番</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text" value={modelNumber} onChange={(e) => setModelNumber(e.target.value)}
                placeholder="例：NA-VX900BL"
                style={{ flex: 1, height: 46, border: '1.5px solid #E8ECF0', borderRadius: 10, padding: '0 14px', fontSize: 14, color: '#0F1419', background: 'white', fontFamily: "'DM Sans', sans-serif" }}
              />
              <button
                type="button" onClick={startScanner} title="バーコードをスキャン"
                style={{ height: 46, width: 46, background: '#0F1419', border: 'none', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4M21 9V5a2 2 0 00-2-2h-4M21 15v4a2 2 0 01-2 2h-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M7 8v8M10 8v8M13 8v8M16 8v8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Brand */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>ブランド・メーカー</label>
            <input
              type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
              placeholder="例：Panasonic, SHARP, HITACHI"
              style={{ width: '100%', height: 46, border: '1.5px solid #E8ECF0', borderRadius: 10, padding: '0 14px', fontSize: 14, color: '#0F1419', background: 'white', fontFamily: "'Zen Kaku Gothic New', sans-serif", boxSizing: 'border-box' }}
            />
          </div>

          {/* Purchase Date — year / month / day selects */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>購入日</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* Year */}
              <select
                value={purchaseYear}
                onChange={(e) => setPurchaseYear(e.target.value)}
                style={{ flex: 2, height: 46, border: '1.5px solid #E8ECF0', borderRadius: 10, padding: '0 10px', fontSize: 14, color: purchaseYear ? '#0F1419' : '#98A2AE', background: 'white', appearance: 'none' }}
              >
                <option value="">年</option>
                {Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={String(y)}>{y}年</option>
                ))}
              </select>
              {/* Month */}
              <select
                value={purchaseMonth}
                onChange={(e) => setPurchaseMonth(e.target.value)}
                style={{ flex: 1, height: 46, border: '1.5px solid #E8ECF0', borderRadius: 10, padding: '0 10px', fontSize: 14, color: purchaseMonth ? '#0F1419' : '#98A2AE', background: 'white', appearance: 'none' }}
              >
                <option value="">月</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={String(m)}>{m}月</option>
                ))}
              </select>
              {/* Day */}
              <select
                value={purchaseDay}
                onChange={(e) => setPurchaseDay(e.target.value)}
                style={{ flex: 1, height: 46, border: '1.5px solid #E8ECF0', borderRadius: 10, padding: '0 10px', fontSize: 14, color: purchaseDay ? '#0F1419' : '#98A2AE', background: 'white', appearance: 'none' }}
              >
                <option value="">日</option>
                {Array.from(
                  { length: (purchaseYear && purchaseMonth)
                    ? new Date(parseInt(purchaseYear), parseInt(purchaseMonth), 0).getDate()
                    : 31
                  },
                  (_, i) => i + 1
                ).map(d => (
                  <option key={d} value={String(d)}>{d}日</option>
                ))}
              </select>
            </div>
          </div>

          {/* Store Name */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>購入店舗</label>
            <input
              type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)}
              placeholder="例：ヨドバシカメラ 新宿店"
              style={{ width: '100%', height: 46, border: '1.5px solid #E8ECF0', borderRadius: 10, padding: '0 14px', fontSize: 14, color: '#0F1419', background: 'white', fontFamily: "'Zen Kaku Gothic New', sans-serif" }}
            />
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>領収書・保証書の写真</label>
          <input ref={photoInputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handlePhotoFile} />
          <div
            onClick={() => photoInputRef.current?.click()}
            style={{
              border: `2px dashed ${photoName ? '#86EFAC' : '#E8ECF0'}`,
              borderRadius: 12, padding: '28px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              cursor: 'pointer', marginBottom: 20,
              background: photoName ? '#F0FDF4' : 'white',
            }}
          >
            <div style={{ width: 44, height: 44, background: '#F4F6F8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 17L7.5 11L10.5 15L13.5 11L19 17H3Z" stroke={photoName ? '#16A34A' : '#98A2AE'} strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="8" cy="7" r="2" stroke={photoName ? '#16A34A' : '#98A2AE'} strokeWidth="1.5" />
                <rect x="1" y="2" width="20" height="18" rx="3" stroke={photoName ? '#16A34A' : '#98A2AE'} strokeWidth="1.5" />
              </svg>
            </div>
            {photoName ? (
              <p style={{ fontSize: 13, color: '#16A34A', fontWeight: 600, margin: 0, textAlign: 'center' }}>✓ {photoName}</p>
            ) : (
              <>
                <p style={{ fontSize: 13, color: '#98A2AE', margin: 0, textAlign: 'center' }}>タップして写真をアップロード</p>
                <p style={{ fontSize: 11, color: '#C5CAD0', margin: 0 }}>JPG, PNG, PDF 対応</p>
              </>
            )}
          </div>
        </div>

        {saveError && (
          <p style={{ fontSize: 12, color: '#DC2626', textAlign: 'center', marginBottom: 8, marginTop: -4 }}>{saveError}</p>
        )}
        <button
          type="submit" disabled={submitted}
          style={{ background: '#0F1419', color: 'white', width: '100%', height: 50, borderRadius: 100, border: 'none', fontSize: 15, fontWeight: 700, cursor: submitted ? 'not-allowed' : 'pointer', opacity: submitted ? 0.7 : 1 }}
        >
          {submitted ? '登録中...' : '保証登録を完了する'}
        </button>
      </form>
    </div>
  )
}
