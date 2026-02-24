export type WarrantyStatus = 'active' | 'expiring' | 'expired'

interface BadgeProps {
  status: WarrantyStatus
}

const statusConfig: Record<
  WarrantyStatus,
  { label: string; bg: string; color: string }
> = {
  active: { label: '保証内', bg: '#E8F5E9', color: '#059669' },
  expiring: { label: 'まもなく終了', bg: '#FFF8E1', color: '#D97706' },
  expired: { label: '保証切れ', bg: '#FFEBEE', color: '#DC2626' },
}

export default function Badge({ status }: BadgeProps) {
  const { label, bg, color } = statusConfig[status]
  return (
    <span
      style={{
        background: bg,
        color,
        borderRadius: 100,
        padding: '3px 8px',
        fontSize: 10,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}
