import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook for managing WebSocket connections in browser environments
 */
export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const webSocketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // In browser environments, WebSocket is globally available
    // In Node.js environments, we'd need to import the 'ws' package
    if (typeof window !== 'undefined') {
      const ws = new WebSocket(url)

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setError(null)
      }

      ws.onerror = (event) => {
        console.error('WebSocket error:', event)
        setError('Failed to connect to WebSocket server')
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
      }

      webSocketRef.current = ws

      return () => {
        ws.close()
        webSocketRef.current = null
      }
    }
  }, [url])

  // Function to send data through the WebSocket
  const sendMessage = (data: any) => {
    if (
      webSocketRef.current &&
      webSocketRef.current.readyState === WebSocket.OPEN
    ) {
      webSocketRef.current.send(
        typeof data === 'string' ? data : JSON.stringify(data),
      )
      return true
    }
    return false
  }

  // Subscribe to a channel
  const subscribe = (params: {
    marketType: 'perp' | 'spot'
    channel: 'orderbook' | 'trades'
    market: string
  }) => {
    return sendMessage({
      type: 'subscribe',
      ...params,
    })
  }

  // Unsubscribe from a channel
  const unsubscribe = (params: {
    marketType: 'perp' | 'spot'
    channel: 'orderbook' | 'trades'
    market: string
  }) => {
    return sendMessage({
      type: 'unsubscribe',
      ...params,
    })
  }

  return {
    isConnected,
    error,
    sendMessage,
    subscribe,
    unsubscribe,
    webSocket: webSocketRef.current,
  }
}
