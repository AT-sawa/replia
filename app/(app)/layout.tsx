import StatusBar from '@/components/ui/StatusBar'
import TabBar from '@/components/ui/TabBar'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <StatusBar />
      <main style={{ flex: 1, overflowY: 'auto', background: '#FAFBFC' }}>
        {children}
      </main>
      <TabBar />
    </div>
  )
}
