import { useState, useEffect, useRef, useCallback } from 'react'
import { Terminal, ArrowDown } from 'lucide-react'

export default function DebugPanel({ sessions, sendMessage, events }) {
  const [selectedSession, setSelectedSession] = useState(null)
  const [lines, setLines] = useState([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Fetch initial debug log when session is selected
  useEffect(() => {
    if (!selectedSession) {
      setLines([])
      return
    }

    setLoading(true)
    fetch(`/api/debug/sessions/${encodeURIComponent(selectedSession)}?lines=500`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) setLines(data.lines || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Subscribe to debug updates
    sendMessage({ type: 'watch_debug', sessionId: selectedSession })

    return () => {
      sendMessage({ type: 'unwatch_debug', sessionId: selectedSession })
    }
  }, [selectedSession, sendMessage])

  // Append new debug lines from WebSocket events
  useEffect(() => {
    if (!selectedSession) return

    const debugEvents = events.filter(
      (e) => e.type === 'debug:update' && e.data?.sessionId === selectedSession
    )

    if (debugEvents.length > 0) {
      const lastEvent = debugEvents[debugEvents.length - 1]
      if (lastEvent.data?.lines) {
        setLines((prev) => {
          const next = [...prev, ...lastEvent.data.lines]
          if (next.length > 2000) return next.slice(next.length - 2000)
          return next
        })
      }
    }
  }, [events, selectedSession])

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [lines, autoScroll])

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100
    setAutoScroll(isNearBottom)
  }, [])

  if (sessions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <Terminal className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="text-sm font-medium">No debug sessions</p>
          <p className="text-xs mt-1 text-slate-600">
            Debug logs will appear when agents start
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Session tabs */}
      <div className="flex items-center gap-1 px-3 py-2 bg-slate-900/50 border-b border-slate-800/50 overflow-x-auto flex-shrink-0">
        <Terminal className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mr-1" />
        {sessions.map((session) => (
          <button
            key={session.sessionId}
            onClick={() => setSelectedSession(
              selectedSession === session.sessionId ? null : session.sessionId
            )}
            className={`px-2.5 py-1 rounded text-xs font-mono whitespace-nowrap cursor-pointer transition-colors ${
              selectedSession === session.sessionId
                ? 'bg-accent/20 text-accent-light'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            {session.sessionId.slice(0, 12)}
          </button>
        ))}
      </div>

      {/* Log content */}
      {selectedSession ? (
        <div className="flex-1 relative min-h-0">
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="absolute inset-0 overflow-y-auto custom-scrollbar bg-slate-950 font-mono text-xs"
          >
            {loading ? (
              <div className="p-4 text-slate-500">Loading...</div>
            ) : lines.length === 0 ? (
              <div className="p-4 text-slate-600">Empty log</div>
            ) : (
              <div className="p-2">
                {lines.map((line, i) => (
                  <div key={i} className="py-0.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 px-2 rounded transition-colors">
                    <span className="text-slate-600 select-none mr-3 inline-block w-[40px] text-right">
                      {i + 1}
                    </span>
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
          Select a debug session to view logs
        </div>
      )}
    </div>
  )
}
