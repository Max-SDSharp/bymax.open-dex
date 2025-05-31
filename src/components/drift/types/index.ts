/**
 * Types for Drift Protocol integration
 * This file contains all the type definitions used across the Drift components
 */

import { Connection, PublicKey } from '@solana/web3.js'

/**
 * Spot balance interface
 * Represents a token balance in a spot market
 */
export interface SpotBalance {
  symbol: string
  balance: number
}

/**
 * Perpetual position interface
 * Represents a position in a perpetual futures market
 */
export interface PerpPosition {
  symbol: string
  size: number
  side: string
  notional: number
  marketIndex: number
}

/**
 * Order interface
 * Represents an open or historical order
 */
export interface Order {
  id: string
  market: string
  type:
    | string
    | 'market'
    | 'limit'
    | 'trigger_market'
    | 'trigger_limit'
    | 'oracle'
  side: 'buy' | 'sell'
  amount: number | string
  price: number | string
  status: string
  timestamp: string
  originalOrder?: any // Original order from the SDK
}

/**
 * View mode type
 * Determines if we're viewing a connected wallet or viewing another wallet
 */
export type ViewMode = 'connected' | 'view'

/**
 * Tab type
 * Main navigation tabs in the Drift interface
 */
export type TabType = 'account' | 'trade' | 'orders'

/**
 * Order type
 * Types of orders that can be placed
 */
export type OrderType = 'market' | 'limit'

/**
 * Order side
 * Direction of the order (buy or sell)
 */
export type OrderSide = 'buy' | 'sell'

/**
 * Wallet for view mode
 * Simplified wallet interface for view-only mode
 */
export interface ViewWallet {
  publicKey: PublicKey
  signTransaction: () => Promise<any>
  signAllTransactions: () => Promise<any>
}

/**
 * SDK context interface
 * Provides access to the Drift SDK instance
 */
export interface DriftContextType {
  // Connection
  connection: Connection | null
  endpoint: string

  // Wallet and account
  connected: boolean
  publicKey: PublicKey | null
  viewMode: ViewMode
  viewWallet: PublicKey | null
  setViewWallet: (wallet: PublicKey | null) => void
  setViewMode: (mode: ViewMode) => void

  // Subaccounts
  subaccounts: number[]
  activeSubaccount: number
  setActiveSubaccount: (subaccount: number) => void

  // Account data
  usdcBalance: number | null
  spotBalances: SpotBalance[]
  perpPositions: PerpPosition[]

  // Orders
  orders: Order[]
  orderHistory: Order[]

  // Loading and error states
  loading: boolean
  error: string | null

  // Actions
  placeOrder: (
    orderType: OrderType,
    orderSide: OrderSide,
    market: number,
    amount: string,
    price?: string,
  ) => Promise<void>
  cancelOrder: (orderId: string) => Promise<void>
  deposit: (amount: string) => Promise<void>
  withdraw: (amount: string) => Promise<void>
}
