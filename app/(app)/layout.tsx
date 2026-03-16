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

      {/* Main content — pb on mobile clears fixed TabBar + iOS home indicator */}
      <main className="flex-1 overflow-y-auto md:pb-0" style={{ background: '#FAFBFC', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', paddingBottom: 'max(58px, calc(50px + env(safe-area-inset-bottom)))' }}>
        {children}
      </main>

      {/* Mobile tab bar — fixed at bottom, hidden on desktop */}
      <TabBar />
    </div>
  )
}
