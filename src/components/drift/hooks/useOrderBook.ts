import { useEffect, useState } from 'react'

import { useDriftSdk } from './useDriftSdk'

export interface OrderBookLevel {
  price: number
  size: number
  side: 'buy' | 'sell'
}

/**
 * Hook to fetch and manage orderbook data from Drift using WebSocket
 */
export function useOrderBook(marketIndex: number = 0) {
  const [orderBook, setOrderBook] = useState<{
    bids: OrderBookLevel[]
    asks: OrderBookLevel[]
  }>({
    bids: [],
    asks: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Usar o SDK para obter o símbolo do mercado
  const { isLoading: sdkLoading, getMarketSymbol } = useDriftSdk()

  useEffect(() => {
    // Aguardar o SDK carregar
    if (sdkLoading) {
      setLoading(true)
      return
    }

    // Only run in browser environments
    if (typeof window === 'undefined') {
      return
    }

    // Obter o símbolo do mercado
    const marketSymbol = getMarketSymbol(marketIndex)

    // Se o símbolo não estiver disponível, não conectar ao WebSocket
    if (!marketSymbol) {
      setError(
        'Símbolo de mercado não disponível. Aguarde o carregamento dos dados.',
      )
      setLoading(true)
      return
    }

    let mounted = true
    let ws: WebSocket | null = null

    const connectWebSocket = () => {
      try {
        // Get market name from index usando o SDK
        const marketName = marketSymbol

        // Create WebSocket connection
        ws = new WebSocket('wss://dlob.drift.trade/ws')

        ws.onopen = () => {
          // Subscribe to orderbook data for the specified market
          if (ws && ws.readyState === WebSocket.OPEN) {
            const subscribeMsg = {
              type: 'subscribe',
              marketType: 'perp',
              channel: 'orderbook',
              market: marketName,
            }
            ws.send(JSON.stringify(subscribeMsg))
          }
        }

        ws.onmessage = (event) => {
          if (!mounted) return

          try {
            const message = JSON.parse(event.data as string)

            // Check if the message is for the orderbook channel and for the correct market
            // Expected format: {"channel":"orderbook_perp_0","data":"{\"bids\":[...],\"asks\":[...]}"}
            const expectedChannel = `orderbook_perp_${marketIndex}`
            if (message.channel === expectedChannel && message.data) {
              // message.data is a JSON string that needs to be parsed again
              const orderBookData = JSON.parse(message.data)

              if (orderBookData) {
                // Transform bids data
                const formattedBids: OrderBookLevel[] = (
                  orderBookData.bids || []
                )
                  .map((level: any) => ({
                    price: parseFloat(level.price) / 1000000,
                    size: parseFloat(level.size) / 1000000000,
                    side: 'buy' as const,
                  }))
                  .slice(0, 20) // Get top 20 levels

                // Transform asks data
                const formattedAsks: OrderBookLevel[] = (
                  orderBookData.asks || []
                )
                  .map((level: any) => ({
                    price: parseFloat(level.price) / 1000000,
                    size: parseFloat(level.size) / 1000000000,
                    side: 'sell' as const,
                  }))
                  .slice(0, 20) // Get top 20 levels
                  .reverse()

                setOrderBook({
                  bids: formattedBids,
                  asks: formattedAsks,
                })

                if (loading) {
                  setLoading(false)
                }

                if (error) {
                  setError(null)
                }
              }
            }
          } catch (err) {
            if (mounted) {
              setError(
                `Failed to process orderbook data: ${err instanceof Error ? err.message : String(err)}`,
              )
            }
          }
        }

        ws.onerror = () => {
          if (mounted) {
            setError('Failed to connect to orderbook server')
          }
        }

        ws.onclose = () => {
          if (mounted) {
            // Try to reconnect after 5 seconds
            setTimeout(connectWebSocket, 5000)
          }
        }
      } catch (err) {
        if (mounted) {
          setError(
            `Failed to set up WebSocket connection: ${err instanceof Error ? err.message : String(err)}`,
          )
          setLoading(false)
        }
      }
    }

    // Initialize WebSocket connection
    connectWebSocket()

    // Cleanup function
    return () => {
      mounted = false
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'unsubscribe',
            marketType: 'perp',
            channel: 'orderbook',
            market: marketSymbol,
          }),
        )
        ws.close()
      }
    }
  }, [marketIndex, loading, error, sdkLoading, getMarketSymbol])

  return { orderBook, loading, error }
}
