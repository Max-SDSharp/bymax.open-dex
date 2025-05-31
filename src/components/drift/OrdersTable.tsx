'use client'

import { useDriftStore } from './hooks/useDriftStore'

/**
 * OrdersTable component
 * Displays a table of open orders and provides cancel functionality
 */
export default function OrdersTable() {
  const { orders, cancelOrder, loading } = useDriftStore()

  /**
   * Handle cancellation of an order
   * @param orderId ID of the order to cancel
   */
  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId)
    } catch (err) {
      console.error('Error in order cancellation:', err)
    }
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-medium mb-4">Open Orders</h2>
      {orders.length > 0 ? (
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {orders.map((order) => (
                <tr key={order.id}>
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Canceling...' : 'Cancel'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No open orders</p>
      )}
    </div>
  )
}
