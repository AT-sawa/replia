import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      style={{
        background: '#0F1419',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 20,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 28,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          color: 'white',
        }}
      >
        replia
      </span>

      <div>
        <p style={{ fontSize: 64, fontWeight: 900, color: 'rgba(255,255,255,0.15)', margin: 0, lineHeight: 1, fontFamily: "'DM Sans', sans-serif" }}>
          404
        </p>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: '8px 0 6px' }}>
          ページが見つかりません
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          URLが正しいか確認してください
        </p>
      </div>

      <Link
        href="/"
        style={{
          background: 'white',
          color: '#0F1419',
          borderRadius: 100,
          height: 46,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          fontSize: 14,
          fontWeight: 700,
          textDecoration: 'none',
          marginTop: 4,
        }}
      >
        ホームに戻る
      </Link>
    </div>
  )
}
