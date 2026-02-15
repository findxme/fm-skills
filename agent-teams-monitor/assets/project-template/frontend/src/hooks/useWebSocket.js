import { useState, useEffect, useRef, useCallback } from 'react'

const WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`

export function useWebSocket() {
  const [connected, setConnected] = useState(false)
  const [events, setEvents] = useState([])
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const eventIdRef = useRef(0)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(WS_URL)

    ws.onopen = () => {
      setConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        const id = ++eventIdRef.current

        setEvents((prev) => {
          const next = [...prev, { ...message, _id: id, _receivedAt: Date.now() }]
          if (next.length > 2000) {
            return next.slice(next.length - 2000)
          }
          return next
        })
      } catch {
        // ignore malformed messages
      }
    }

    ws.onclose = () => {
      setConnected(false)
      reconnectTimeoutRef.current = setTimeout(connect, 2000)
    }

    ws.onerror = () => {
      ws.close()
    }

    wsRef.current = ws
  }, [])

  const sendMessage = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg))
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimeoutRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  return { connected, events, sendMessage, clearEvents }
}
