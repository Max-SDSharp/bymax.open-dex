import { useState, useEffect } from 'react'

import { useDriftSdk } from './useDriftSdk'

/**
 * Hook para obter o símbolo do mercado a partir do índice
 * Utiliza o SDK da Drift quando disponível, com fallback para valores estáticos
 */
export function useMarketSymbol(marketIndex: number) {
  const [symbol, setSymbol] = useState<string>('Unknown Market')
  const [loading, setLoading] = useState<boolean>(true)

  // Utilizar o SDK da Drift para obter os símbolos dos mercados
  const { isLoading, getMarketSymbol } = useDriftSdk()

  useEffect(() => {
    // Se o SDK da Drift estiver carregando, aguardar
    if (isLoading) {
      return
    }

    // Buscar o símbolo do mercado usando o SDK
    const marketSymbol = getMarketSymbol(marketIndex)

    // Se o símbolo não estiver disponível, manter o loading
    if (marketSymbol === null) {
      setLoading(true)
      return
    }

    setSymbol(marketSymbol)
    setLoading(false)
  }, [marketIndex, isLoading, getMarketSymbol])

  return { symbol, loading }
}
