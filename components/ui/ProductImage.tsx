'use client'

import { useState } from 'react'
import { ApplianceIcon } from './ApplianceIcon'

interface ProductImageProps {
  imageUrl?: string
  name: string
  size?: number        // container size (px)
  iconSize?: number    // icon size inside container (px)
  borderRadius?: number
}

export function ProductImage({
  imageUrl,
  name,
  size = 44,
  iconSize,
  borderRadius = 8,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false)
  const svgSize = iconSize ?? Math.round(size * 0.55)

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt={name}
        onError={() => setFailed(true)}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          borderRadius,
          background: '#F4F6F8',
          display: 'block',
          flexShrink: 0,
        }}
      />
    )
  }

  // fallback — SVG icon in a grey box
  return (
    <div
      style={{
        width: size,
        height: size,
        background: '#F4F6F8',
        borderRadius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0F1419',
        flexShrink: 0,
      }}
    >
      <ApplianceIcon type={name} size={svgSize} />
    </div>
  )
}
