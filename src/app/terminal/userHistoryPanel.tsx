'use client'

export default function PositionsTable() {
  // Sample static data for demonstration
  const positions = [
    {
      market: 'BTC-USDT',
      side: 'LONG',
      entryPrice: 50000,
      qty: 0.1,
      usdValue: 5000,
      liqPrice: 45000,
      pnl: 500,
      pnlPercent: 10,
    },
    {
      market: 'ETH-USDT',
      side: 'SHORT',
      entryPrice: 3000,
      qty: 1,
      usdValue: 3000,
      liqPrice: 3300,
      pnl: -200,
      pnlPercent: -6.67,
    },
  ]

  return (
    <div className="bg-secondary/20 rounded-lg overflow-hidden">
      <div className="flex items-center px-4 py-2 border-b border-border">
        <div className="flex space-x-4">
          <button className="px-4 py-1 border-b-2 border-primary text-foreground font-medium">
            Positions
          </button>
          <button className="px-4 py-1 text-foreground/70">Orders</button>
          <button className="px-4 py-1 text-foreground/70">
            Trade History
          </button>
          <button className="px-4 py-1 text-foreground/70">
            Account Status
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-foreground/70 border-b border-border">
              <th className="px-4 py-2 text-left whitespace-nowrap">
                <div className="flex items-center">
                  MARKET
                  <svg
                    className="w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4"
                    />
                  </svg>
                </div>
              </th>
              <th className="px-4 py-2 text-left whitespace-nowrap">
                <div className="flex items-center">
                  SIDE
                  <svg
                    className="w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4"
                    />
                  </svg>
                </div>
              </th>
              <th className="px-4 py-2 text-left whitespace-nowrap">
                <div className="flex items-center">
                  ENTRY PRICE
                  <svg
                    className="w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4"
                    />
                  </svg>
                </div>
              </th>
              <th className="px-4 py-2 text-left whitespace-nowrap">
                <div className="flex items-center">
                  QTY
                  <svg
                    className="w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4"
                    />
                  </svg>
                </div>
              </th>
              <th className="px-4 py-2 text-left whitespace-nowrap">
                <div className="flex items-center">
                  USD VALUE
                  <svg
                    className="w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4"
                    />
                  </svg>
                </div>
              </th>
              <th className="px-4 py-2 text-left whitespace-nowrap">
                <div className="flex items-center">
                  LIQ. PRICE
                  <svg
                    className="w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4"
                    />
                  </svg>
                </div>
              </th>
              <th className="px-4 py-2 text-left whitespace-nowrap">
                <div className="flex items-center">
                  PNL
                  <svg
                    className="w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4"
                    />
                  </svg>
                </div>
              </th>
              <th className="px-4 py-2 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <tr
                key={position.market}
                className="border-b border-border hover:bg-secondary/10"
              >
                <td className="px-4 py-3 whitespace-nowrap font-medium">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center mr-2">
                      <span className="text-xs">
                        {position.market.split('-')[0].charAt(0)}
                      </span>
                    </div>
                    {position.market}
                  </div>
                  <div className="text-xs text-foreground/50">
                    $
                    {position.entryPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8,
                    })}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${position.side === 'LONG' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}
                  >
                    {position.side}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  $
                  {position.entryPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8,
                  })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {position.qty.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8,
                  })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  $
                  {position.usdValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  $
                  {position.liqPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8,
                  })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div
                    className={
                      position.pnl >= 0 ? 'text-success' : 'text-error'
                    }
                  >
                    <svg
                      className={`inline-block w-3 h-3 mr-1 ${position.pnl >= 0 ? 'rotate-0' : 'rotate-180'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                    ${Math.abs(position.pnl).toFixed(2)}
                  </div>
                  <div
                    className={`text-xs ${position.pnl >= 0 ? 'text-success' : 'text-error'}`}
                  >
                    {position.pnl >= 0 ? '+' : ''}
                    {position.pnlPercent.toFixed(2)}%
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <button className="text-foreground/70 hover:text-foreground px-3 py-1 text-xs border border-border rounded-md hover:bg-secondary/30">
                    CLOSE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
