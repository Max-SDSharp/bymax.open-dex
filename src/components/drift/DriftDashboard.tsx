'use client'

import { useState } from 'react'

import DepositWithdraw from './DepositWithdraw'
import { useDriftStore } from './hooks/useDriftStore'
import { useWalletSync } from './hooks/useWalletSync'
import OrderHistory from './OrderHistory'
import OrdersTable from './OrdersTable'
import PerpPositions from './PerpPositions'
import SpotBalances from './SpotBalances'
import SubaccountSelector from './SubaccountSelector'
import TabNavigation from './TabNavigation'
import TradeForm from './TradeForm'
import { TabType } from './types'
import UsdcBalance from './UsdcBalance'
import WalletConnect from './WalletConnect'
import WebSocketDebugger from './WebSocketDebugger'

/**
 * DriftDashboard component
 * Main container for the Drift protocol interface
 * Assembles all the individual components
 */
export default function DriftDashboard() {
  // Initialize state from Zustand store
  const { loading, error } = useDriftStore()
  const [activeTab, setActiveTab] = useState<TabType>('account')
  const [showDebugger, setShowDebugger] = useState(true) // For debug purposes

  // Sync wallet state with Zustand store
  useWalletSync()

  return (
    <div className="container mx-auto px-4 py-8">
      <WalletConnect />

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <SubaccountSelector />

      {/* Debug button */}
      <div className="mb-4">
        <button
          onClick={() => setShowDebugger(!showDebugger)}
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm"
        >
          {showDebugger ? 'Hide' : 'Show'} WebSocket Debugger
        </button>
      </div>

      {loading && !activeTab ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <div>
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div>
                <UsdcBalance />
                <DepositWithdraw />
                <SpotBalances />
                <PerpPositions />
              </div>
            )}

            {/* Trade Tab */}
            {activeTab === 'trade' && (
              <div className="mb-6">
                <TradeForm />
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <OrdersTable />
                <OrderHistory />
              </div>
            )}
          </div>
        </>
      )}

      {/* WebSocket debugger */}
      {showDebugger && <WebSocketDebugger />}
    </div>
  )
}
