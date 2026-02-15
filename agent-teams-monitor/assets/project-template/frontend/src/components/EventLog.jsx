import { useRef, useEffect, useState, useCallback } from 'react'
import { ArrowDown, Zap } from 'lucide-react'

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const typeColors = {
  'connected': 'border-success/30 bg-success/5',
  'team:config': 'border-accent/30 bg-accent/5',
  'team:inbox': 'border-info/30 bg-info/5',
  'task:update': 'border-warning/30 bg-warning/5',
  'debug:update': 'border-slate-600/30 bg-slate-800/30',
}

const typeBadgeColors = {
  'connected': 'bg-success/20 text-success',
  'team:config': 'bg-accent/20 text-accent-light',
  'team:inbox': 'bg-info/20 text-info',
  'task:update': 'bg-warning/20 text-warning',
  'debug:update': 'bg-slate-700/50 text-slate-400',
}

function EventEntry({ event }) {
  const borderColor = typeColors[event.type] || 'border-slate-700/30 bg-slate-800/30'
  const badgeColor = typeBadgeColors[event.type] || 'bg-slate-700/50 text-slate-400'

  let summary = ''
  if (event.type === 'connected') {
    summary = 'WebSocket connected'
  } else if (event.data) {
    const d = event.data
    if (event.type === 'team:config') {
      summary = `Team "${d.teamName}" config updated`
    } else if (event.type === 'team:inbox') {
      summary = `${d.agentName}@${d.teamName} received message`
    } else if (event.type === 'task:update') {
      const task = d.data || {}
      summary = `Task #${d.taskId} "${task.subject || ''}" - ${task.status || 'updated'}`
    } else if (event.type === 'debug:update') {
      summary = `Debug ${d.sessionId?.slice(0, 8)}: ${d.lines?.length || 0} new line(s)`
    }
  }

  return (
    <div className={`px-4 py-2 border-l-2 ${borderColor} hover:bg-slate-800/40 transition-colors log-entry-animate`}>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 font-mono w-[70px] flex-shrink-0">
          {formatTime(event.timestamp || event._receivedAt)}
        </span>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider flex-shrink-0 ${badgeColor}`}>
          {event.type}
        </span>
        <span className="text-sm text-slate-300 truncate flex-1">
          {summary}
        </span>
      </div>
    </div>
  )
}

export default function EventLog({ events }) {
  const containerRef = useRef(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [events, autoScroll])

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100
    setAutoScroll(isNearBottom)
    setShowScrollButton(!isNearBottom)
  }, [])

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
      setAutoScroll(true)
      setShowScrollButton(false)
    }
  }, [])

  if (events.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <Zap className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="text-sm font-medium">No events yet</p>
          <p className="text-xs mt-1 text-slate-600">
            Real-time events will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 relative min-h-0">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto custom-scrollbar"
      >
        <div className="divide-y divide-slate-800/30">
          {events.map((event) => (
            <EventEntry key={event._id} event={event} />
          ))}
        </div>
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-accent hover:bg-accent-light text-white rounded-full p-2 shadow-lg shadow-accent/25 transition-all cursor-pointer"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}

      {autoScroll && events.length > 0 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <span className="text-[10px] text-slate-600 bg-slate-900/80 px-2 py-0.5 rounded-full">
            Auto-scrolling
          </span>
        </div>
      )}
    </div>
  )
}
