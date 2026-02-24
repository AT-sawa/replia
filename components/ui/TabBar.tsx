'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/chat',
    label: 'チャット',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
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
      style={{
        height: 83,
        background: 'white',
        borderTop: '1px solid #E8ECF0',
        paddingTop: 8,
        paddingBottom: 20,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-start',
        width: '100%',
      }}
    >
      {tabs.map((tab) => {
        const isActive =
          tab.href === '/chat'
            ? pathname === '/chat' || pathname === '/'
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
