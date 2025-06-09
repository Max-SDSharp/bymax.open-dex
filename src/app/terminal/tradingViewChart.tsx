'use client'

import { useRef, useEffect, useState } from 'react'

import { useThemeStore } from '@/store/useThemeStore'

export default function TradingViewChart() {
  const tvChartContainerRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)
  const { theme } = useThemeStore()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !tvChartContainerRef.current) return

    try {
      // Limpar o container antes de adicionar o widget
      tvChartContainerRef.current.innerHTML = ''

      // Criar um novo elemento de script
      const script = document.createElement('script')
      script.src = 'https://s3.tradingview.com/tv.js'
      script.async = true
      script.onload = () => {
        if (
          typeof window.TradingView !== 'undefined' &&
          tvChartContainerRef.current
        ) {
          // Mapear o par selecionado para o formato da Binance
          // O formato da Binance geralmente é BTCUSDT, ETHUSDT, etc.
          const symbol = `BINANCE:BTCUSDT`

          // Mapear o timeframe para o formato do TradingView
          const tvInterval = 'D'

          new window.TradingView.widget({
            autosize: true,
            symbol: symbol,
            interval: tvInterval,
            timezone: 'Etc/UTC',
            theme: theme,
            style: '1',
            locale: 'en',
            toolbar_bg: theme === 'dark' ? '#0f172a' : '#ffffff',
            enable_publishing: false,
            hide_top_toolbar: false,
            hide_legend: false,
            withdateranges: true,
            allow_symbol_change: true,
            details: false,
            hotlist: false,
            calendar: false,
            // studies: [
            //   'MASimple@tv-basicstudies',
            //   'RSI@tv-basicstudies',
            //   'MACD@tv-basicstudies',
            // ],
            container_id: tvChartContainerRef.current.id,
          })
        }
      }

      document.head.appendChild(script)

      // Limpeza
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
  }, [isClient, theme])

  if (!isClient) {
    return (
      <div className="relative w-full h-[500px] bg-secondary/20 flex items-center justify-center">
        <div className="text-foreground/50">Loading TradingView chart...</div>
      </div>
    )
  }

  return (
    <div className="relative w-[695px] h-[470px]">
      <div
        id="tradingview_chart"
        ref={tvChartContainerRef}
        className="w-full h-full"
      />
    </div>
  )
}
