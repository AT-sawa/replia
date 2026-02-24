interface ApplianceIconProps {
  type: string
  size?: number
}

export function ApplianceIcon({ type, size = 24 }: ApplianceIconProps) {
  const s = { width: size, height: size, display: 'block' as const }
  const t = type.replace('全自動', '').replace('液晶', '')

  if (t.includes('エアコン')) {
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none">
        <rect x="1" y="6" width="22" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 11h16M4 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 6V4M18 6V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (t.includes('洗濯機')) {
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="21" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="14" r="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="14" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 6h4M18 6h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (t.includes('テレビ')) {
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none">
        <rect x="1" y="3" width="22" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 22h8M12 18v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (t.includes('冷蔵庫')) {
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none">
        <rect x="5" y="2" width="14" height="21" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 10h14" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v3M10 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (t.includes('電子レンジ') || t.includes('レンジ')) {
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="5" y="8" width="11" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M20 10h-1M20 12.5h-1M20 15h-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (t.includes('掃除機')) {
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none">
        <circle cx="8" cy="17" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11.5 14.5L16 8l4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 9l2-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  // Default appliance icon
  return (
    <svg style={s} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 8h8M8 12h5M8 16h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
