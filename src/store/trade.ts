import { Draft } from 'immer'

import { createStore } from './store'

/**
 * @interface TradeOption
 * @description Represents a trading option, typically a currency pair.
 * @property {string} id - The unique identifier for the option, often the symbol (e.g., 'SOL').
 * @property {string} value - The value of the option, used in forms or selections.
 * @property {string} label - The display label for the option (e.g., 'SOL/USDC').
 * @property {string} base - The base currency of the trading pair (e.g., 'SOL').
 * @property {string} quote - The quote currency of the trading pair (e.g., 'USDC').
 */
export interface TradeOption {
  id: string
  value: string
  label: string
  base: string
  quote: string
}

/**
 * @interface TradeState
 * @description Defines the state structure for trade-related data.
 * @property {TradeOption | null} selectedSymbol - The currently selected trading symbol.
 * @property {(symbol: TradeOption | null) => void} setSelectedSymbol - Function to set the selected trading symbol.
 * @property {TradeOption | null} selectedQuote - The currently selected quote currency.
 * @property {(quote: TradeOption | null) => void} setSelectedQuote - Function to set the selected quote currency.
 */
interface TradeState {
  selectedSymbol: TradeOption | null
  setSelectedSymbol: (symbol: TradeOption | null) => void
  selectedQuote: TradeOption | null
  setSelectedQuote: (quote: TradeOption | null) => void
}

const initialSymbol: TradeOption = {
  id: 'SOL',
  value: 'SOL',
  label: 'SOL/USDC',
  base: 'SOL',
  quote: 'USDC',
}

/**
 * @description A Zustand store for managing trade-related state.
 * This store holds the current state of trading symbols and quotes.
 */
export const useTradeStore = createStore<TradeState>(
  (set) => ({
    /**
     * @property {TradeOption} selectedSymbol - The currently selected trading symbol.
     * @default initialSymbol
     */
    selectedSymbol: initialSymbol,
    /**
     * @function setSelectedSymbol
     * @description Sets the selected trading symbol in the state.
     * @param {TradeOption | null} symbol - The trading symbol to set.
     */
    setSelectedSymbol: (symbol) =>
      set((state: Draft<TradeState>) => {
        state.selectedSymbol = symbol
      }),
    /**
     * @property {TradeOption | null} selectedQuote - The currently selected quote currency.
     * @default null
     */
    selectedQuote: null,
    /**
     * @function setSelectedQuote
     * @description Sets the selected quote currency in the state.
     * @param {TradeOption | null} quote - The quote currency to set.
     */
    setSelectedQuote: (quote) =>
      set((state: Draft<TradeState>) => {
        state.selectedQuote = quote
      }),
  }),
  'trade-store',
)
