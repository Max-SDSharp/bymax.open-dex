'use client'

import { monitor } from '@/store/monitor'

type OrderBookEntry = {
  price: number
  size: number
  total: number
}

export default function OrderBook() {
  const monitors = monitor((state) =>
    state.items.find((m) => m.id === 'orderbook_perp_0_SOL-PERP'),
  )

  // Create copies of the arrays to avoid modifying read-only objects
  const bids: OrderBookEntry[] = monitors?.data?.bids
    ? [...monitors.data.bids]
    : []
  const asks: OrderBookEntry[] = monitors?.data?.asks
    ? [...monitors.data.asks]
    : []

  return (
    <div className="bg-secondary/20 rounded-lg overflow-hidden">
      <div className="p-2">
        <div className="grid grid-cols-2 text-xs text-foreground/70 mb-1 px-2">
          <div className="text-left">PRICE[$]</div>
          <div className="text-right">SIZE[SOL]</div>
        </div>

        {/* Asks (sell orders) - displayed in reverse order */}
        <div className="mb-1">
          {asks.reverse().map((ask, index) => (
            <div
              key={`ask-${index}`}
              className="grid grid-cols-2 text-xs py-0.5 px-2 hover:bg-red-900/20"
              style={{
                background: `linear-gradient(to left, rgba(239, 68, 68, ${(index + 1) * 0.05}) 0%, rgba(239, 68, 68, 0) 100%)`,
              }}
            >
              <div className="text-error font-mono">
                {parseFloat(ask.price.toString()) / 1000000}
              </div>
              <div className="text-right font-mono">
                {parseFloat(ask.size.toString()) / 1000000000}
              </div>
            </div>
          ))}
        </div>

        {/* Current price */}
        <div className="grid grid-cols-2 text-xs py-1 px-2 bg-primary/5 border-y border-border font-bold">
          <div className="text-foreground">
            ${parseFloat(monitors?.data?.oracle?.toString() || '0') / 1000000}
          </div>
        </div>

        {/* Bids (buy orders) */}
        <div className="mt-1">
          {bids.map((bid, index) => (
            <div
              key={`bid-${index}`}
              className="grid grid-cols-2 text-xs py-0.5 px-2 hover:bg-green-900/20"
              style={{
                background: `linear-gradient(to left, rgba(16, 185, 129, ${(index + 1) * 0.05}) 0%, rgba(16, 185, 129, 0) 100%)`,
              }}
            >
              <div className="text-success font-mono">
                {parseFloat(bid.price.toString()) / 1000000}
              </div>
              <div className="text-right font-mono">
                {parseFloat(bid.size.toString()) / 1000000000}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
