import { useEffect } from 'react'

import websocketService from '@/services/websocketService'
import { websocket } from '@/store/websocketMiddleware'

interface WebSocketSubscription {
  marketType: string
  channel: string
  market: string
}

export const useWebSocket = (subscriptions: WebSocketSubscription[]) => {
  useEffect(() => {
    // Connect to WebSocket
    websocket.getState().connect()

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
        subscriptions.forEach(subscribe)
      } else {
        setTimeout(waitForConnection, 200)
      }
    }

    waitForConnection()

    // Cleanup function
    return () => {
      subscriptions.forEach(unsubscribe)
      websocket.getState().disconnect()
    }
  }, [subscriptions])
}
