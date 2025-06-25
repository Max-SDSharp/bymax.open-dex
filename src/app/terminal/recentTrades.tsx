'use client'

import { useEffect, useState } from 'react'

import { monitor } from '@/store/monitor'
import { useTradeStore } from '@/store/trade'
import { TradeData } from '@/types'

export default function RecentTrades() {
  const [trades, setTrades] = useState<TradeData[]>([])

  const { selectedSymbol } = useTradeStore()
  const monitors = monitor((state) =>
    state.items.find((m) => m.id === `trades_perp_${selectedSymbol?.id || 0}`),
  )

  // Number of trades to display
  const maxTrades = 30

  useEffect(() => {
    // return if no valid trades found
    if (!monitors?.data || !Array.isArray(monitors?.data)) {
      setTrades([])
      return
    }

    const tradeData = monitors.data

    // Process each trade in the array
    const validTrades = tradeData
      .map((item) => item.data)
      .filter((trade) => trade && typeof trade === 'object' && trade.ts)

    // return if no valid trades found
    if (validTrades.length === 0) {
      setTrades([])
      return
    }

    // Sort trades by timestamp in descending order and keep only the last maxTrades
    const sortedTrades = validTrades
      .sort((a, b) => b.ts - a.ts)
      .slice(0, maxTrades)

    // Update trades state with processed data
    setTrades(sortedTrades)
  }, [monitors?.data])

  if (!trades || trades.length === 0) {
    return (
      <div className="p-4 text-center text-foreground/70">
        No trade data available
      </div>
    )
  }

  const formatPrice = (trade: TradeData) => {
    if (!trade?.quoteAssetAmountFilled || !trade?.baseAssetAmountFilled)
      return null
    return (trade.quoteAssetAmountFilled / trade.baseAssetAmountFilled).toFixed(
      2,
    )
  }

  const formatSize = (trade: TradeData) => {
    if (!trade?.baseAssetAmountFilled) return null
    return trade.baseAssetAmountFilled.toFixed(4)
  }

  const formatTime = (trade: TradeData) => {
    if (!trade?.ts) return null
    return new Date(trade.ts * 1000).toLocaleTimeString()
  }

  const validTrades = trades.filter(
    (trade) =>
      trade?.ts &&
      trade?.quoteAssetAmountFilled &&
      trade?.baseAssetAmountFilled,
  )

  if (validTrades.length === 0) {
    return (
      <div className="p-4 text-center text-foreground/70">
        No valid trade data available
      </div>
    )
  }

  return (
    <div className="bg-secondary/20 rounded-lg overflow-hidden h-[400px]">
      <div className="p-2 h-full">
        <div className="grid grid-cols-3 text-xs text-foreground/70 mb-1 px-2">
          <div className="text-left">PRICE</div>
          <div className="text-center">SIZE</div>
          <div className="text-right">TIME</div>
        </div>

        <div className="space-y-1 overflow-y-auto h-[calc(100%-24px)]">
          {validTrades.map((trade, index) => (
            <div
              key={`${trade?.txSig || index}-${index}`}
              className={`grid grid-cols-3 text-xs py-0.5 px-2 ${
                trade?.takerOrderDirection === 'long'
                  ? 'hover:bg-green-900/20'
                  : 'hover:bg-red-900/20'
              }`}
            >
              <div
                className={`font-mono text-left ${
                  trade?.takerOrderDirection === 'long'
                    ? 'text-success'
                    : 'text-error'
                }`}
              >
                ${formatPrice(trade)}
              </div>
              <div className="text-center font-mono">{formatSize(trade)}</div>
              <div className="text-right font-mono text-foreground/70">
                {formatTime(trade)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
