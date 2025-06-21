'use client'

import { useRef, useEffect, useState } from 'react'

import { theme } from '@/store/theme'
import { useTradeStore } from '@/store/trade'

export default function TradingViewChart() {
  const tvChartContainerRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)
  const { theme: currentTheme } = theme()
  const { selectedSymbol } = useTradeStore()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !tvChartContainerRef.current || !selectedSymbol) return

    try {
      // Clear the container before adding the widget
      tvChartContainerRef.current.innerHTML = ''

      // Create a new script element
      const script = document.createElement('script')
      script.src = 'https://s3.tradingview.com/tv.js'
      script.async = true
      script.onload = () => {
        if (
          typeof window.TradingView !== 'undefined' &&
          tvChartContainerRef.current
        ) {
          // Map the selected symbol to Binance format
          // Use the base currency from selectedSymbol and append quote currency
          const symbol = `BINANCE:${selectedSymbol.base}${selectedSymbol.quote}`

          // Map the timeframe to TradingView format
          const interval = 'D'

          new window.TradingView.widget({
            symbol,
            interval,
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

      // Cleanup
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      }
    } catch (error) {
      console.error('Error loading TradingView widget:', error)
      if (tvChartContainerRef.current) {
        tvChartContainerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full">
            <div class="text-red-500">Error loading TradingView widget: ${error instanceof Error ? error.message : 'Unknown error'}</div>
          </div>
        `
      }
    }
  }, [isClient, currentTheme, selectedSymbol])

  if (!isClient) {
    return (
      <div className="relative w-full h-[500px] bg-secondary/20 flex items-center justify-center">
        <div className="text-foreground/50">Loading TradingView chart...</div>
      </div>
    )
  }

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
