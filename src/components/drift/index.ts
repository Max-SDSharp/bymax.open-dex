/**
 * Index file for exporting all Drift components
 * Makes importing components more convenient
 */

// Main dashboard component
export { default as DriftDashboard } from './DriftDashboard'

// Zustand store and hooks
export { useDriftStore } from './hooks/useDriftStore'
export { useWalletSync } from './hooks/useWalletSync'

// Account components
export { default as UsdcBalance } from './UsdcBalance'
export { default as SpotBalances } from './SpotBalances'
export { default as PerpPositions } from './PerpPositions'
export { default as DepositWithdraw } from './DepositWithdraw'

// Trading components
export { default as TradeForm } from './TradeForm'

// Order components
export { default as OrdersTable } from './OrdersTable'
export { default as OrderHistory } from './OrderHistory'

// UI components
export { default as WalletConnect } from './WalletConnect'
export { default as SubaccountSelector } from './SubaccountSelector'
export { default as TabNavigation } from './TabNavigation'

// Types
export * from './types'
