'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavIconProps = { active: boolean }

const HomeIcon = ({ active }: NavIconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
      fill={active ? 'white' : 'none'}
      stroke={active ? 'white' : '#98A2AE'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
)

const ApplianceIcon = ({ active }: NavIconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect
      x="2" y="3" width="20" height="14" rx="2"
      fill={active ? 'white' : 'none'}
      stroke={active ? 'white' : '#98A2AE'}
      strokeWidth="2"
    />
    <path
      d="M8 21H16M12 17V21"
      stroke={active ? 'white' : '#98A2AE'}
      strokeWidth="2" strokeLinecap="round"
    />
  </svg>
)

const UserIcon = ({ active }: NavIconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12" cy="8" r="4"
      fill={active ? 'white' : 'none'}
      stroke={active ? 'white' : '#98A2AE'}
      strokeWidth="2"
    />
    <path
      d="M4 20C4 17.2386 7.58172 15 12 15C16.4183 15 20 17.2386 20 20"
      stroke={active ? 'white' : '#98A2AE'}
      strokeWidth="2" strokeLinecap="round"
    />
  </svg>
)

const ShareIcon = ({ active }: NavIconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
      stroke={active ? 'white' : '#98A2AE'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    />
    <circle cx="9" cy="7" r="4" stroke={active ? 'white' : '#98A2AE'} strokeWidth="2" />
    <path
      d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
      stroke={active ? 'white' : '#98A2AE'} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
)

const navItems = [
  { href: '/', label: 'ホーム', Icon: HomeIcon },
  { href: '/my-appliances', label: 'マイ家電', Icon: ApplianceIcon },
  { href: '/share', label: '家族共有', Icon: ShareIcon },
  { href: '/mypage', label: 'マイページ', Icon: UserIcon },
]

export default function SideNav() {
  const pathname = usePathname()

  return (
    <div
      className="hidden md:flex flex-col"
      style={{ width: 220, background: '#0F1419', flexShrink: 0 }}
    >
      {/* Logo */}
      <div style={{ padding: '28px 20px 36px' }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
          Replia
        </p>
        <p style={{ fontSize: 11, color: '#5B6570', margin: '3px 0 0' }}>AI家電サポート</p>
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px', flex: 1 }}>
        {navItems.map(({ href, label, Icon }) => {
          const isActive =
            href === '/'
              ? pathname === '/' || pathname.startsWith('/chat')
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 12px',
                borderRadius: 10,
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                textDecoration: 'none',
                color: isActive ? 'white' : '#98A2AE',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <Icon active={isActive} />
              {label}
            </Link>
          )
        })}
      </div>

      {/* Add appliance button */}
      <div style={{ padding: '20px 12px 32px' }}>
        <Link
          href="/register"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'white',
            color: '#0F1419',
            borderRadius: 10,
            height: 42,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="#0F1419" strokeWidth="2" strokeLinecap="round" />
          </svg>
          家電を追加
        </Link>
      </div>
    </div>
  )
}
