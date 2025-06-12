'use client'

import { useWebSocket } from '@/hooks/useWebSocket'

const subscriptions = [
  {
    marketType: 'perp',
    channel: 'orderbook',
    market: 'SOL-PERP',
  },
  {
    marketType: 'perp',
    channel: 'trades',
    market: 'SOL-PERP',
  },
]

export default function WebSocketProcess() {
  useWebSocket(subscriptions)
  return null
}
