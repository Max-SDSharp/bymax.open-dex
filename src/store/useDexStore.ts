import { createStore } from './useStore'
import { Draft } from 'immer'

// Interface for the DEX state
interface DexState {
  // Market state
  markets: {
    [key: string]: {
      price: number
      volume24h: number
      change24h: number
    }
  }
  selectedMarket: string | null
  
  // Wallet state
  wallet: {
    connected: boolean
    address: string | null
    balance: {
      [token: string]: number
    }
  }
  
  // Order state
  orders: {
    pending: Order[]
    completed: Order[]
  }
  
  // Actions
  connectWallet: () => void
  disconnectWallet: () => void
  selectMarket: (market: string) => void
  placeOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt'>) => void
}

// Order type
interface Order {
  id: string
  market: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit'
  amount: number
  price: number | null
  status: 'pending' | 'completed' | 'canceled'
  createdAt: number
}

// Create the DEX store with the base configuration
export const useDexStore = createStore<DexState>((set) => ({
  // Initial state
  markets: {
    'BTC-USD': {
      price: 45000,
      volume24h: 1200000000,
      change24h: 2.5,
    },
    'ETH-USD': {
      price: 2800,
      volume24h: 500000000,
      change24h: 1.8,
    },
    'SOL-USD': {
      price: 120,
      volume24h: 300000000,
      change24h: 4.2,
    },
  },
  selectedMarket: 'BTC-USD',
  
  wallet: {
    connected: false,
    address: null,
    balance: {
      'USD': 10000,
      'BTC': 0.5,
      'ETH': 5,
      'SOL': 50,
    },
  },
  
  orders: {
    pending: [],
    completed: [],
  },
  
  // Actions
  connectWallet: () => {
    set((state: Draft<DexState>) => {
      state.wallet.connected = true
      state.wallet.address = '0x' + Math.random().toString(16).slice(2, 12)
    })
  },
  
  disconnectWallet: () => {
    set((state: Draft<DexState>) => {
      state.wallet.connected = false
      state.wallet.address = null
    })
  },
  
  selectMarket: (market) => {
    set((state: Draft<DexState>) => {
      state.selectedMarket = market
    })
  },
  
  placeOrder: (orderData) => {
    set((state: Draft<DexState>) => {
      const newOrder: Order = {
        ...orderData,
        id: Math.random().toString(16).slice(2),
        status: 'pending',
        createdAt: Date.now(),
      }
      
      state.orders.pending.push(newOrder)
      
      // Simulate order completion after 2 seconds for demo purposes
      setTimeout(() => {
        set((state: Draft<DexState>) => {
          const orderIndex = state.orders.pending.findIndex((o: Order) => o.id === newOrder.id)
          if (orderIndex >= 0) {
            const order = state.orders.pending[orderIndex]
            order.status = 'completed'
            state.orders.pending.splice(orderIndex, 1)
            state.orders.completed.push(order)
          }
        })
      }, 2000)
    })
  },
})) 