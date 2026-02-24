'use client'

import { useEffect, useState } from 'react'

function BatteryIcon() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
      <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#0F1419" strokeOpacity="0.35" />
      <rect x="22" y="3.5" width="2.5" height="5" rx="1.25" fill="#0F1419" fillOpacity="0.4" />
      <rect x="2" y="2" width="16" height="8" rx="2" fill="#0F1419" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      <path
        d="M8 9.5C8.69 9.5 9.25 10.06 9.25 10.75C9.25 11.44 8.69 12 8 12C7.31 12 6.75 11.44 6.75 10.75C6.75 10.06 7.31 9.5 8 9.5Z"
        fill="#0F1419"
      />
      <path
        d="M8 6.5C9.38 6.5 10.63 7.06 11.54 7.97L12.6 6.91C11.4 5.71 9.78 5 8 5C6.22 5 4.6 5.71 3.4 6.91L4.46 7.97C5.37 7.06 6.62 6.5 8 6.5Z"
        fill="#0F1419"
      />
      <path
        d="M8 3.5C10.35 3.5 12.48 4.45 14.04 6L15.1 4.94C13.25 3.11 10.75 2 8 2C5.25 2 2.75 3.11 0.9 4.94L1.96 6C3.52 4.45 5.65 3.5 8 3.5Z"
        fill="#0F1419"
      />
      <path
        d="M8 0.5C11.32 0.5 14.32 1.84 16.5 4L15.44 5.06C13.55 3.17 10.91 2 8 2C5.09 2 2.45 3.17 0.56 5.06L-0.5 4C1.68 1.84 4.68 0.5 8 0.5Z"
        fill="#0F1419"
        fillOpacity="0.3"
      />
    </svg>
  )
}

function SignalIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
      <rect x="0" y="8" width="3" height="4" rx="1" fill="#0F1419" />
      <rect x="4.5" y="5" width="3" height="7" rx="1" fill="#0F1419" />
      <rect x="9" y="2" width="3" height="10" rx="1" fill="#0F1419" />
      <rect x="13.5" y="0" width="3" height="12" rx="1" fill="#0F1419" />
    </svg>
  )
}

export default function StatusBar() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = now.getHours().toString().padStart(2, '0')
      const m = now.getMinutes().toString().padStart(2, '0')
      setTime(`${h}:${m}`)
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      style={{ height: 44, background: 'white' }}
      className="flex items-center justify-between px-5 flex-shrink-0"
    >
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          fontWeight: 600,
          color: '#0F1419',
        }}
      >
        {time}
      </span>
      <div className="flex items-center gap-1.5">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  )
}
