'use client'

import { FormEvent, useState } from 'react'

import { useDriftStore } from './hooks/useDriftStore'
import { OrderSide, OrderType } from './types'

/**
 * TradeForm component
 * Provides a form for placing trades on Drift
 */
export default function TradeForm() {
  const { placeOrder, connected, viewMode, loading } = useDriftStore()

  // Trading states
  const [selectedMarket, setSelectedMarket] = useState<number>(1) // Default to SOL-PERP (index 1)
  const [orderType, setOrderType] = useState<OrderType>('market')
  const [orderSide, setOrderSide] = useState<OrderSide>('buy')
  const [amount, setAmount] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [localError, setLocalError] = useState<string | null>(null)

  /**
   * Handle order form submission
   * @param e Form event
   */
  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!amount || parseFloat(amount) <= 0) {
      setLocalError('Please enter a valid amount')
      return
    }

    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      setLocalError('Please enter a valid price')
      return
    }

    try {
      await placeOrder(orderType, orderSide, selectedMarket, amount, price)

      // Clear form on success
      setAmount('')
      setPrice('')
    } catch (err) {
      console.error('Error in trade form:', err)
    }
  }

  // Only show trading form for connected wallet (not view mode)
  if (viewMode === 'view') {
    return (
      <div className="bg-white dark:bg-gray-900 p-4 border rounded-lg shadow-sm dark:border-gray-700">
        <h2 className="text-xl font-medium mb-4">Trade</h2>
        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400">
            Trading is not available in view-only mode.
          </p>
        </div>
      </div>
    )
  }

  // Show connect wallet message if not connected
  if (!connected) {
    return (
      <div className="bg-white dark:bg-gray-900 p-4 border rounded-lg shadow-sm dark:border-gray-700">
        <h2 className="text-xl font-medium mb-4">Trade</h2>
        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Please connect your wallet to trade.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-4 border rounded-lg shadow-sm dark:border-gray-700">
      <h2 className="text-xl font-medium mb-4">Trade</h2>

      {localError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {localError}
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div className="mb-4">
          <label
            htmlFor="select-market"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Market
          </label>
          <select
            id="select-market"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(parseInt(e.target.value))}
            disabled={loading}
          >
            <option value={1}>SOL-PERP</option>
            <option value={2}>BTC-PERP</option>
            <option value={3}>ETH-PERP</option>
            <option value={21}>HYPE-PERP</option>
          </select>
        </div>

        <div className="mb-4">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order Type
            </legend>
            <div className="flex gap-4">
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => setOrderType('market')}
                  className={`w-full py-2 px-4 rounded-md ${
                    orderType === 'market'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'
                  }`}
                  disabled={loading}
                >
                  Market
                </button>
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => setOrderType('limit')}
                  className={`w-full py-2 px-4 rounded-md ${
                    orderType === 'limit'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'
                  }`}
                  disabled={loading}
                >
                  Limit
                </button>
              </div>
            </div>
          </fieldset>
        </div>

        <div className="mb-4">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Side
            </legend>
            <div className="flex gap-4">
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => setOrderSide('buy')}
                  className={`w-full py-2 px-4 rounded-md ${
                    orderSide === 'buy'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'
                  }`}
                  disabled={loading}
                >
                  Buy
                </button>
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => setOrderSide('sell')}
                  className={`w-full py-2 px-4 rounded-md ${
                    orderSide === 'sell'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'
                  }`}
                  disabled={loading}
                >
                  Sell
                </button>
              </div>
            </div>
          </fieldset>
        </div>

        <div className="mb-4">
          <label
            htmlFor="trade-amount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Size
          </label>
          <input
            id="trade-amount"
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {orderType === 'limit' && (
          <div className="mb-4">
            <label
              htmlFor="trade-price"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Price
            </label>
            <input
              id="trade-price"
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required={orderType === 'limit'}
              disabled={loading}
            />
          </div>
        )}

        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-md text-white font-medium ${
            orderSide === 'buy'
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-red-500 hover:bg-red-600'
          } disabled:opacity-50`}
          disabled={loading}
        >
          {loading
            ? 'Processing...'
            : `${orderSide === 'buy' ? 'Buy' : 'Sell'} ${orderType === 'market' ? 'Market' : 'Limit'}`}
        </button>
      </form>
    </div>
  )
}
