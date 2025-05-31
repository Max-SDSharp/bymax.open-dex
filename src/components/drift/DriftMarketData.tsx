'use client'

import { useState, useEffect } from 'react'

import MarketSelector from './MarketSelector'
import OrderBook from './OrderBook'
import RecentTrades from './RecentTrades'

/**
 * DriftMarketData component
 * Main container for market data visualization
 */
export default function DriftMarketData() {
  const [selectedMarket, setSelectedMarket] = useState<number>(0) // Default to SOL-PERP (index 0)

  // Handle market selection changes
  const handleMarketSelect = (marketIndex: number) => {
    console.log(`Changing market to index: ${marketIndex}`)
    setSelectedMarket(marketIndex)
  }

  // Log market changes for debugging
  useEffect(() => {
    console.log(`Selected market changed to: ${selectedMarket}`)
  }, [selectedMarket])

  return (
    <div className="space-y-6">
      <MarketSelector
        selectedMarket={selectedMarket}
        onSelectMarket={handleMarketSelect}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OrderBook marketIndex={selectedMarket} />
        <RecentTrades marketIndex={selectedMarket} />
      </div>
    </div>
  )
}
