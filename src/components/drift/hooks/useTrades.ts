import { useEffect, useState } from 'react'

import { useDriftSdk } from './useDriftSdk'

export interface Trade {
  price: number
  size: number
  side: 'buy' | 'sell'
  timestamp: Date
}

/**
 * Hook to fetch and manage real-time trades data from Drift using WebSocket
 */
export function useTrades(marketIndex: number = 0) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Usar o SDK para obter o símbolo do mercado
  const { isLoading: sdkLoading, getMarketSymbol } = useDriftSdk()

  // Limpar trades quando mudar o marketIndex
  useEffect(() => {
    setTrades([])
    setLoading(true)
  }, [marketIndex])

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
          // Subscribe to trades data for the specified market
          if (ws && ws.readyState === WebSocket.OPEN) {
            const subscribeMsg = {
              type: 'subscribe',
              marketType: 'perp',
              channel: 'trades',
              market: marketName,
            }
            ws.send(JSON.stringify(subscribeMsg))
          }
        }

        ws.onmessage = (event) => {
          if (!mounted) return

          try {
            const message = JSON.parse(event.data as string)

            // Check if the message is for the trades channel and for the correct market
            // Expected format: {"channel":"trades_perp_0","data":"{...}"}
            const expectedChannel = `trades_perp_${marketIndex}`
            if (message.channel === expectedChannel && message.data) {
              // message.data is a JSON string that needs to be parsed again
              const tradesData = JSON.parse(message.data)

              // Create Trade objects from the data
              // Check if it's an array or a single trade object
              const tradesArray = Array.isArray(tradesData)
                ? tradesData
                : [tradesData]

              if (tradesArray.length > 0) {
                const newTrades: Trade[] = tradesArray.map((trade: any) => ({
                  price: parseFloat(trade.oraclePrice),
                  size: parseFloat(trade.baseAssetAmountFilled),
                  side:
                    trade.takerOrderDirection === 'long'
                      ? ('buy' as const)
                      : ('sell' as const),
                  timestamp: new Date(trade.ts * 1000), // Convert UNIX timestamp to Date
                }))

                if (newTrades.length > 0) {
                  setTrades((prevTrades) => {
                    // Add new trades to the beginning (newest first)
                    const updatedTrades = [...newTrades, ...prevTrades]
                    // Limit to 50 trades to avoid excessive rendering
                    return updatedTrades.slice(0, 50)
                  })

                  if (loading) {
                    setLoading(false)
                  }

                  if (error) {
                    setError(null)
                  }
                }
              }
            }
          } catch (err) {
            if (mounted) {
              setError(
                `Failed to process trades data: ${err instanceof Error ? err.message : String(err)}`,
              )
            }
          }
        }

        ws.onerror = () => {
          if (mounted) {
            setError('Failed to connect to trades server')
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
            `Failed to set up WebSocket connection for trades: ${err instanceof Error ? err.message : String(err)}`,
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
            channel: 'trades',
            market: marketSymbol,
          }),
        )
        ws.close()
      }
    }
  }, [marketIndex, loading, error, sdkLoading, getMarketSymbol])

  return { trades, loading, error }
}
