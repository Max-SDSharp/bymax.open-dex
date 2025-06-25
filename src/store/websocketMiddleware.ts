import { Draft } from 'immer'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { monitor } from './monitor'

import WebsocketService from '@/services/websocketService'
import { OrderBookData, TradeData } from '@/types'

/**
 * Enum defining WebSocket event channel types
 */
export enum WebSocketEventType {
  ORDER_BOOK = 'orderbook_perp',
  TRADES = 'trades_perp',
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
export const websocket = create<WebSocketState>()(
  devtools(
    immer((set, get) => {
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
          if (Array.isArray(orderBookData.bids)) {
            orderBookData.bids = orderBookData.bids.slice(0, 9)
          }
          if (Array.isArray(orderBookData.asks)) {
            orderBookData.asks = orderBookData.asks.slice(0, 9)
          }
          monitor.getState().addMonitor({
            id: `${channel}`,
            data: orderBookData,
            lastUpdate: Date.now(),
          })
        } else if (channel?.includes(WebSocketEventType.TRADES)) {
          const tradeData = JSON.parse(data) as TradeData
          monitor.getState().addMonitorHistory({
            id: `${channel}`,
            data: tradeData,
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
              .then(() => {
                unsubscribe = WebsocketService.onMessage(
                  (message: WebSocketMessage) => {
                    handleWebSocketMessage(message)
                  },
                )

                set((state: Draft<WebSocketState>) => {
                  state.connected = true
                })
              })
              .catch((error) => {
                console.error('Failed to connect to WebSocket:', error)
                set((state: Draft<WebSocketState>) => {
                  state.connected = false
                })
              })
          }
        },

        /**
         * Closes WebSocket connection if currently connected
         * Cleans up event handlers and updates connection status
         */
        disconnect: () => {
          if (get().connected) {
            WebsocketService.disconnect()

            if (unsubscribe) {
              unsubscribe()
              unsubscribe = null
            }

            set((state: Draft<WebSocketState>) => {
              state.connected = false
            })
          }
        },
      }
    }),
  ),
)
