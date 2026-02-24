import Link from 'next/link'
import Badge, { WarrantyStatus } from '@/components/ui/Badge'

const products: Record<
  string,
  {
    emoji: string
    name: string
    model: string
    brand: string
    serial: string
    purchaseDate: string
    warrantyEnd: string
    status: WarrantyStatus
    daysLeft: number
    totalDays: number
    store: string
  }
> = {
  '1': {
    emoji: '❄️',
    name: 'エアコン',
    model: 'CS-X402D2',
    brand: 'Panasonic',
    serial: 'PA2022071400123',
    purchaseDate: '2022年7月14日',
    warrantyEnd: '2025年7月14日',
    status: 'active',
    daysLeft: 284,
    totalDays: 365,
    store: 'ヨドバシカメラ 新宿店',
  },
  '2': {
    emoji: '🧺',
    name: '全自動洗濯機',
    model: 'NA-VX900BL',
    brand: 'Panasonic',
    serial: 'PA2022031200458',
    purchaseDate: '2022年3月12日',
    warrantyEnd: '2024年3月12日',
    status: 'expiring',
    daysLeft: 28,
    totalDays: 365,
    store: 'ビックカメラ 渋谷店',
  },
  '3': {
    emoji: '📺',
    name: '液晶テレビ',
    model: 'TH-65LX950',
    brand: 'Panasonic',
    serial: 'PA2021090500789',
    purchaseDate: '2021年9月5日',
    warrantyEnd: '2023年9月5日',
    status: 'expired',
    daysLeft: 0,
    totalDays: 365,
    store: 'Amazon',
  },
  '4': {
    emoji: '❄️',
    name: '冷蔵庫',
    model: 'NR-F605WPX',
    brand: 'Panasonic',
    serial: 'PA2023120100321',
    purchaseDate: '2023年12月1日',
    warrantyEnd: '2028年12月1日',
    status: 'active',
    daysLeft: 512,
    totalDays: 1825,
    store: 'ヨドバシカメラ 秋葉原店',
  },
}

const statusBarColor: Record<WarrantyStatus, string> = {
  active: '#059669',
  expiring: '#D97706',
  expired: '#DC2626',
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products[params.id] ?? products['1']
  const progressPct =
    product.status === 'expired'
      ? 100
      : Math.max(5, Math.round(((product.totalDays - product.daysLeft) / product.totalDays) * 100))

  return (
    <div style={{ background: '#FAFBFC', minHeight: '100%' }}>
      {/* Header */}
      <div
        style={{
          background: 'white',
          borderBottom: '1px solid #E8ECF0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Link
          href="/my-appliances"
          style={{
            width: 32,
            height: 32,
            background: '#0F1419',
            borderRadius: '50%',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#0F1419', margin: 0 }}>
          製品詳細
        </p>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Product Hero Card */}
        <div
          style={{
            background: 'white',
            border: '1px solid #E8ECF0',
            borderRadius: 16,
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 1px 4px rgba(15,20,25,0.06)',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              background: '#F4F6F8',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
            }}
          >
            {product.emoji}
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#0F1419', margin: 0 }}>
              {product.name}
            </p>
            <p style={{ fontSize: 13, color: '#98A2AE', margin: '4px 0' }}>
              {product.model} · {product.brand}
            </p>
            <Badge status={product.status} />
          </div>

          {/* Warranty Progress */}
          <div style={{ width: '100%' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 11, color: '#98A2AE' }}>保証期間</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: statusBarColor[product.status],
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {product.status === 'expired' ? '期限切れ' : `残 ${product.daysLeft}日`}
              </span>
            </div>
            <div
              style={{
                height: 8,
                background: '#F4F6F8',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: statusBarColor[product.status],
                  borderRadius: 4,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
            <p style={{ fontSize: 10, color: '#98A2AE', margin: '4px 0 0', textAlign: 'right' }}>
              {product.warrantyEnd}まで
            </p>
          </div>
        </div>

        {/* Product Info Table */}
        <div
          style={{
            background: 'white',
            border: '1px solid #E8ECF0',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(15,20,25,0.06)',
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8ECF0' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#5B6570', margin: 0 }}>
              製品情報
            </p>
          </div>
          {[
            { label: 'ブランド', value: product.brand },
            { label: 'モデル番号', value: product.model },
            { label: 'シリアル番号', value: product.serial },
            { label: '購入日', value: product.purchaseDate },
            { label: '購入店舗', value: product.store },
            { label: '保証終了日', value: product.warrantyEnd },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              style={{
                display: 'flex',
                padding: '11px 16px',
                borderBottom: i < arr.length - 1 ? '1px solid #E8ECF0' : 'none',
              }}
            >
              <span style={{ fontSize: 12, color: '#98A2AE', flex: '0 0 100px' }}>
                {row.label}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#0F1419',
                  fontFamily:
                    row.label === 'シリアル番号' || row.label === 'モデル番号'
                      ? "'DM Sans', sans-serif"
                      : 'inherit',
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Documents */}
        <div
          style={{
            background: 'white',
            border: '1px solid #E8ECF0',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(15,20,25,0.06)',
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8ECF0' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#5B6570', margin: 0 }}>
              書類
            </p>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['取扱説明書', '保証書', '領収書'].map((doc) => (
              <button
                key={doc}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#F4F6F8',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M10 1H3C2.4 1 2 1.4 2 2V14C2 14.6 2.4 15 3 15H13C13.6 15 14 14.6 14 14V5L10 1Z"
                    stroke="#5B6570"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <path d="M10 1V5H14" stroke="#5B6570" strokeWidth="1.2" strokeLinejoin="round" />
                  <path d="M5 9H11M5 12H8" stroke="#5B6570" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 13, color: '#0F1419', flex: 1 }}>{doc}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 3.5L8.5 7L5 10.5" stroke="#C5CAD0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Button */}
        <Link
          href={`/chat?query=${encodeURIComponent(product.name + ' ' + product.model)}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: '#0F1419',
            color: 'white',
            borderRadius: 100,
            height: 50,
            fontSize: 15,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M15 1.5H3C2.175 1.5 1.5 2.175 1.5 3V16.5L4.5 13.5H15C15.825 13.5 16.5 12.825 16.5 12V3C16.5 2.175 15.825 1.5 15 1.5Z"
              fill="white"
            />
          </svg>
          この製品についてAIに相談
        </Link>
      </div>
    </div>
  )
}
