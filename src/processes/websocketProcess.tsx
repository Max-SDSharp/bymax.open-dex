'use client'

import { useWebSocket } from '@/hooks/useWebSocket'
import { monitor } from '@/store/monitor'
import { useTradeStore } from '@/store/trade'

export default function WebSocketProcess() {
  const { selectedSymbol } = useTradeStore()

  // Get contracts from store to check if they're loaded
  const contracts = monitor((state) => {
    const contractItem = state.items.find((item) => item.id === 'contracts')
    return contractItem?.data || null
  })

  // Only create subscriptions if contracts are loaded and symbol is selected
  const subscriptions =
    selectedSymbol &&
    contracts &&
    Array.isArray(contracts) &&
    contracts.length > 0
      ? [
          {
            marketType: 'perp',
            channel: 'orderbook',
            market: `${selectedSymbol.base}-PERP`,
          },
          {
            marketType: 'perp',
            channel: 'trades',
            market: `${selectedSymbol.base}-PERP`,
          },
        ]
      : []

  useWebSocket(subscriptions)
  return null
}
