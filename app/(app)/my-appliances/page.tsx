import Link from 'next/link'
import Badge, { WarrantyStatus } from '@/components/ui/Badge'

const appliances = [
  {
    id: '1',
    emoji: '❄️',
    name: 'エアコン',
    model: 'CS-X402D2',
    brand: 'Panasonic',
    status: 'active' as WarrantyStatus,
    daysLeft: 284,
  },
  {
    id: '2',
    emoji: '🧺',
    name: '全自動洗濯機',
    model: 'NA-VX900BL',
    brand: 'Panasonic',
    status: 'expiring' as WarrantyStatus,
    daysLeft: 28,
  },
  {
    id: '3',
    emoji: '📺',
    name: '液晶テレビ',
    model: 'TH-65LX950',
    brand: 'Panasonic',
    status: 'expired' as WarrantyStatus,
    daysLeft: 0,
  },
  {
    id: '4',
    emoji: '❄️',
    name: '冷蔵庫',
    model: 'NR-F605WPX',
    brand: 'Panasonic',
    status: 'active' as WarrantyStatus,
    daysLeft: 512,
  },
]

export default function MyAppliancesPage() {
  return (
    <div style={{ background: '#FAFBFC', minHeight: '100%' }}>
      {/* Header */}
      <div
        style={{
          background: 'white',
          borderBottom: '1px solid #E8ECF0',
          padding: '14px 16px',
        }}
      >
        <p style={{ fontSize: 18, fontWeight: 700, color: '#0F1419', margin: 0 }}>
          マイ家電
        </p>
        <p style={{ fontSize: 12, color: '#98A2AE', margin: '2px 0 0' }}>
          {appliances.length}台登録済み
        </p>
      </div>

      {/* List */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {appliances.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div
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
              {/* Icon */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: '#F4F6F8',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {item.emoji}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#0F1419',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </p>
                <p style={{ fontSize: 11, color: '#98A2AE', margin: '2px 0 0' }}>
                  {item.model} · {item.brand}
                </p>
              </div>

              {/* Badge + Days */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 4,
                  flexShrink: 0,
                }}
              >
                <Badge status={item.status} />
                {item.status !== 'expired' && (
                  <p
                    style={{
                      fontSize: 10,
                      color: '#98A2AE',
                      margin: 0,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    残{item.daysLeft}日
                  </p>
                )}
              </div>

              {/* Chevron */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginLeft: -4 }}>
                <path d="M6 4L10 8L6 12" stroke="#C5CAD0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Floating Add Button */}
      <Link href="/register" style={{ textDecoration: 'none' }}>
        <div
          style={{
            position: 'fixed',
            bottom: 100,
            right: 'calc(50% - 390px/2 + 16px)',
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
            <path
              d="M12 5V19M5 12H19"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </Link>
    </div>
  )
}
