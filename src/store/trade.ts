import { create } from 'zustand'

export interface TradeOption {
  id: string
  value: string
  label: string
  base: string
  quote: string
}

interface TradeState {
  selectedSymbol: TradeOption | null
  setSelectedSymbol: (symbol: TradeOption | null) => void
  selectedQuote: TradeOption | null
  setSelectedQuote: (quote: TradeOption | null) => void
}

export const useTradeStore = create<TradeState>((set) => ({
  selectedSymbol: null,
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  selectedQuote: null,
  setSelectedQuote: (quote) => set({ selectedQuote: quote }),
}))
