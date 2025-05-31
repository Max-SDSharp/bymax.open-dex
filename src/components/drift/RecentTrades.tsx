'use client'

import { useMarketSymbol } from './hooks/useMarketSymbol'
import { useTrades } from './hooks/useTrades'

/**
 * RecentTrades component
 * Displays recent trades for a selected market
 */
export default function RecentTrades({
  marketIndex = 0,
}: {
  marketIndex?: number
}) {
  const { trades, loading, error } = useTrades(marketIndex)
  const { symbol } = useMarketSymbol(marketIndex)

  // Format price with appropriate precision
  const formatPrice = (price: number) => {
    if (price < 0.1) return price.toFixed(6)
    if (price < 1) return price.toFixed(4)
    if (price < 10) return price.toFixed(3)
    if (price < 1000) return price.toFixed(2)
    return price.toFixed(1)
  }

  // Format size with appropriate precision
  const formatSize = (size: number) => {
    if (size < 0.1) return size.toFixed(4)
    if (size < 1) return size.toFixed(2)
    return size.toFixed(1)
  }

  // Format timestamp to a readable format
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-lg font-semibold mb-2">Recent Trades</h3>
        <div className="text-xs text-muted-foreground">{symbol}</div>
        <div className="flex justify-center items-center h-64">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-lg font-semibold mb-2">Recent Trades</h3>
        <div className="text-xs text-muted-foreground">{symbol}</div>
        <div className="flex justify-center items-center h-64">
          <div className="text-sm text-destructive">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-lg font-semibold mb-2">Recent Trades</h3>
      <div className="text-xs text-muted-foreground">{symbol}</div>
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="font-normal text-left pb-2">Price</th>
              <th className="font-normal text-right pb-2">Size</th>
              <th className="font-normal text-right pb-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.length > 0 ? (
              trades.map((trade, index) => (
                <tr
                  key={index}
                  className="text-xs border-t border-border hover:bg-accent/50"
                >
                  <td
                    className={`py-1 ${
                      trade.side === 'buy' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {formatPrice(trade.price)}
                  </td>
                  <td className="py-1 text-right">{formatSize(trade.size)}</td>
                  <td className="py-1 text-right">
                    {formatTime(trade.timestamp)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-10 text-sm text-muted-foreground"
                >
                  No recent trades
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
