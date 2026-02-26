import TabBar from '@/components/ui/TabBar'
import SideNav from '@/components/ui/SideNav'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row overflow-hidden w-full" style={{ height: '100dvh' }}>
      {/* Desktop sidebar — hidden on mobile */}
      <SideNav />

      {/* Main content — pb-[58px] on mobile to clear fixed TabBar */}
      <main className="flex-1 overflow-y-auto pb-[58px] md:pb-0" style={{ background: '#FAFBFC', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        {children}
      </main>

      {/* Mobile tab bar — fixed at bottom, hidden on desktop */}
      <TabBar />
    </div>
  )
}
