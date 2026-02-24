'use client'

interface QuickAction {
  label: string
  value: string
}

interface QuickActionsProps {
  actions: QuickAction[]
  onSelect: (value: string) => void
}

export default function QuickActions({ actions, onSelect }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2">
      {actions.map((action) => (
        <button
          key={action.value}
          onClick={() => onSelect(action.value)}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}
