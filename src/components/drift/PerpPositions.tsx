'use client'

import { useDriftStore } from './hooks/useDriftStore'

/**
 * PerpPositions component
 * Displays a table of all perpetual futures positions in the account
 */
export default function PerpPositions() {
  const { perpPositions } = useDriftStore()

  return (
    <div className="mb-6">
      <h2 className="text-xl font-medium mb-4">Perpetual Positions</h2>
      {perpPositions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Market
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Side
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Notional
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {perpPositions.map((position, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {position.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {position.size.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap ${
                      position.side === 'buy'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {position.side}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    $
                    {position.notional.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          No perpetual positions found
        </p>
      )}
    </div>
  )
}
