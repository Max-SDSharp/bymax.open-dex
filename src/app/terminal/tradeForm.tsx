'use client'

export default function TradeForm() {
  return (
    <div className="bg-secondary/20 rounded-lg overflow-hidden">
      <div className="flex bg-secondary/40 border-b border-border">
        <div className="flex-1 text-center px-4 py-2">
          <button className="w-full py-1 rounded-md text-center font-medium text-foreground/70">
            Buy
          </button>
        </div>
        <div className="flex-1 text-center px-4 py-2">
          <button className="w-full py-1 rounded-md text-center font-medium text-foreground/70">
            Sell
          </button>
        </div>
      </div>

      <form className="p-4">
        <div className="mb-4">
          <label
            htmlFor="orderType"
            className="block text-foreground/70 text-sm mb-1"
          >
            ORDER TYPE
          </label>
          <div className="flex">
            <div className="relative w-full">
              <select
                id="orderType"
                className="bg-input border border-border rounded-md py-2 px-3 w-full appearance-none text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Limit">Limit</option>
                <option value="Market">Market</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-foreground/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="limitPrice"
            className="block text-foreground/70 text-sm mb-1"
          >
            LIMIT PRICE
          </label>
          <input
            id="limitPrice"
            type="text"
            placeholder="0.00"
            className="bg-input border border-border rounded-md py-2 px-3 w-full text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="amount"
            className="block text-foreground/70 text-sm mb-1"
          >
            AMOUNT
          </label>
          <div className="flex">
            <input
              id="amount"
              type="text"
              placeholder="0.00"
              className="bg-input border border-border rounded-l-md py-2 px-3 w-full text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
            <div className="bg-secondary flex items-center px-3 rounded-r-md border border-l-0 border-border">
              <select className="bg-transparent text-sm focus:outline-none">
                <option>USD</option>
                <option>BTC</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="flex items-center text-foreground/70 text-sm mb-2"
        >
          <span className="uppercase">Advanced</span>
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div className="flex justify-between text-xs text-foreground/70 mb-4">
          <span>CURRENT ACCOUNT LEVERAGE</span>
          <span className="font-mono">1.5x</span>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-md font-medium bg-success hover:bg-success/90 text-white"
        >
          Buy Limit BTC-PERP
        </button>
      </form>
    </div>
  )
}
