'use client'

interface MessageBubbleProps {
  content: string
  role: 'user' | 'assistant'
  source?: string
}

export default function MessageBubble({ content, role, source }: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      <div
        style={{
          background: isUser ? '#0F1419' : 'white',
          color: isUser ? 'white' : '#0F1419',
          borderRadius: isUser ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
          border: isUser ? 'none' : '1px solid #E8ECF0',
          padding: '11px 14px',
          fontSize: 13,
          lineHeight: 1.7,
          maxWidth: isUser ? '78%' : '82%',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {content}
      </div>
      {source && (
        <div
          style={{
            background: '#EFF4FF',
            border: '1px solid #D6E4FF',
            borderRadius: 100,
            padding: '3px 8px',
            fontSize: 10,
            color: '#2563EB',
            marginTop: 4,
          }}
        >
          📄 {source}
        </div>
      )}
    </div>
  )
}
