'use client'

import { useDriftStore } from './hooks/useDriftStore'

/**
 * OrderHistory component
 * Displays a table of historical orders
 */
export default function OrderHistory() {
  const { orderHistory } = useDriftStore()

  return (
    <div className="mb-6">
      <h2 className="text-xl font-medium mb-4">Order History</h2>
      {orderHistory.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Market
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Side
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {orderHistory.map((order, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.market}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {order.type.replace('_', ' ')}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap capitalize ${
                      order.side === 'buy' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {order.side}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {typeof order.amount === 'number'
                      ? order.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })
                      : order.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {typeof order.price === 'number'
                      ? order.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })
                      : order.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {order.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No order history</p>
      )}
    </div>
  )
}
