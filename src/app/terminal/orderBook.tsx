'use client'

type OrderBookEntry = {
  price: number
  size: number
  total: number
}

export default function OrderBook() {
  // Fixed values for bids and asks
  const bids: OrderBookEntry[] = [
    { price: 20.0, size: 1.234, total: 1.234 },
    { price: 19.99, size: 2.345, total: 3.579 },
    { price: 19.98, size: 3.456, total: 7.035 },
    { price: 19.97, size: 4.567, total: 11.602 },
    { price: 19.96, size: 5.678, total: 17.28 },
    { price: 19.95, size: 6.789, total: 24.069 },
    { price: 19.94, size: 7.89, total: 31.959 },
    { price: 19.93, size: 8.901, total: 40.86 },
    { price: 19.92, size: 9.012, total: 50.872 },
    { price: 19.91, size: 10.123, total: 60.995 },
  ]

  const asks: OrderBookEntry[] = [
    { price: 20.01, size: 1.123, total: 1.123 },
    { price: 20.02, size: 2.234, total: 3.357 },
    { price: 20.03, size: 3.345, total: 6.702 },
    { price: 20.04, size: 4.456, total: 11.158 },
    { price: 20.05, size: 5.567, total: 16.725 },
    { price: 20.06, size: 6.678, total: 23.403 },
    { price: 20.07, size: 7.789, total: 31.192 },
    { price: 20.08, size: 8.89, total: 40.082 },
    { price: 20.09, size: 9.901, total: 49.983 },
    { price: 20.1, size: 10.012, total: 59.995 },
  ]

  const selectedPair = { price: 20.03 }

  return (
    <div className="bg-secondary/20 rounded-lg overflow-hidden">
      <div className="p-2">
        <div className="grid grid-cols-3 text-xs text-foreground/70 mb-1 px-2">
          <div className="text-left">PRICE[$]</div>
          <div className="text-right">SIZE[SOL]</div>
          <div className="text-right">TOTAL[$]</div>
        </div>

        {/* Asks (sell orders) - displayed in reverse order */}
        <div className="mb-1">
          {asks
            .slice()
            .reverse()
            .map((ask, index) => (
              <div
                key={`ask-${index}`}
                className="grid grid-cols-3 text-xs py-0.5 px-2 hover:bg-red-900/20"
                style={{
                  background: `linear-gradient(to left, rgba(239, 68, 68, ${(index + 1) * 0.05}) 0%, rgba(239, 68, 68, 0) 100%)`,
                }}
              >
                <div className="text-error font-mono">
                  {ask.price.toFixed(2)}
                </div>
                <div className="text-right font-mono">
                  {ask.size.toFixed(2)}
                </div>
                <div className="text-right font-mono">
                  {ask.total.toFixed(2)}
                </div>
              </div>
            ))}
        </div>

        {/* Current price */}
        <div className="grid grid-cols-3 text-xs py-1 px-2 bg-primary/5 border-y border-border font-bold">
          <div className="text-foreground">
            ${selectedPair.price.toFixed(2)}
          </div>
          <div className="text-right">SPREAD</div>
          <div className="text-right">$0.0001</div>
        </div>

        {/* Bids (buy orders) */}
        <div className="mt-1">
          {bids.map((bid, index) => (
            <div
              key={`bid-${index}`}
              className="grid grid-cols-3 text-xs py-0.5 px-2 hover:bg-green-900/20"
              style={{
                background: `linear-gradient(to left, rgba(16, 185, 129, ${(index + 1) * 0.05}) 0%, rgba(16, 185, 129, 0) 100%)`,
              }}
            >
              <div className="text-success font-mono">
                {bid.price.toFixed(2)}
              </div>
              <div className="text-right font-mono">{bid.size.toFixed(2)}</div>
              <div className="text-right font-mono">{bid.total.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
