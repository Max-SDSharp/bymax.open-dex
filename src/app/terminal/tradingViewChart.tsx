'use client'

import { useRef, useEffect } from 'react'

import { theme } from '@/store/theme'
import { useTradeStore } from '@/store/trade'

const EXCHANGE_SYMBOLS: Record<string, string> = {
  HYPEUSDC: 'KUCOIN',
  DRIFTUSDC: 'COINBASE',
}

export default function TradingViewChart() {
  const tvChartContainerRef = useRef<HTMLDivElement>(null)
  const { theme: currentTheme } = theme()
  const { selectedSymbol } = useTradeStore()

  useEffect(() => {
    if (!tvChartContainerRef.current || !selectedSymbol) return

    tvChartContainerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      if (
        typeof window.TradingView !== 'undefined' &&
        tvChartContainerRef.current
      ) {
        const symbolKey = `${selectedSymbol.base}${selectedSymbol.quote}`
        const exchange = EXCHANGE_SYMBOLS[symbolKey] || 'BINANCE'
        const symbol = `${exchange}:${symbolKey}`

        new window.TradingView.widget({
          symbol,
          interval: 'D',
          autosize: true,
          timezone: 'Etc/UTC',
          theme: currentTheme === 'dark' ? 'dark' : 'light',
          style: '1',
          locale: 'en',
          toolbar_bg: currentTheme === 'dark' ? '#0f172a' : '#ffffff',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          withdateranges: true,
          allow_symbol_change: true,
          details: false,
          hotlist: false,
          calendar: false,
          studies: [],
          container_id: 'tradingview_chart',
        })
      }
    }

    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [currentTheme, selectedSymbol])

  if (!selectedSymbol) {
    return (
      <div className="relative w-full h-[500px] bg-secondary/20 flex items-center justify-center">
        <div className="text-foreground/50">
          Please select a symbol to view the chart
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[470px]">
      <div
        id="tradingview_chart"
        ref={tvChartContainerRef}
        className="w-full h-full"
      />
    </div>
  )
}
