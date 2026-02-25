'use client'

import { useState, useRef } from 'react'

interface DocumentUploadProps {
  docName: string
}

export function DocumentUpload({ docName }: DocumentUploadProps) {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImageDataUrl(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: imageDataUrl ? '#F0FDF4' : '#F4F6F8',
        border: imageDataUrl ? '1px solid #D1FAE5' : 'none',
        borderRadius: 8, padding: '10px 12px', cursor: 'pointer',
      }}
    >
      {/* Hidden file input — camera on mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({ capture: 'environment' } as any)}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Icon */}
      {imageDataUrl ? (
        <img
          src={imageDataUrl}
          alt={docName}
          style={{
            width: 36, height: 36, objectFit: 'cover',
            borderRadius: 4, flexShrink: 0,
          }}
        />
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <path d="M10 1H3C2.4 1 2 1.4 2 2V14C2 14.6 2.4 15 3 15H13C13.6 15 14 14.6 14 14V5L10 1Z" stroke="#C5CAD0" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M10 1V5H14" stroke="#C5CAD0" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M5 9H11M5 12H8" stroke="#C5CAD0" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}

      {/* Label */}
      <span style={{
        flex: 1, fontSize: 13,
        color: imageDataUrl ? '#059669' : '#98A2AE',
        fontWeight: imageDataUrl ? 600 : 400,
      }}>
        {docName}
      </span>

      {/* Badge */}
      {imageDataUrl ? (
        <span style={{
          fontSize: 10, color: '#059669', background: '#D1FAE5',
          borderRadius: 100, padding: '2px 8px', fontWeight: 600, flexShrink: 0,
        }}>
          登録済み
        </span>
      ) : (
        <span style={{
          fontSize: 10, color: '#5B6570', background: '#E8ECF0',
          borderRadius: 100, padding: '2px 8px', flexShrink: 0,
        }}>
          ＋ 追加
        </span>
      )}
    </div>
  )
}
