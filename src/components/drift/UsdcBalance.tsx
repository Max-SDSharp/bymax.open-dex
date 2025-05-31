'use client'

import { useDriftStore } from './hooks/useDriftStore'

/**
 * UsdcBalance component
 * Displays the USDC balance for the account
 */
export default function UsdcBalance() {
  const { usdcBalance } = useDriftStore()

  return (
    <div className="mb-6 p-4 border rounded-lg shadow-sm dark:border-gray-700">
      <h2 className="text-xl font-medium mb-2">USDC Balance</h2>
      <p className="text-3xl font-bold">
        $
        {usdcBalance?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) || '0.00'}
      </p>
    </div>
  )
}
