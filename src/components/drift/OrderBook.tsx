'use client'

import { useState, useEffect } from 'react'

import { useMarketSymbol } from './hooks/useMarketSymbol'
import { useOrderBook } from './hooks/useOrderBook'

/**
 * OrderBook component
 * Displays the order book for a selected market
 */
export default function OrderBook({
  marketIndex = 0,
}: {
  marketIndex?: number
}) {
  const { orderBook, loading, error } = useOrderBook(marketIndex)
  const { symbol } = useMarketSymbol(marketIndex)
  // Depth state não está sendo usado ativamente, mas poderia ser usado para implementar
  // funcionalidade de ajuste de profundidade do orderbook no futuro
  const [depth] = useState<number>(20) // Default to showing 20 levels

  // Log market changes for debugging
  useEffect(() => {
    console.log(`OrderBook: Received marketIndex: ${marketIndex}`)
  }, [marketIndex])

  // Calculate maximum size for scaling visualization
  const maxSize = Math.max(
    ...orderBook.asks.map((ask) => ask.size),
    ...orderBook.bids.map((bid) => bid.size),
  )

  // Find the middle price (spread midpoint)
  const midPrice =
    orderBook.asks.length > 0 && orderBook.bids.length > 0
      ? (orderBook.asks[0].price + orderBook.bids[0].price) / 2
      : 0

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      <div className="p-3 border-b border-gray-800">
        <h2 className="text-lg font-medium text-white">Orderbook</h2>
        <div className="text-xs text-gray-400">{symbol}</div>
      </div>

      {error && (
        <div className="p-3 bg-red-900 text-white">
          <p>{error}</p>
        </div>
      )}

      {loading && orderBook.asks.length === 0 && orderBook.bids.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs text-gray-400">
                  Price
                </th>
                <th className="px-4 py-2 text-right text-xs text-gray-400">
                  Size
                </th>
                <th className="w-1/2"></th> {/* Column for visualization */}
              </tr>
            </thead>
            <tbody>
              {/* Asks (Sell orders) - displayed in reverse order */}
              {orderBook.asks.slice(0, depth).map((ask, index) => (
                <tr key={`ask-${index}`} className="border-b border-gray-800">
                  <td className="px-4 py-1 text-red-500">
                    {ask.price.toFixed(4)}
                  </td>
                  <td className="px-4 py-1 text-right text-blue-400">
                    {ask.size.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="py-1 pr-2">
                    <div
                      className="h-5 bg-red-900 opacity-50 ml-auto"
                      style={{
                        width: `${(ask.size / maxSize) * 100}%`,
                      }}
                    ></div>
                  </td>
                </tr>
              ))}

              {/* Spread/Midpoint */}
              <tr className="bg-gray-800">
                <td
                  colSpan={3}
                  className="px-4 py-1 text-center text-purple-400"
                >
                  {midPrice > 0
                    ? `${midPrice.toFixed(4)} (Re-center)`
                    : 'Loading...'}
                </td>
              </tr>

              {/* Bids (Buy orders) */}
              {orderBook.bids.slice(0, depth).map((bid, index) => (
                <tr key={`bid-${index}`} className="border-b border-gray-800">
                  <td className="px-4 py-1 text-green-500">
                    {bid.price.toFixed(4)}
                  </td>
                  <td className="px-4 py-1 text-right text-blue-400">
                    {bid.size.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="py-1 pr-2">
                    <div
                      className="h-5 bg-green-900 opacity-50 ml-auto"
                      style={{
                        width: `${(bid.size / maxSize) * 100}%`,
                      }}
                    ></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
