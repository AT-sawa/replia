'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ApplianceIcon } from '@/components/ui/ApplianceIcon'

const GENRE_CATEGORIES: Record<string, string[]> = {
  '生活家電': [
    'エアコン', '洗濯機', '洗濯乾燥機', '乾燥機', '冷蔵庫',
    '掃除機', 'ロボット掃除機', '空気清浄機', '加湿器', '除湿機', '扇風機',
  ],
  'キッチン家電': [
    '電子レンジ', 'オーブントースター', '炊飯器', '食洗機',
    '電気ケトル', 'コーヒーメーカー', 'ミキサー・ブレンダー',
    'ホットプレート', 'IHクッキングヒーター', '電気圧力鍋',
  ],
  '美容・健康家電': [
    'ドライヤー', 'ヘアアイロン', '電動歯ブラシ', '電気シェーバー',
    '体重計・体組成計', 'マッサージ機', '血圧計', '体温計',
  ],
  'AV機器・PC・スマホ': [
    'テレビ', 'PC・パソコン', 'スマートフォン', 'タブレット',
    'スピーカー', 'ヘッドホン・イヤホン', '録画機・レコーダー', 'プロジェクター',
  ],
  'カメラ': [
    'デジタルカメラ', '一眼レフカメラ', 'ミラーレスカメラ',
    'ビデオカメラ', 'アクションカメラ', 'ドローン',
  ],
  'ゲーム・ホビー・楽器': [
    'ゲーム機', '電子ピアノ・キーボード', 'ヘッドセット', 'DJ機器',
  ],
  '住宅設備・家具': [
    '給湯器', 'エコキュート', '太陽光パネル',
    'インターホン', '照明・シーリングライト', '電動シャッター',
  ],
  'カー用品・自転車': [
    'カーナビ', 'ドライブレコーダー', '電動自転車・E-Bike',
    'ETC車載器', 'レーダー探知機',
  ],
  '時計・スポーツ': [
    'スマートウォッチ', 'フィットネス機器', 'ランニングマシン',
  ],
  'DIY・工具': [
    '電動ドリル', '電動のこぎり', 'コンプレッサー', '電動サンダー',
  ],
  'アウトドア': [
    'ポータブル電源', 'ソーラーパネル', 'ポータブル冷蔵庫',
  ],
  'ベビー・ペット': [
    'ベビーモニター', 'ペット自動給餌器', 'ペット用空気清浄機',
  ],
  '生活雑貨': [
    '電気毛布', '電動カーテン', '家庭用シュレッダー',
  ],
  'その他': ['その他'],
}

const BRAND_MAP: Record<string, string[]> = {
  'エアコン':         ['Panasonic', 'SHARP', 'HITACHI', 'TOSHIBA', 'Mitsubishi Electric', 'Daikin', 'Fujitsu General', 'コロナ', 'アイリスオーヤマ'],
  '洗濯機':           ['Panasonic', 'SHARP', 'HITACHI', 'TOSHIBA', 'Mitsubishi Electric', 'AQUA', 'Haier', 'アイリスオーヤマ'],
  '洗濯乾燥機':       ['Panasonic', 'SHARP', 'HITACHI', 'TOSHIBA', 'Mitsubishi Electric', 'AQUA', 'Haier'],
  '乾燥機':           ['Panasonic', 'SHARP', 'HITACHI', 'Rinnai'],
  '冷蔵庫':           ['Panasonic', 'SHARP', 'HITACHI', 'TOSHIBA', 'Mitsubishi Electric', 'AQUA', 'Haier', 'アイリスオーヤマ', 'LG'],
  '掃除機':           ['Dyson', 'Panasonic', 'SHARP', 'HITACHI', 'TOSHIBA', 'アイリスオーヤマ', 'Makita'],
  'ロボット掃除機':   ['iRobot', 'Dyson', 'エコバックス', 'Anker', 'Panasonic', 'SHARP', 'アイリスオーヤマ', 'Xiaomi'],
  '空気清浄機':       ['Panasonic', 'SHARP', 'HITACHI', 'Daikin', 'アイリスオーヤマ', 'Dyson', 'Blueair'],
  '加湿器':           ['Panasonic', 'SHARP', 'HITACHI', 'Daikin', 'アイリスオーヤマ', 'Balmuda', 'ダイニチ'],
  '除湿機':           ['Panasonic', 'SHARP', 'HITACHI', 'コロナ', 'アイリスオーヤマ'],
  '扇風機':           ['Panasonic', 'SHARP', 'HITACHI', 'アイリスオーヤマ', 'Dyson', 'Balmuda'],
  '電子レンジ':       ['Panasonic', 'SHARP', 'HITACHI', 'TOSHIBA', 'アイリスオーヤマ', 'LG'],
  'オーブントースター': ['Panasonic', 'SHARP', 'Balmuda', 'De\'Longhi', 'アイリスオーヤマ', 'TIGER', 'Sirocca'],
  '炊飯器':           ['Panasonic', 'SHARP', 'HITACHI', 'TOSHIBA', 'Mitsubishi Electric', 'Tiger', 'Zojirushi', 'アイリスオーヤマ'],
  '食洗機':           ['Panasonic', 'SHARP', 'アイリスオーヤマ', 'Bosch'],
  '電気ケトル':       ['Panasonic', 'TIGER', 'Zojirushi', 'De\'Longhi', 'Balmuda', 'アイリスオーヤマ', 'THERMOS'],
  'コーヒーメーカー': ['Panasonic', 'SHARP', 'De\'Longhi', 'Nespresso', 'Melitta', 'HARIO', 'Sirocca'],
  'ミキサー・ブレンダー': ['Panasonic', 'SHARP', 'TESCOM', 'アイリスオーヤマ', 'Vitamix'],
  'ホットプレート':   ['TIGER', 'SHARP', 'Panasonic', 'Zojirushi', 'アイリスオーヤマ'],
  'IHクッキングヒーター': ['Panasonic', 'SHARP', 'HITACHI', 'TOSHIBA', 'Mitsubishi Electric', 'アイリスオーヤマ'],
  '電気圧力鍋':       ['Panasonic', 'SHARP', 'アイリスオーヤマ', 'TIGER', 'Zojirushi', 'Sirocca'],
  'ドライヤー':       ['Panasonic', 'SHARP', 'HITACHI', 'Dyson', 'TESCOM', 'Salonia', 'アイリスオーヤマ'],
  'ヘアアイロン':     ['Panasonic', 'SHARP', 'Dyson', 'Salonia', 'TESCOM', 'ReFa'],
  '電動歯ブラシ':     ['Panasonic', 'HITACHI', 'Oral-B', 'Philips', 'Braun'],
  '電気シェーバー':   ['Panasonic', 'HITACHI', 'Philips', 'Braun', 'IZUMI'],
  '体重計・体組成計': ['Panasonic', 'OMRON', 'Withings', 'TANITA', 'A&D'],
  'マッサージ機':     ['Panasonic', 'SHARP', 'アイリスオーヤマ', 'FUJIIRYOKI', 'ファミリーイナダ'],
  '血圧計':           ['OMRON', 'Panasonic', 'A&D', 'CITIZEN', 'テルモ'],
  '体温計':           ['OMRON', 'テルモ', 'A&D', 'Panasonic'],
  'テレビ':           ['Sony', 'SHARP', 'Panasonic', 'TOSHIBA', 'LG', 'Samsung', 'ハイセンス', 'FUNAI'],
  'PC・パソコン':     ['Apple', 'Fujitsu', 'NEC', 'DELL', 'HP', 'Lenovo', 'ASUS', 'Microsoft', 'Dynabook', 'VAIO'],
  'スマートフォン':   ['Apple', 'Sony', 'SHARP', 'Samsung', 'Fujitsu', 'OPPO', 'Google'],
  'タブレット':       ['Apple', 'Sony', 'Samsung', 'ASUS', 'Lenovo', 'Microsoft', 'Amazon'],
  'スピーカー':       ['Sony', 'JBL', 'Bose', 'Panasonic', 'YAMAHA', 'DENON', 'Anker'],
  'ヘッドホン・イヤホン': ['Sony', 'Bose', 'Panasonic', 'JBL', 'Apple', 'SENNHEISER', 'Audio-Technica', 'Anker'],
  '録画機・レコーダー': ['Sony', 'Panasonic', 'SHARP', 'TOSHIBA', 'HITACHI'],
  'プロジェクター':   ['Epson', 'SHARP', 'Panasonic', 'Sony', 'BenQ', 'XGIMI', 'Anker'],
  'デジタルカメラ':   ['Sony', 'Canon', 'Nikon', 'Fujifilm', 'Panasonic', 'Ricoh', 'Olympus'],
  '一眼レフカメラ':   ['Canon', 'Nikon', 'Pentax'],
  'ミラーレスカメラ': ['Sony', 'Canon', 'Nikon', 'Fujifilm', 'Panasonic', 'Olympus', 'SIGMA'],
  'ビデオカメラ':     ['Sony', 'Panasonic', 'Canon', 'JVC'],
  'アクションカメラ': ['GoPro', 'DJI', 'Insta360', 'Sony'],
  'ドローン':         ['DJI', 'Parrot', 'Autel'],
  'ゲーム機':         ['Sony', 'Nintendo', 'Microsoft'],
  '電子ピアノ・キーボード': ['YAMAHA', 'Roland', 'Casio', 'KORG'],
  '給湯器':           ['Noritz', 'Rinnai', 'Paloma', 'コロナ'],
  'エコキュート':     ['Panasonic', 'HITACHI', 'Daikin', 'TOSHIBA', 'Mitsubishi Electric', 'コロナ'],
  '照明・シーリングライト': ['Panasonic', 'HITACHI', 'TOSHIBA', 'ODELiC', 'コイズミ'],
  'カーナビ':         ['Panasonic', 'Pioneer', 'KENWOOD', 'Sony', 'ALPINE', 'CLARION'],
  'ドライブレコーダー': ['YUPITERU', 'COMTEC', 'KENWOOD', 'Panasonic', 'Garmin'],
  '電動自転車・E-Bike': ['Panasonic', 'YAMAHA', 'Bridgestone', 'GIANT'],
  'スマートウォッチ': ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Withings', 'CASIO'],
  '電動ドリル':       ['Makita', 'HiKOKI', 'RYOBI', 'Bosch', 'BLACK+DECKER'],
  'ポータブル電源':   ['EcoFlow', 'Jackery', 'Anker', 'BLUETTI'],
  'ポータブル冷蔵庫': ['Engel', 'Dometic', 'EcoFlow', 'CampingMoon'],
}

const COMMON_BRANDS = [
  'Panasonic', 'SHARP', 'HITACHI', 'TOSHIBA', 'Sony', 'Mitsubishi Electric',
  'Daikin', 'Fujitsu', 'アイリスオーヤマ', 'AQUA', 'Haier', 'LG', 'Samsung',
  'Apple', 'Dyson', 'Tiger', 'Zojirushi', 'OMRON', 'Balmuda',
]

function getBrandSuggestions(input: string, applianceType: string): string[] {
  if (!input.trim()) return []
  const q = input.toLowerCase()
  const categoryBrands = BRAND_MAP[applianceType] || []
  const merged: string[] = [...categoryBrands]
  for (const b of COMMON_BRANDS) {
    if (!merged.includes(b)) merged.push(b)
  }
  return merged.filter(b => b.toLowerCase().includes(q)).slice(0, 8)
}

function findGenre(type: string): string {
  for (const [genre, subs] of Object.entries(GENRE_CATEGORIES)) {
    if (subs.includes(type)) return genre
  }
  return 'その他'
}

const selectStyle: React.CSSProperties = {
  height: 46,
  border: '1.5px solid #E8ECF0',
  borderRadius: 10,
  padding: '0 10px',
  fontSize: 14,
  background: 'white',
  appearance: 'none',
  WebkitAppearance: 'none',
}

export default function EditAppliancePage({ params }: { params: { id: string } }) {
  const router = useRouter()

  const [selectedGenre, setSelectedGenre] = useState('')
  const [applianceType, setApplianceType] = useState('')
  const [brand, setBrand] = useState('')
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false)
  const [modelNumber, setModelNumber] = useState('')
  const [purchaseYear, setPurchaseYear] = useState('')
  const [purchaseMonth, setPurchaseMonth] = useState('')
  const [purchaseDay, setPurchaseDay] = useState('')
  const [warrantyMonths, setWarrantyMonths] = useState('')
  const [warrantyEndYear, setWarrantyEndYear] = useState('')
  const [warrantyEndMonth, setWarrantyEndMonth] = useState('')
  const [warrantyEndDay, setWarrantyEndDay] = useState('')
  const [storeName, setStoreName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Product image (auto-fetched from model number)
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [brandAutoFilled, setBrandAutoFilled] = useState(false)

  // Product image manual upload
  const productPhotoInputRef = useRef<HTMLInputElement>(null)
  const [productPhotoFile, setProductPhotoFile] = useState<File | null>(null)
  const [productPhotoPreview, setProductPhotoPreview] = useState<string | null>(null)

  // Receipt/warranty photo upload
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoName, setPhotoName] = useState('')

  // Fetch current data
  useEffect(() => {
    fetch(`/api/appliances/${params.id}`)
      .then(r => r.json())
      .then(d => {
        const a = d.appliance
        if (!a) return
        const type = a.appliance_type || ''
        setApplianceType(type)
        setSelectedGenre(findGenre(type))
        setBrand(a.brand || '')
        setModelNumber(a.model || '')
        setProductImageUrl(a.image_url || null)
        if (a.purchase_date) {
          const [y, m, day] = a.purchase_date.split('-')
          setPurchaseYear(y || '')
          setPurchaseMonth(m ? String(parseInt(m)) : '')
          setPurchaseDay(day ? String(parseInt(day)) : '')
        }
        setWarrantyMonths(a.warranty_months ? String(a.warranty_months) : '')
        if (a.warranty_end) {
          const [ey, em, ed] = a.warranty_end.split('-')
          setWarrantyEndYear(ey || '')
          setWarrantyEndMonth(em ? String(parseInt(em)) : '')
          setWarrantyEndDay(ed ? String(parseInt(ed)) : '')
        }
        setStoreName(a.store_name || '')
      })
      .finally(() => setLoading(false))
  }, [params.id])

  // Auto-fetch product image from model number (debounced, same as register page)
  useEffect(() => {
    const trimmed = modelNumber.trim()
    if (trimmed.length < 3) return
    const timer = setTimeout(async () => {
      setImageLoading(true)
      try {
        const res = await fetch(`/api/product-image?model=${encodeURIComponent(trimmed)}`)
        const data = await res.json()
        if (data.imageUrl) setProductImageUrl(data.imageUrl)
        if (data.brand && (!brand.trim() || brandAutoFilled)) {
          setBrand(data.brand)
          setBrandAutoFilled(true)
        }
      } catch { /* silent */ }
      finally { setImageLoading(false) }
    }, 900)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelNumber])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError('')
    setSaving(true)

    // Upload product image directly to Supabase Storage via signed URL
    // (avoids Vercel 4.5MB body limit)
    let imageUrl: string | undefined
    if (productPhotoFile) {
      try {
        const ext = productPhotoFile.name.split('.').pop() ?? 'jpg'
        const path = `product-images/${params.id}-${Date.now()}.${ext}`

        // Step 1: Get signed upload URL from our server
        const signRes = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path }),
        })
        if (!signRes.ok) {
          const e = await signRes.json().catch(() => ({}))
          setSaveError(`画像のアップロードに失敗しました: ${e.error ?? ''}`)
          setSaving(false)
          return
        }
        const { signedUrl, publicUrl } = await signRes.json()

        // Step 2: Upload file directly to Supabase Storage
        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          body: productPhotoFile,
          headers: {
            'Content-Type': productPhotoFile.type || 'image/jpeg',
            'x-upsert': 'true',
          },
        })
        if (!uploadRes.ok) {
          setSaveError('画像のアップロードに失敗しました。再度お試しください。')
          setSaving(false)
          return
        }
        imageUrl = publicUrl
      } catch {
        setSaveError('画像のアップロードに失敗しました。接続を確認してください。')
        setSaving(false)
        return
      }
    }

    try {
      const body: Record<string, unknown> = {
        appliance_type: applianceType || 'その他',
        brand,
        model: modelNumber,
        purchase_date: (purchaseYear && purchaseMonth && purchaseDay)
          ? `${purchaseYear}-${purchaseMonth.padStart(2, '0')}-${purchaseDay.padStart(2, '0')}`
          : null,
        store_name: storeName,
        image_url: imageUrl ?? productImageUrl ?? null,
      }
      if (warrantyMonths) body.warranty_months = parseInt(warrantyMonths)
      if (warrantyEndYear && warrantyEndMonth && warrantyEndDay) {
        body.warranty_end = `${warrantyEndYear}-${warrantyEndMonth.padStart(2, '0')}-${warrantyEndDay.padStart(2, '0')}`
      }

      const res = await fetch(`/api/appliances/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <form onSubmit={handleSubmit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Appliance Type — 2-step: genre → sub-category */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>製品の種類</label>
          {/* Step 1: Genre row (horizontally scrollable) */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {Object.keys(GENRE_CATEGORIES).map(genre => (
              <button
                key={genre}
                type="button"
                onClick={() => { setSelectedGenre(genre); setApplianceType('') }}
                style={{
                  flexShrink: 0, height: 32, padding: '0 12px', borderRadius: 100,
                  border: selectedGenre === genre ? 'none' : '1px solid #E8ECF0',
                  background: selectedGenre === genre ? '#0F1419' : 'white',
                  color: selectedGenre === genre ? 'white' : '#5B6570',
                  fontSize: 12, fontWeight: selectedGenre === genre ? 600 : 400,
                  cursor: 'pointer',
                }}
              >{genre}</button>
            ))}
          </div>
          {/* Step 2: Sub-category pills */}
          {selectedGenre && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {GENRE_CATEGORIES[selectedGenre].map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setApplianceType(sub)}
                  style={{
                    height: 32, padding: '0 12px', borderRadius: 100,
                    border: applianceType === sub ? 'none' : '1px solid #E8ECF0',
                    background: applianceType === sub ? '#374151' : '#F9FAFB',
                    color: applianceType === sub ? 'white' : '#374151',
                    fontSize: 12, fontWeight: applianceType === sub ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >{sub}</button>
              ))}
            </div>
          )}
          {applianceType && (
            <p style={{ fontSize: 11, color: '#5B6570', margin: '6px 0 0' }}>
              選択中: <strong>{applianceType}</strong>
            </p>
          )}
        </div>

        {/* Model Number */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>型番</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="text"
              value={modelNumber}
              onChange={e => setModelNumber(e.target.value)}
              placeholder="例：NA-VX900BL"
              style={{ flex: 1, height: 46, border: '1.5px solid #E8ECF0', borderRadius: 10, padding: '0 14px', fontSize: 14, color: '#0F1419', background: 'white', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" }}
            />
            {/* Product image preview */}
            <div style={{ width: 46, height: 46, borderRadius: 10, border: '1.5px solid #E8ECF0', background: '#F4F6F8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
              {imageLoading ? (
                <div style={{ width: 20, height: 20, border: '2px solid #E8ECF0', borderTopColor: '#0F1419', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : productImageUrl ? (
                <img src={productImageUrl} alt="製品画像" style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={() => setProductImageUrl(null)} />
              ) : (
                <ApplianceIcon type={applianceType} size={24} />
              )}
            </div>
          </div>
          {productImageUrl && !imageLoading && (
            <p style={{ fontSize: 10, color: '#059669', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 3 }}>
              ✓ 製品画像を自動取得しました
            </p>
          )}
        </div>

        {/* Product Image Upload */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>製品画像</label>
          <input
            ref={productPhotoInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) {
                setProductPhotoFile(f)
                setProductPhotoPreview(URL.createObjectURL(f))
              }
              e.target.value = ''
            }}
          />
          <div
            onClick={() => productPhotoInputRef.current?.click()}
            style={{
              border: `2px dashed ${productPhotoPreview || productImageUrl ? '#86EFAC' : '#E8ECF0'}`,
              borderRadius: 12,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
              background: productPhotoPreview || productImageUrl ? '#F0FDF4' : 'white',
            }}
          >
            {/* Image preview */}
            <div style={{ width: 60, height: 60, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#F4F6F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {productPhotoPreview ? (
                <img src={productPhotoPreview} alt="プレビュー" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : productImageUrl ? (
                <img src={productImageUrl} alt="製品画像" style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={() => setProductImageUrl(null)} />
              ) : (
                <ApplianceIcon type={applianceType} size={30} />
              )}
            </div>
            <div>
              {productPhotoPreview ? (
                <p style={{ fontSize: 13, color: '#16A34A', fontWeight: 600, margin: 0 }}>✓ 新しい画像を選択済み</p>
              ) : productImageUrl ? (
                <>
                  <p style={{ fontSize: 13, color: '#16A34A', fontWeight: 600, margin: 0 }}>✓ 画像あり</p>
                  <p style={{ fontSize: 11, color: '#059669', margin: '2px 0 0' }}>タップして変更</p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: '#98A2AE', margin: 0 }}>写真をタップして追加</p>
                  <p style={{ fontSize: 11, color: '#C5CAD0', margin: '2px 0 0' }}>JPG, PNG 対応</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Brand */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>ブランド・メーカー</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={brand}
              onChange={e => { setBrand(e.target.value); setShowBrandSuggestions(true) }}
              onFocus={() => { if (brand) setShowBrandSuggestions(true) }}
              onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 150)}
              placeholder="例：Panasonic, SHARP, HITACHI"
              style={{ width: '100%', height: 46, border: '1.5px solid #E8ECF0', borderRadius: 10, padding: '0 14px', fontSize: 14, color: '#0F1419', background: 'white', boxSizing: 'border-box', fontFamily: "'Zen Kaku Gothic New', sans-serif" }}
            />
            {showBrandSuggestions && getBrandSuggestions(brand, applianceType).length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: 'white', border: '1px solid #E8ECF0', borderRadius: 10, boxShadow: '0 4px 16px rgba(15,20,25,0.12)', zIndex: 100, overflow: 'hidden' }}>
                {getBrandSuggestions(brand, applianceType).map((s) => (
                  <div key={s}
                    onMouseDown={() => { setBrand(s); setShowBrandSuggestions(false) }}
                    style={{ padding: '10px 14px', fontSize: 13, color: '#0F1419', cursor: 'pointer', borderBottom: '1px solid #F4F6F8' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F4F6F8')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Purchase Date — year / month / day selects */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>購入日</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={purchaseYear}
              onChange={e => setPurchaseYear(e.target.value)}
              style={{ ...selectStyle, flex: 2, color: purchaseYear ? '#0F1419' : '#98A2AE' }}
            >
              <option value="">年</option>
              {Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={String(y)}>{y}年</option>
              ))}
            </select>
            <select
              value={purchaseMonth}
              onChange={e => setPurchaseMonth(e.target.value)}
              style={{ ...selectStyle, flex: 1, color: purchaseMonth ? '#0F1419' : '#98A2AE' }}
            >
              <option value="">月</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={String(m)}>{m}月</option>
              ))}
            </select>
            <select
              value={purchaseDay}
              onChange={e => setPurchaseDay(e.target.value)}
              style={{ ...selectStyle, flex: 1, color: purchaseDay ? '#0F1419' : '#98A2AE' }}
            >
              <option value="">日</option>
              {Array.from(
                {
                  length: (purchaseYear && purchaseMonth)
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

        {/* Warranty Months */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>保証期間</label>
          <select
            value={warrantyMonths}
            onChange={e => setWarrantyMonths(e.target.value)}
            style={{ ...selectStyle, width: '100%', color: warrantyMonths ? '#0F1419' : '#98A2AE' }}
          >
            <option value="">選択してください</option>
            {[3, 6, 12, 18, 24, 36, 48, 60].map(m => (
              <option key={m} value={String(m)}>
                {m}ヶ月{m >= 12 ? `（${m / 12}年）` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Warranty End Date */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>保証終了日</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={warrantyEndYear}
              onChange={e => setWarrantyEndYear(e.target.value)}
              style={{ ...selectStyle, flex: 2, color: warrantyEndYear ? '#0F1419' : '#98A2AE' }}
            >
              <option value="">年</option>
              {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                <option key={y} value={String(y)}>{y}年</option>
              ))}
            </select>
            <select
              value={warrantyEndMonth}
              onChange={e => setWarrantyEndMonth(e.target.value)}
              style={{ ...selectStyle, flex: 1, color: warrantyEndMonth ? '#0F1419' : '#98A2AE' }}
            >
              <option value="">月</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={String(m)}>{m}月</option>
              ))}
            </select>
            <select
              value={warrantyEndDay}
              onChange={e => setWarrantyEndDay(e.target.value)}
              style={{ ...selectStyle, flex: 1, color: warrantyEndDay ? '#0F1419' : '#98A2AE' }}
            >
              <option value="">日</option>
              {Array.from(
                { length: (warrantyEndYear && warrantyEndMonth)
                  ? new Date(parseInt(warrantyEndYear), parseInt(warrantyEndMonth), 0).getDate()
                  : 31
                },
                (_, i) => i + 1
              ).map(d => (
                <option key={d} value={String(d)}>{d}日</option>
              ))}
            </select>
          </div>
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

        {/* Photo Upload */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#5B6570', display: 'block', marginBottom: 6 }}>領収書・保証書の写真</label>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*,application/pdf"
            style={{ display: 'none' }}
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) { setPhotoFile(f); setPhotoName(f.name) }
              e.target.value = ''
            }}
          />
          <div
            onClick={() => photoInputRef.current?.click()}
            style={{
              border: `2px dashed ${photoName ? '#86EFAC' : '#E8ECF0'}`,
              borderRadius: 12,
              padding: '22px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              background: photoName ? '#F0FDF4' : 'white',
            }}
          >
            <div style={{ width: 40, height: 40, background: '#F4F6F8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
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
