'use client'

import { useState, useRef } from 'react'

interface DocumentUploadProps {
  docName: string
}

export function DocumentUpload({ docName }: DocumentUploadProps) {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const cameraRef = useRef<HTMLInputElement>(null)
  const libraryRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImageDataUrl(ev.target?.result as string)
      setShowOptions(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      style={{
        background: imageDataUrl ? '#F0FDF4' : '#F4F6F8',
        border: imageDataUrl ? '1px solid #D1FAE5' : 'none',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Hidden inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({ capture: 'environment' } as any)}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <input
        ref={libraryRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Main row — tappable */}
      <div
        onClick={() => setShowOptions((v) => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer' }}
      >
        {imageDataUrl ? (
          <img
            src={imageDataUrl}
            alt={docName}
            style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
          />
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <path d="M10 1H3C2.4 1 2 1.4 2 2V14C2 14.6 2.4 15 3 15H13C13.6 15 14 14.6 14 14V5L10 1Z" stroke="#C5CAD0" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M10 1V5H14" stroke="#C5CAD0" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M5 9H11M5 12H8" stroke="#C5CAD0" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        )}

        <span style={{ flex: 1, fontSize: 13, color: imageDataUrl ? '#059669' : '#98A2AE', fontWeight: imageDataUrl ? 600 : 400 }}>
          {docName}
        </span>

        <span
          style={{
            fontSize: 10,
            color: imageDataUrl ? '#059669' : '#98A2AE',
            background: imageDataUrl ? '#D1FAE5' : '#E8ECF0',
            borderRadius: 100,
            padding: '2px 8px',
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {imageDataUrl ? '登録済み' : '未登録'}
        </span>
      </div>

      {/* Options — shown when row is tapped */}
      {showOptions && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '0 12px 10px',
          }}
        >
          {imageDataUrl ? (
            <>
              <button
                type="button"
                onClick={() => { setShowOptions(false); cameraRef.current?.click() }}
                style={{ flex: 1, height: 28, background: 'transparent', color: '#059669', border: '1px solid #D1FAE5', borderRadius: 100, fontSize: 11, cursor: 'pointer' }}
              >
                撮り直す
              </button>
              <button
                type="button"
                onClick={() => { setImageDataUrl(null); setShowOptions(false) }}
                style={{ flex: 1, height: 28, background: 'transparent', color: '#98A2AE', border: '1px solid #E8ECF0', borderRadius: 100, fontSize: 11, cursor: 'pointer' }}
              >
                削除
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setShowOptions(false); cameraRef.current?.click() }}
                style={{
                  flex: 1, height: 30, background: '#0F1419', color: 'white',
                  border: 'none', borderRadius: 100, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2" />
                  <path d="M9 3L7.17 5H4C2.9 5 2 5.9 2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V7C22 5.9 21.1 5 20 5H16.83L15 3H9Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                カメラで撮影
              </button>
              <button
                type="button"
                onClick={() => { setShowOptions(false); libraryRef.current?.click() }}
                style={{
                  flex: 1, height: 30, background: 'white', color: '#5B6570',
                  border: '1px solid #E8ECF0', borderRadius: 100, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                フォルダから選択
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
