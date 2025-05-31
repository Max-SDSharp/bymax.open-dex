'use client'

import { FormEvent, useState } from 'react'

import { useDriftStore } from './hooks/useDriftStore'

/**
 * DepositWithdraw component
 * Provides UI for deposit and withdrawal operations on Drift
 */
export default function DepositWithdraw() {
  const { deposit, withdraw, connected, viewMode, loading, usdcBalance } =
    useDriftStore()

  const [depositAmount, setDepositAmount] = useState<string>('')
  const [withdrawAmount, setWithdrawAmount] = useState<string>('')
  const [localError, setLocalError] = useState<string | null>(null)

  /**
   * Handle deposit form submission
   * @param e Form event
   */
  const handleDeposit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setLocalError('Please enter a valid deposit amount')
      return
    }

    try {
      await deposit(depositAmount)
      setDepositAmount('') // Clear form on success
    } catch (err) {
      console.error('Error in deposit component:', err)
    }
  }

  /**
   * Handle withdraw form submission
   * @param e Form event
   */
  const handleWithdraw = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setLocalError('Please enter a valid withdrawal amount')
      return
    }

    // Optional: Check if the user has enough balance
    if (usdcBalance !== null && parseFloat(withdrawAmount) > usdcBalance) {
      setLocalError('Insufficient balance')
      return
    }

    try {
      await withdraw(withdrawAmount)
      setWithdrawAmount('') // Clear form on success
    } catch (err) {
      console.error('Error in withdraw component:', err)
    }
  }

  // Only show for connected wallet (not view mode)
  if (viewMode !== 'connected' || !connected) {
    return null
  }

  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      {localError && (
        <div className="col-span-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {localError}
        </div>
      )}

      <div className="p-4 border rounded shadow-sm dark:border-gray-700">
        <h3 className="text-lg font-medium mb-3">Deposit</h3>
        <form onSubmit={handleDeposit}>
          <div className="mb-3">
            <label
              htmlFor="deposit-amount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Amount (USDC)
            </label>
            <input
              id="deposit-amount"
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Deposit'}
          </button>
        </form>
      </div>

      <div className="p-4 border rounded shadow-sm dark:border-gray-700">
        <h3 className="text-lg font-medium mb-3">Withdraw</h3>
        <form onSubmit={handleWithdraw}>
          <div className="mb-3">
            <label
              htmlFor="withdraw-amount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Amount (USDC)
            </label>
            <input
              id="withdraw-amount"
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Withdraw'}
          </button>
        </form>
      </div>
    </div>
  )
}
