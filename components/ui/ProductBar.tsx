'use client'

interface ProductBarProps {
  productName: string
  modelNumber?: string
}

export default function ProductBar({ productName, modelNumber }: ProductBarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-xl">
        📦
      </div>
      <div>
        <p className="text-sm font-medium">{productName}</p>
        {modelNumber && <p className="text-xs text-gray-500">{modelNumber}</p>}
      </div>
    </div>
  )
}
