import { Connection, PublicKey } from '@solana/web3.js'
import { create } from 'zustand'

import {
  Order,
  OrderSide,
  OrderType,
  PerpPosition,
  SpotBalance,
  ViewMode,
} from '../types'

/**
 * RPC endpoint for Solana
 * Uses environment variable or falls back to devnet
 */
const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL as string

/**
 * Drift protocol program ID (mainnet)
 */
export const DRIFT_PROGRAM_ID = 'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH'

/**
 * Define the state interface for the Drift store
 */
interface DriftState {
  // Connection
  connection: Connection | null
  endpoint: string

  // Wallet and account
  connected: boolean
  publicKey: PublicKey | null
  signTransaction: ((transaction: any) => Promise<any>) | null
  signAllTransactions: ((transactions: any[]) => Promise<any[]>) | null
  viewMode: ViewMode
  viewWallet: PublicKey | null

  // Subaccounts
  subaccounts: number[]
  activeSubaccount: number

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
}

/**
 * Define the actions interface for the Drift store
 */
interface DriftActions {
  // Wallet and account actions
  setPublicKey: (publicKey: PublicKey | null) => void
  setConnected: (connected: boolean) => void
  setSignTransaction: (
    signTransaction: ((transaction: any) => Promise<any>) | null,
  ) => void
  setSignAllTransactions: (
    signAllTransactions: ((transactions: any[]) => Promise<any[]>) | null,
  ) => void
  setViewMode: (mode: ViewMode) => void
  setViewWallet: (wallet: PublicKey | null) => void

  // Connection actions
  setConnection: (connection: Connection | null) => void

  // Subaccount actions
  setSubaccounts: (subaccounts: number[]) => void
  setActiveSubaccount: (subaccount: number) => void

  // Data actions
  setUsdcBalance: (balance: number | null) => void
  setSpotBalances: (balances: SpotBalance[]) => void
  setPerpPositions: (positions: PerpPosition[]) => void
  setOrders: (orders: Order[]) => void
  addOrder: (order: Order) => void
  removeOrder: (orderId: string) => void
  addOrderToHistory: (order: Order) => void

  // State actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Business logic actions
  loadUserData: () => Promise<void>
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

/**
 * Create the Drift store using Zustand
 * This will replace the React Context implementation
 */
export const useDriftStore = create<DriftState & DriftActions>((set, get) => ({
  // Initial state
  connection: null,
  endpoint,
  connected: false,
  publicKey: null,
  signTransaction: null,
  signAllTransactions: null,
  viewMode: 'connected',
  viewWallet: null,
  subaccounts: [0],
  activeSubaccount: 0,
  usdcBalance: null,
  spotBalances: [],
  perpPositions: [],
  orders: [],
  orderHistory: [],
  loading: false,
  error: null,

  // State setters
  setPublicKey: (publicKey) => set({ publicKey }),
  setConnected: (connected) => set({ connected }),
  setSignTransaction: (signTransaction) => set({ signTransaction }),
  setSignAllTransactions: (signAllTransactions) => set({ signAllTransactions }),
  setViewMode: (viewMode) => set({ viewMode }),
  setViewWallet: (viewWallet) => set({ viewWallet }),
  setConnection: (connection) => set({ connection }),
  setSubaccounts: (subaccounts) => set({ subaccounts }),
  setActiveSubaccount: (activeSubaccount) => {
    console.log('Setting active subaccount:', activeSubaccount)
    set({ activeSubaccount })
  },
  setUsdcBalance: (usdcBalance) => set({ usdcBalance }),
  setSpotBalances: (spotBalances) => set({ spotBalances }),
  setPerpPositions: (perpPositions) => set({ perpPositions }),
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
  removeOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== orderId),
    })),
  addOrderToHistory: (order) =>
    set((state) => ({
      orderHistory: [...state.orderHistory, order],
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Business logic
  loadUserData: async () => {
    const state = get()
    set({ loading: true, error: null })

    try {
      // Load the Drift SDK dynamically to avoid SSR issues
      const sdk = await import('@drift-labs/sdk')
      const { DriftClient, User } = sdk

      // Create a wallet provider based on mode
      const wallet =
        state.viewMode === 'connected'
          ? {
              publicKey: state.publicKey!,
              signTransaction: state.signTransaction!,
              signAllTransactions: state.signAllTransactions!,
            }
          : {
              // Dummy wallet for view mode
              publicKey: state.viewWallet!,
              signTransaction: (() =>
                Promise.reject(new Error('View only mode'))) as any,
              signAllTransactions: (() =>
                Promise.reject(new Error('View only mode'))) as any,
            }

      // Create drift client
      const driftClient = new DriftClient({
        connection: state.connection!,
        wallet,
        programID: new PublicKey(DRIFT_PROGRAM_ID),
      })

      // Only subscribe in connected mode
      if (state.viewMode === 'connected') {
        await driftClient.subscribe()

        // Fetch subaccount information
        try {
          const nextSubaccountId = await driftClient.getNextSubAccountId()
          console.log('Next subaccount ID:', nextSubaccountId)

          if (nextSubaccountId > 0) {
            const subaccountIds = Array.from(
              { length: nextSubaccountId },
              (_, i) => i,
            )
            console.log('Subaccount IDs:', subaccountIds)
            set({ subaccounts: subaccountIds })
          }
        } catch (error) {
          console.error('Error fetching subaccounts:', error)
          set({ error: 'Failed to fetch subaccounts' })
        }
      }

      // Load user account data
      try {
        // Get the target subaccount
        const subaccountId =
          state.viewMode === 'connected' ? state.activeSubaccount : 0
        let userAccountPublicKey

        try {
          if (state.viewMode === 'view') {
            console.log('View mode for wallet:', state.viewWallet?.toString())

            try {
              const driftClientAny = driftClient as any
              if (typeof driftClientAny.getUserAccount === 'function') {
                const userAccount = await driftClientAny.getUserAccount(
                  state.viewWallet!,
                  subaccountId,
                )
                console.log('Found user account directly:', userAccount)
                userAccountPublicKey = userAccount.pubkey
              } else {
                userAccountPublicKey =
                  await driftClient.getUserAccountPublicKey(0)
                console.log(
                  'Used default method to get user account public key',
                )
              }
            } catch (viewErr) {
              console.log(
                'Error in view mode, trying alternative approach:',
                viewErr,
              )

              try {
                const programID = new PublicKey(DRIFT_PROGRAM_ID)
                const [derivedKey] = await PublicKey.findProgramAddress(
                  [
                    Buffer.from('user'),
                    state.viewWallet!.toBuffer(),
                    Buffer.from([subaccountId]),
                  ],
                  programID,
                )
                userAccountPublicKey = derivedKey
                console.log(
                  'Created derived key manually:',
                  userAccountPublicKey.toString(),
                )
              } catch (derivedErr) {
                console.error('Failed to create derived key:', derivedErr)
                throw new Error('Cannot access this wallet in view mode')
              }
            }

            console.log(
              'View mode user account public key:',
              userAccountPublicKey.toString(),
            )
          } else {
            userAccountPublicKey =
              await driftClient.getUserAccountPublicKey(subaccountId)
          }

          // Create user for data access
          const user = new User({ driftClient, userAccountPublicKey })

          // Only subscribe in connected mode
          if (state.viewMode === 'connected') {
            await user.subscribe()
          }

          // Load data
          await loadSpotBalances(user, driftClient, sdk)
          await loadPerpPositions(user, driftClient, sdk)
          await loadOrders(user, driftClient, sdk)
        } catch (err) {
          console.error('Error accessing user account:', err)
          set({ error: 'Could not access account data' })
        }
      } catch (err) {
        console.error('Error accessing user account:', err)
        set({ error: 'Could not access account data' })
      }
    } catch (err) {
      console.error('Error loading data:', err)
      set({
        error: `Failed to load account data: ${err instanceof Error ? err.message : String(err)}`,
      })
    } finally {
      set({ loading: false })
    }
  },

  placeOrder: async (orderType, orderSide, market, amount, price) => {
    set({ error: null })
    const state = get()

    if (!state.connected) {
      set({ error: 'Please connect your wallet first' })
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      set({ error: 'Please enter a valid amount' })
      return
    }

    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      set({ error: 'Please enter a valid price' })
      return
    }

    set({ loading: true })
    try {
      console.log('Placing order:', {
        market,
        type: orderType,
        side: orderSide,
        amount,
        price: orderType === 'limit' ? price : 'market',
      })

      // Mock successful order placement for now
      // In a real implementation, you would use the Drift SDK to place the order
      const newOrder = {
        id: Math.random().toString(36).substring(7),
        market: `Market ${market}`,
        type: orderType,
        side: orderSide,
        amount: parseFloat(amount),
        price: orderType === 'limit' ? parseFloat(price!) : 'Market',
        status: 'open',
        timestamp: new Date().toISOString(),
      }

      // Add to orders list
      set((state) => ({ orders: [...state.orders, newOrder] }))
    } catch (err) {
      console.error('Error placing order:', err)
      set({
        error: `Failed to place order: ${err instanceof Error ? err.message : String(err)}`,
      })
    } finally {
      set({ loading: false })
    }
  },

  cancelOrder: async (orderId) => {
    const state = get()
    const orderToCancel = state.orders.find((order) => order.id === orderId)

    if (orderToCancel) {
      set({ loading: true })
      try {
        console.log('Attempting to cancel order:', orderId)

        // Here you would integrate with the Drift SDK to cancel the order
        // Example: await driftClient.cancelOrder(orderToCancel.originalOrder)

        // For now, we'll simulate success
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== orderId),
          orderHistory: [
            ...state.orderHistory,
            {
              ...orderToCancel,
              status: 'canceled',
            },
          ],
        }))
      } catch (err) {
        console.error('Error canceling order:', err)
        set({
          error: `Failed to cancel order: ${err instanceof Error ? err.message : String(err)}`,
        })
      } finally {
        set({ loading: false })
      }
    }
  },

  deposit: async (amount) => {
    set({ error: null })
    const state = get()

    if (!state.connected) {
      set({ error: 'Please connect your wallet first' })
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      set({ error: 'Please enter a valid deposit amount' })
      return
    }

    set({ loading: true })
    try {
      console.log('Depositing:', {
        amount,
        subaccount: state.activeSubaccount,
      })

      // Here you would integrate with the Drift SDK to deposit
      // This is a placeholder for the actual implementation
    } catch (err) {
      console.error('Error depositing:', err)
      set({
        error: `Failed to deposit: ${err instanceof Error ? err.message : String(err)}`,
      })
    } finally {
      set({ loading: false })
    }
  },

  withdraw: async (amount) => {
    set({ error: null })
    const state = get()

    if (!state.connected) {
      set({ error: 'Please connect your wallet first' })
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      set({ error: 'Please enter a valid withdrawal amount' })
      return
    }

    set({ loading: true })
    try {
      console.log('Withdrawing:', {
        amount,
        subaccount: state.activeSubaccount,
      })

      // Here you would integrate with the Drift SDK to withdraw
      // This is a placeholder for the actual implementation
    } catch (err) {
      console.error('Error withdrawing:', err)
      set({
        error: `Failed to withdraw: ${err instanceof Error ? err.message : String(err)}`,
      })
    } finally {
      set({ loading: false })
    }
  },
}))

/**
 * Helper function to load spot balances
 */
async function loadSpotBalances(user: any, driftClient: any, sdk: any) {
  try {
    const { convertToNumber, QUOTE_PRECISION, SpotMarkets } = sdk
    const spotPositionsData: SpotBalance[] = []

    // Check positions for market indices 0-10
    for (let i = 0; i < 10; i++) {
      const position = user.getSpotPosition(i)

      if (position && !position.scaledBalance.isZero()) {
        const spotMarket = driftClient.getSpotMarketAccount(i)
        let balance = 0
        let symbol = `Market ${i}` // Default value

        if (spotMarket) {
          // Use getTokenAmount for proper conversion including interest
          const { getTokenAmount } = sdk
          const tokenAmount = getTokenAmount(
            position.scaledBalance,
            spotMarket,
            position.balanceType,
          )
          balance = convertToNumber(tokenAmount, QUOTE_PRECISION)

          // Update USDC Balance if this is market 0 (USDC)
          if (i === 0) {
            useDriftStore.getState().setUsdcBalance(balance)
            console.log('Updated USDC balance from spot positions:', balance)
          }

          // Get symbol from SDK SpotMarkets configuration
          try {
            // Try to get from mainnet-beta configuration first
            const marketConfig = SpotMarkets['mainnet-beta'].find(
              (market: any) => market.marketIndex === i,
            )

            if (marketConfig && marketConfig.symbol) {
              symbol = marketConfig.symbol
            } else {
              // Fallback to hard-coded values for common markets
              if (i === 0) symbol = 'USDC'
              if (i === 1) symbol = 'SOL'
              if (i === 3) symbol = 'BTC'
              if (i === 4) symbol = 'ETH'
            }
          } catch {
            // Fallback to hard-coded values for common markets
            if (i === 0) symbol = 'USDC'
            if (i === 1) symbol = 'SOL'
            if (i === 3) symbol = 'BTC'
            if (i === 4) symbol = 'ETH'
          }
        } else {
          // Fallback to direct conversion if spot market not found
          balance = convertToNumber(position.scaledBalance, QUOTE_PRECISION)

          // Update USDC Balance if this is market 0 (USDC)
          if (i === 0) {
            useDriftStore.getState().setUsdcBalance(balance)
          }
        }

        spotPositionsData.push({
          symbol,
          balance,
        })
      }
    }

    useDriftStore.getState().setSpotBalances(spotPositionsData)
  } catch (err) {
    console.error('Error getting spot positions:', err)
  }
}

/**
 * Helper function to load perpetual positions
 */
async function loadPerpPositions(user: any, driftClient: any, sdk: any) {
  try {
    const { convertToNumber, QUOTE_PRECISION } = sdk
    const perpPositionsData: PerpPosition[] = []

    // Check positions for market indices 0-100
    for (let i = 0; i < 100; i++) {
      try {
        const position = user.getPerpPosition(i)

        // Check if user has a position in this market
        if (
          position &&
          position.baseAssetAmount &&
          typeof position.baseAssetAmount.isZero === 'function' &&
          !position.baseAssetAmount.isZero()
        ) {
          const size = convertToNumber(
            position.baseAssetAmount,
            QUOTE_PRECISION,
          )
          const side = size > 0 ? 'buy' : 'sell'
          let symbol = `Market ${i}`
          let marketPrice = 0

          // Check for known tokens like HYPE
          const knownTokens: Record<number, string> = {
            // Common major tokens
            0: 'SOL',
            1: 'BTC',
            2: 'ETH',
            // Recently added tokens
            21: 'HYPE',
            22: 'STRK',
            23: 'JTO',
            24: 'DYM',
            25: 'PYTH',
            26: 'WIF',
            27: 'BONK',
            28: 'JUP',
          }

          if (knownTokens[i]) {
            symbol = knownTokens[i]
          }

          // Try to get symbol from PerpMarkets SDK
          let foundSymbolFromSDK = false
          try {
            if (sdk.PerpMarkets && sdk.PerpMarkets['mainnet-beta']) {
              const perpMarketConfig = sdk.PerpMarkets['mainnet-beta'].find(
                (market: any) => market.marketIndex === i,
              )

              if (perpMarketConfig) {
                if (perpMarketConfig.symbol) {
                  symbol = perpMarketConfig.symbol
                  foundSymbolFromSDK = true
                } else if ((perpMarketConfig as any).name) {
                  symbol = (perpMarketConfig as any).name
                  foundSymbolFromSDK = true
                }
              }
            }
          } catch (sdkErr) {
            console.error('Error accessing PerpMarkets from SDK:', sdkErr)
          }

          // If symbol not found from SDK, try getting from perpMarket
          if (!foundSymbolFromSDK) {
            try {
              const perpMarket = driftClient.getPerpMarketAccount(i)

              if (perpMarket) {
                // Try to get market price from the perpMarket
                try {
                  const perpMarketAny = perpMarket as any
                  const oraclePrice =
                    perpMarketAny.amm?.oraclePrice ||
                    perpMarketAny.oraclePriceTwap ||
                    perpMarketAny.oraclePrice

                  if (oraclePrice) {
                    marketPrice = convertToNumber(oraclePrice, QUOTE_PRECISION)
                  }
                } catch (e) {
                  console.log(`Error getting price for market ${i}:`, e)
                }

                // Try to get symbol from market name if available
                if (perpMarket.name) {
                  const nameBytes = perpMarket.name
                  if (Array.isArray(nameBytes)) {
                    symbol = String.fromCharCode(
                      ...nameBytes.filter((b) => b > 0),
                    )
                  }
                }
              }
            } catch (marketErr) {
              console.log(`Error getting perp market ${i}:`, marketErr)
            }
          }

          // Fallback to known perp markets if needed
          if (symbol === `Market ${i}`) {
            const knownPerpMarkets: Record<number, string> = {
              0: 'SOL',
              1: 'BTC',
              2: 'ETH',
              3: 'ARB',
              4: 'BNB',
              5: 'PYTH',
              6: 'DOGE',
              7: 'RNDR',
              8: 'XRP',
              9: 'SUI',
              10: 'TIA',
              11: 'JUP',
              12: 'SEI',
              13: 'JTO',
              14: 'BONK',
              15: 'WIF',
              21: 'HYPE',
            }

            if (knownPerpMarkets[i]) {
              symbol = knownPerpMarkets[i]
            }
          }

          // Calculate notional value (size * price)
          // If price is not available, try to get from position
          if (!marketPrice && position.quoteAssetAmount) {
            const quoteAmount = convertToNumber(
              position.quoteAssetAmount,
              QUOTE_PRECISION,
            )
            if (size !== 0) {
              marketPrice = Math.abs(quoteAmount / size)
            }
          }

          // If still no price, try to find entry price or use default
          if (!marketPrice) {
            try {
              const entryPrice = (position as any).entryPrice
              if (entryPrice) {
                marketPrice = convertToNumber(entryPrice, QUOTE_PRECISION)
              }
            } catch {
              marketPrice = 1 // Default placeholder
            }
          }

          const notional = Math.abs(size * marketPrice)

          perpPositionsData.push({
            symbol: `${symbol}-PERP`,
            size: Math.abs(size), // Show absolute value for display
            side, // Add side (buy/sell) to the position data
            notional,
            marketIndex: i, // Store the market index for reference
          })
        }
      } catch (positionErr) {
        console.log(
          `Error processing perp position for market ${i}:`,
          positionErr,
        )
      }
    }

    useDriftStore.getState().setPerpPositions(perpPositionsData)
  } catch (err) {
    console.error('Error getting perp positions:', err)
  }
}

/**
 * Helper function to load orders
 */
async function loadOrders(user: any, driftClient: any, sdk: any) {
  try {
    const { convertToNumber, QUOTE_PRECISION } = sdk

    // Get open orders from the SDK
    const openOrders = user.getOpenOrders()

    if (openOrders && openOrders.length > 0) {
      const formattedOrders = openOrders.map((order: any) => {
        // Get market symbol
        const marketIndex = order.marketIndex || 0
        let symbol = `Market ${marketIndex}`

        // Try to get the symbol from various sources
        try {
          // Check PerpMarkets
          if (sdk.PerpMarkets && sdk.PerpMarkets['mainnet-beta']) {
            const perpMarketConfig = sdk.PerpMarkets['mainnet-beta'].find(
              (market: any) => market.marketIndex === marketIndex,
            )
            if (perpMarketConfig && perpMarketConfig.symbol) {
              symbol = perpMarketConfig.symbol
            }
          }

          // Check perpMarket directly
          if (symbol === `Market ${marketIndex}`) {
            const perpMarket = driftClient.getPerpMarketAccount(marketIndex)

            if (perpMarket && perpMarket.name) {
              const nameValue = perpMarket.name
              if (Array.isArray(nameValue)) {
                symbol = String.fromCharCode(...nameValue.filter((n) => n > 0))
              } else {
                symbol = String(nameValue)
              }
            }
          }

          // Fallback to known markets
          if (symbol === `Market ${marketIndex}`) {
            const knownPerpMarkets: Record<number, string> = {
              0: 'SOL',
              1: 'BTC',
              2: 'ETH',
              3: 'ARB',
              4: 'BNB',
              5: 'PYTH',
              6: 'DOGE',
              7: 'RNDR',
              8: 'XRP',
              9: 'SUI',
              10: 'TIA',
              11: 'JUP',
              12: 'SEI',
              13: 'JTO',
              14: 'BONK',
              15: 'WIF',
              21: 'HYPE',
            }

            if (knownPerpMarkets[marketIndex]) {
              symbol = knownPerpMarkets[marketIndex]
            }
          }
        } catch (e) {
          console.log('Error getting perp market symbol:', e)
        }

        // Determine order type directly from SDK order object
        let orderTypeStr: string

        // Extract order type from SDK
        if (order.orderType !== undefined) {
          // OrderType is directly available
          switch (order.orderType) {
            case 0:
              orderTypeStr = 'market'
              break
            case 1:
              orderTypeStr = 'limit'
              break
            case 2:
              orderTypeStr = 'trigger_market'
              break
            case 3:
              orderTypeStr = 'trigger_limit'
              break
            case 4:
              orderTypeStr = 'oracle'
              break
            default:
              // Fallback for unknown types
              orderTypeStr =
                order.price && !order.price.isZero() ? 'limit' : 'market'
          }
        } else {
          // Fallback method if orderType is not available
          console.log('Order type not available, using fallback method')
          orderTypeStr =
            order.price &&
            !order.price.isZero &&
            typeof order.price.isZero === 'function' &&
            !order.price.isZero()
              ? 'limit'
              : 'market'
        }

        // Log the original order for debugging
        console.log('Original order data:', {
          id: order.orderId?.toString(),
          orderType: order.orderType,
          type: orderTypeStr,
          price: order.price?.toString(),
        })

        // Format the order data
        return {
          id:
            order.orderId?.toString() ||
            Math.random().toString(36).substring(7),
          market: `${symbol}-PERP`,
          type: orderTypeStr,
          side: order.direction === 0 ? 'buy' : 'sell',
          amount: convertToNumber(order.baseAssetAmount, QUOTE_PRECISION),
          price: order.price
            ? convertToNumber(order.price, QUOTE_PRECISION)
            : 'Market',
          status: 'open',
          timestamp: new Date().toISOString(),
          originalOrder: order, // Store the original order for reference
        }
      })

      useDriftStore.getState().setOrders(formattedOrders)
    } else {
      useDriftStore.getState().setOrders([])
    }
  } catch (err) {
    console.error('Error fetching open orders:', err)
  }
}
