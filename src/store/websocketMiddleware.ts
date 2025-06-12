import { Draft } from 'immer'

import { monitor } from './monitor'
import { createStore } from './store'

import WebsocketService from '@/services/websocketService'

/**
 * Enum defining WebSocket event channel types
 */
export enum WebSocketEventType {
  ORDER_BOOK = 'orderbook_perp',
}

/**
 * Interface for order book data structure
 *
 * @property marketName - Name of the market
 * @property bids - Array of bid orders with price, size, and total
 * @property asks - Array of ask orders with price, size, and total
 * @property oracle - Oracle price value
 */
interface OrderBookData {
  marketName: string
  bids: Array<{ price: number; size: number; total: number }>
  asks: Array<{ price: number; size: number; total: number }>
  oracle: number
}

/**
 * Interface for WebSocket message structure
 *
 * @property channel - The message channel or event type
 * @property data - Raw JSON data string to be parsed
 */
export interface WebSocketMessage {
  channel: WebSocketEventType | string
  data: string // Raw JSON data that will be parsed
}

/**
 * WebSocket state management interface
 *
 * @property connected - Current connection status
 * @property connect - Function to establish WebSocket connection
 * @property disconnect - Function to close WebSocket connection
 */
interface WebSocketState {
  connected: boolean
  connect: () => void
  disconnect: () => void
}

/**
 * WebSocket store for managing WebSocket connections and message handling
 * Uses the WebsocketService to handle the actual connection
 */
export const websocket = createStore<WebSocketState>((set, get) => {
  let unsubscribe: (() => void) | null = null

  /**
   * Handles incoming WebSocket messages
   * Parses message data and updates the monitor store accordingly
   *
   * @param message - The WebSocket message to process
   */
  const handleWebSocketMessage = (message: WebSocketMessage) => {
    const { channel, data } = message

    if (channel?.includes(WebSocketEventType.ORDER_BOOK)) {
      const orderBookData = JSON.parse(data) as OrderBookData
      // Ensure that bids and asks have at most 10 elements
      if (Array.isArray(orderBookData.bids)) {
        orderBookData.bids = orderBookData.bids.slice(0, 10)
      }
      if (Array.isArray(orderBookData.asks)) {
        orderBookData.asks = orderBookData.asks.slice(0, 10)
      }
      monitor.getState().addMonitor({
        id: `${channel}_${orderBookData.marketName}`,
        data: orderBookData,
        lastUpdate: Date.now(),
      })
    }
  }

  return {
    connected: false,

    /**
     * Establishes WebSocket connection if not already connected
     * Sets up message handler and updates connection status
     */
    connect: () => {
      if (!get().connected) {
        WebsocketService.connect()

        unsubscribe = WebsocketService.onMessage(
          (message: WebSocketMessage) => {
            handleWebSocketMessage(message)
          },
        )

        set((state: Draft<WebSocketState>) => {
          state.connected = true
        })
      }
    },

    /**
     * Closes WebSocket connection if currently connected
     * Cleans up event handlers and updates connection status
     */
    disconnect: () => {
      if (unsubscribe) {
        WebsocketService.disconnect()
        unsubscribe()
        unsubscribe = null

        set((state: Draft<WebSocketState>) => {
          state.connected = false
        })
      }
    },
  }
})
