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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {actions.map((action) => (
        <button
          key={action.value}
          onClick={() => onSelect(action.value)}
          style={{
            border: '1.5px solid #E8ECF0',
            borderRadius: 100,
            height: 36,
            padding: '0 14px',
            fontSize: 12,
            color: '#0F1419',
            background: 'white',
            cursor: 'pointer',
            fontWeight: 500,
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
          }}
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}
