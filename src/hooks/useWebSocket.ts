import { useEffect, useRef } from 'react'

import websocketService from '@/services/websocketService'
import { monitor } from '@/store/monitor'
import { websocket } from '@/store/websocketMiddleware'

interface WebSocketSubscription {
  marketType: string
  channel: string
  market: string
}

export const useWebSocket = (subscriptions: WebSocketSubscription[]) => {
  const currentSubscriptions = useRef<WebSocketSubscription[]>([])

  useEffect(() => {
    // Capture the current subscriptions to use in cleanup
    currentSubscriptions.current = [...subscriptions]

    // Connect to WebSocket if not already connected
    if (!websocket.getState().connected) {
      websocket.getState().connect()
    }

    // Function to subscribe to a channel
    const subscribe = (subscription: WebSocketSubscription) => {
      websocketService.send({
        type: 'subscribe',
        ...subscription,
      })
    }

    // Function to unsubscribe from a channel
    const unsubscribe = (subscription: WebSocketSubscription) => {
      websocketService.send({
        type: 'unsubscribe',
        ...subscription,
      })
    }

    // Wait for connection before sending subscriptions
    const waitForConnection = () => {
      if (websocketService.isActive()) {
        currentSubscriptions.current.forEach(subscribe)
      } else {
        setTimeout(waitForConnection, 200)
      }
    }

    waitForConnection()

    // Cleanup function - unsubscribe from channels and clear monitors
    return () => {
      // Unsubscribe from current channels
      currentSubscriptions.current.forEach(unsubscribe)

      // Clear monitors that contain "orderbook_perp" or "trades_perp" in their ID
      const currentMonitors = monitor.getState().items
      currentMonitors.forEach((monitorItem) => {
        if (
          monitorItem.id.includes('orderbook_perp') ||
          monitorItem.id.includes('trades_perp')
        ) {
          monitor.getState().removeMonitor(monitorItem.id)
        }
      })
    }
  }, [subscriptions])

  // Handle page unload/refresh - only disconnect when the page is actually leaving
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (websocket.getState().connected) {
        websocket.getState().disconnect()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])
}
