'use client'

import Badge, { WarrantyStatus } from './Badge'

interface ProductBarProps {
  emoji?: string
  productName: string
  modelNumber?: string
  subLabel?: string
  warrantyStatus?: WarrantyStatus
}

export default function ProductBar({
  emoji = '📦',
  productName,
  modelNumber,
  subLabel,
  warrantyStatus,
}: ProductBarProps) {
  return (
    <div
      style={{
        background: 'white',
        borderBottom: '1px solid #E8ECF0',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#0F1419',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {productName}
        </p>
        {(modelNumber || subLabel) && (
          <p style={{ fontSize: 11, color: '#98A2AE', margin: 0 }}>
            {[modelNumber, subLabel].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
      {warrantyStatus && <Badge status={warrantyStatus} />}
    </div>
  )
}
