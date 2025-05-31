'use client'

import { TabType } from './types'

/**
 * Props for the TabNavigation component
 */
interface TabNavigationProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

/**
 * TabNavigation component
 * Provides navigation between different tabs of the Drift interface
 */
export default function TabNavigation({
  activeTab,
  setActiveTab,
}: TabNavigationProps) {
  return (
    <div className="mb-6">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('account')}
            className={`py-2 px-4 ${
              activeTab === 'account'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab('trade')}
            className={`py-2 px-4 ${
              activeTab === 'trade'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Trade
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-4 ${
              activeTab === 'orders'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Orders
          </button>
        </nav>
      </div>
    </div>
  )
}
