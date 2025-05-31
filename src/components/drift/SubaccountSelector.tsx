'use client'

import { useDriftStore } from './hooks/useDriftStore'

/**
 * SubaccountSelector component
 * Allows users to select between their subaccounts in the Drift protocol
 */
export default function SubaccountSelector() {
  const {
    subaccounts,
    activeSubaccount,
    setActiveSubaccount,
    viewMode,
    connected,
  } = useDriftStore()

  /**
   * Handle subaccount selection change
   * @param subaccountId The ID of the subaccount to select
   */
  const handleSubaccountChange = (subaccountId: number) => {
    console.log('Changing subaccount to:', subaccountId)
    if (subaccountId !== activeSubaccount) {
      setActiveSubaccount(subaccountId)
    }
  }

  // Only show subaccount selector for connected wallets with subaccounts
  if (viewMode !== 'connected' || !connected || subaccounts.length <= 1) {
    return null
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-2">Subaccounts:</h2>
      <div className="flex gap-2 flex-wrap">
        {subaccounts.map((id) => (
          <button
            key={id}
            onClick={() => handleSubaccountChange(id)}
            className={`px-3 py-1 rounded ${
              activeSubaccount === id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'
            }`}
          >
            {id === 0 ? 'Default' : `Subaccount ${id}`}
          </button>
        ))}
      </div>
    </div>
  )
}
