import { MessageSquare } from 'lucide-react'

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function InboxView({ inboxes }) {
  const agents = Object.keys(inboxes)

  if (agents.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        No inbox messages
      </div>
    )
  }

  const totalMessages = agents.reduce(
    (sum, agent) => sum + (inboxes[agent]?.length || 0),
    0
  )

  return (
    <div>
      <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800/50 flex items-center gap-2 text-xs text-slate-500">
        <MessageSquare className="w-3.5 h-3.5" />
        {totalMessages} message{totalMessages !== 1 ? 's' : ''} across {agents.length} inbox{agents.length !== 1 ? 'es' : ''}
      </div>
      <div className="divide-y divide-slate-800/50">
        {agents.map((agentName) => {
          const messages = inboxes[agentName] || []
          if (messages.length === 0) return null

          return (
            <div key={agentName}>
              <div className="px-4 py-1.5 bg-slate-850/50 text-xs font-medium text-slate-400">
                {agentName}
                <span className="text-slate-600 ml-2">({messages.length})</span>
              </div>
              {messages.slice(-10).map((msg, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 hover:bg-slate-800/30 transition-colors border-l-2 border-accent/20"
                >
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-0.5">
                    {msg.from && <span className="text-accent-light">{msg.from}</span>}
                    {msg.timestamp && <span>{formatTime(msg.timestamp)}</span>}
                    {msg.summary && (
                      <span className="text-slate-400 truncate">{msg.summary}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap break-words line-clamp-4">
                    {msg.text || msg.content || msg.message || JSON.stringify(msg)}
                  </p>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
