import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'replia — AI家電サポート',
  description: '家電のトラブルをAIが即解決。保証書・取扱説明書の管理、メンテナンスリマインダーまで、あなたの家電をまるごとサポート。',
  openGraph: {
    title: 'replia — AI家電サポート',
    description: '家電のトラブルをAIが即解決。保証書・取扱説明書の管理、メンテナンスリマインダーまで。',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary',
    title: 'replia — AI家電サポート',
    description: '家電のトラブルをAIが即解決。保証書・取扱説明書の管理、メンテナンスリマインダーまで。',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
