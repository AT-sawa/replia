import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Replia',
  description: 'AI-powered appliance support app',
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
        <div className="w-full max-w-[390px] min-h-screen bg-white relative mx-auto">
          {children}
        </div>
      </body>
    </html>
  )
}
