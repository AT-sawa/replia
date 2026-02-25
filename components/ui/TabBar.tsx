'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/',
    label: 'ホーム',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
          fill={active ? '#0F1419' : 'none'}
          stroke={active ? '#0F1419' : '#98A2AE'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/my-appliances',
    label: 'マイ家電',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect
          x="2" y="3" width="20" height="14" rx="2"
          fill={active ? '#0F1419' : 'none'}
          stroke={active ? '#0F1419' : '#98A2AE'}
          strokeWidth="2"
        />
        <path
          d="M8 21H16M12 17V21"
          stroke={active ? '#0F1419' : '#98A2AE'}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/mypage',
    label: 'マイページ',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12" cy="8" r="4"
          fill={active ? '#0F1419' : 'none'}
          stroke={active ? '#0F1419' : '#98A2AE'}
          strokeWidth="2"
        />
        <path
          d="M4 20C4 17.2386 7.58172 15 12 15C16.4183 15 20 17.2386 20 20"
          stroke={active ? '#0F1419' : '#98A2AE'}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

export default function TabBar() {
  const pathname = usePathname()

  return (
    <div
      className="flex md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 58,
        background: 'white',
        borderTop: '1px solid #E8ECF0',
        paddingTop: 6,
        paddingBottom: 8,
        alignItems: 'flex-start',
        zIndex: 50,
      }}
    >
      {tabs.map((tab) => {
        const isActive =
          tab.href === '/'
            ? pathname === '/' || pathname === '/chat'
            : pathname.startsWith(tab.href)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              textDecoration: 'none',
            }}
          >
            {tab.icon(isActive)}
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#0F1419' : '#98A2AE',
              }}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
