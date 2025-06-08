'use client'

import { useState } from 'react'

import { useDexStore } from '@/store/useDexStore'

import ThemeToggle from './ThemeToggle'

export default function DexDemo() {
  const {
    markets,
    selectedMarket,
    wallet,
    orders,
    connectWallet,
    disconnectWallet,
    selectMarket,
    placeOrder,
  } = useDexStore()

  const [amount, setAmount] = useState<number>(0)
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy')
  const [limitPrice, setLimitPrice] = useState<number | null>(null)

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(parseFloat(e.target.value))
  }

  const handleOrderTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrderType(e.target.value as 'market' | 'limit')
  }

  const handleOrderSideChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrderSide(e.target.value as 'buy' | 'sell')
  }

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLimitPrice(parseFloat(e.target.value))
  }

  const handleSubmitOrder = () => {
    if (!selectedMarket) return

    placeOrder({
      market: selectedMarket,
      side: orderSide,
      type: orderType,
      amount,
      price: orderType === 'limit' ? limitPrice : null,
    })
  }

  const handleMarketClick = (marketName: string) => {
    selectMarket(marketName)
  }

  const handleMarketKeyDown = (e: React.KeyboardEvent, marketName: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      selectMarket(marketName)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Bymax OpenDEX [Under construction]
        </h1>
        <ThemeToggle />
      </div>

      {/* Wallet Connection */}
      <div className="mb-8 p-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Wallet
        </h2>
        {wallet.connected ? (
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              Connected: <span className="font-mono">{wallet.address}</span>
            </p>
            <h3 className="mt-2 font-medium text-gray-800 dark:text-white">
              Balances:
            </h3>
            <ul className="mt-1 text-gray-700 dark:text-gray-300">
              {Object.entries(wallet.balance).map(([token, balance]) => (
                <li key={token}>
                  {token}: {balance}
                </li>
              ))}
            </ul>
            <button
              onClick={disconnectWallet}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Connect Wallet
          </button>
        )}
      </div>

      {/* Market Selection */}
      <div className="mb-8 p-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Markets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(markets).map(([marketName, marketData]) => (
            <div
              key={marketName}
              onClick={() => handleMarketClick(marketName)}
              onKeyDown={(e) => handleMarketKeyDown(e, marketName)}
              role="button"
              tabIndex={0}
              aria-pressed={selectedMarket === marketName}
              className={`p-4 border dark:border-gray-700 rounded-lg cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedMarket === marketName
                  ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400'
                  : ''
              }`}
            >
              <h3 className="font-medium text-gray-800 dark:text-white">
                {marketName}
              </h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${marketData.price.toLocaleString()}
              </p>
              <p
                className={`text-sm ${marketData.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}
              >
                {marketData.change24h >= 0 ? '+' : ''}
                {marketData.change24h}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Vol: ${(marketData.volume24h / 1000000).toFixed(1)}M
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trading Interface */}
      {wallet.connected && selectedMarket && (
        <div className="mb-8 p-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Trade {selectedMarket}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="orderType"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Order Type
              </label>
              <select
                id="orderType"
                value={orderType}
                onChange={handleOrderTypeChange}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="market">Market</option>
                <option value="limit">Limit</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="orderSide"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Side
              </label>
              <select
                id="orderSide"
                value={orderSide}
                onChange={handleOrderSideChange}
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="amount"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Amount
            </label>
            <input
              id="amount"
              type="number"
              value={amount || ''}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {orderType === 'limit' && (
            <div className="mb-4">
              <label
                htmlFor="limitPrice"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Limit Price
              </label>
              <input
                id="limitPrice"
                type="number"
                value={limitPrice || ''}
                onChange={handleLimitPriceChange}
                placeholder="Enter limit price"
                className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          )}

          <button
            onClick={handleSubmitOrder}
            disabled={!amount || (orderType === 'limit' && !limitPrice)}
            className={`w-full p-3 text-white rounded ${
              orderSide === 'buy'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            } ${!amount || (orderType === 'limit' && !limitPrice) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {orderSide === 'buy' ? 'Buy' : 'Sell'} {selectedMarket}
          </button>
        </div>
      )}

      {/* Orders */}
      {wallet.connected && (
        <div className="p-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Orders
          </h2>

          {orders.pending.length > 0 && (
            <>
              <h3 className="font-medium mb-2 text-gray-800 dark:text-white">
                Pending Orders
              </h3>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="py-2 text-left text-gray-700 dark:text-gray-300">
                        Market
                      </th>
                      <th className="py-2 text-left text-gray-700 dark:text-gray-300">
                        Type
                      </th>
                      <th className="py-2 text-left text-gray-700 dark:text-gray-300">
                        Side
                      </th>
                      <th className="py-2 text-left text-gray-700 dark:text-gray-300">
                        Amount
                      </th>
                      <th className="py-2 text-left text-gray-700 dark:text-gray-300">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.pending.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b dark:border-gray-700"
                      >
                        <td className="py-2 text-gray-700 dark:text-gray-300">
                          {order.market}
                        </td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">
                          {order.type}
                        </td>
                        <td
                          className="py-2 font-medium"
                          style={{
                            color: order.side === 'buy' ? '#10b981' : '#ef4444',
                          }}
                        >
                          {order.side}
                        </td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">
                          {order.amount}
                        </td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">
                          {order.price || 'Market'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {orders.completed.length > 0 && (
            <>
              <h3 className="font-medium mb-2 text-gray-800 dark:text-white">
                Completed Orders
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="py-2 text-left text-gray-700 dark:text-gray-300">
                        Market
                      </th>
                      <th className="py-2 text-left text-gray-700 dark:text-gray-300">
                        Type
                      </th>
                      <th className="py-2 text-left text-gray-700 dark:text-gray-300">
                        Side
                      </th>
                      <th className="py-2 text-left text-gray-700 dark:text-gray-300">
                        Amount
                      </th>
                      <th className="py-2 text-left text-gray-700 dark:text-gray-300">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.completed.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b dark:border-gray-700"
                      >
                        <td className="py-2 text-gray-700 dark:text-gray-300">
                          {order.market}
                        </td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">
                          {order.type}
                        </td>
                        <td
                          className="py-2 font-medium"
                          style={{
                            color: order.side === 'buy' ? '#10b981' : '#ef4444',
                          }}
                        >
                          {order.side}
                        </td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">
                          {order.amount}
                        </td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">
                          {order.price || 'Market'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {orders.pending.length === 0 && orders.completed.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
          )}
        </div>
      )}
    </div>
  )
}
