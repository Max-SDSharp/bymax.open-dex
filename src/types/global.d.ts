// Global type definitions

interface TradingViewWidgetConfig {
  autosize?: boolean
  debug?: boolean
  symbol?: string
  interval?: string
  timezone?: string
  theme?: 'light' | 'dark'
  style?: string
  locale?: string
  toolbar_bg?: string
  enable_publishing?: boolean
  hide_top_toolbar?: boolean
  hide_legend?: boolean
  save_image?: boolean
  container_id?: string
  hide_side_toolbar?: boolean
  withdateranges?: boolean
  allow_symbol_change?: boolean
  details?: boolean
  hotlist?: boolean
  calendar?: boolean
  studies?: string[]
}

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: TradingViewWidgetConfig) => any
    }
  }
}

export {}
