'use client'

import { useDriftStore } from './hooks/useDriftStore'

/**
 * SpotBalances component
 * Displays a table of all spot token balances in the account
 */
export default function SpotBalances() {
  const { spotBalances } = useDriftStore()

  return (
    <div className="mb-6">
      <h2 className="text-xl font-medium mb-4">Spot Balances</h2>
      {spotBalances.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {spotBalances.map((balance, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {balance.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {balance.balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          No spot balances found
        </p>
      )}
    </div>
  )
}
