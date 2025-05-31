'use client'

import { useEffect, useState } from 'react'

import { useDriftSdk } from './hooks/useDriftSdk'

interface Market {
  marketIndex: number
  symbol: string
  name: string
}

interface MarketSelectorProps {
  selectedMarket: number
  onSelectMarket: (marketIndex: number) => void
}

/**
 * MarketSelector component
 * Allows user to select a market for trading and viewing data
 */
export default function MarketSelector({
  selectedMarket,
  onSelectMarket,
}: MarketSelectorProps) {
  const [markets, setMarkets] = useState<Market[]>([])
  const { isLoading, error, getAllMarketSymbols } = useDriftSdk()

  // Carregar mercados do SDK da Drift quando estiver pronto
  useEffect(() => {
    if (isLoading) return

    // Obter todos os símbolos disponíveis
    const allSymbols = getAllMarketSymbols()

    // Se não tiver símbolos, não fazer nada
    if (Object.keys(allSymbols).length === 0) return

    // Transformar em array de Market
    const marketsList = Object.entries(allSymbols)
      .map(([indexStr, symbol]) => {
        const marketIndex = parseInt(indexStr, 10)
        // Extrair o nome base do símbolo (remover "-PERP")
        const baseName = symbol.replace('-PERP', '')
        return {
          marketIndex,
          symbol,
          name: `${baseName} Perpetual`,
        }
      })
      // Mostrar apenas alguns mercados principais para não sobrecarregar a UI
      .filter((market) => [0, 1, 2, 3, 14].includes(market.marketIndex))
      // Ordenar por índice
      .sort((a, b) => a.marketIndex - b.marketIndex)

    setMarkets(marketsList)
  }, [isLoading]) // Removido getAllMarketSymbols das dependências para evitar loops

  // Set default market if none selected
  useEffect(() => {
    if (selectedMarket === undefined && markets.length > 0) {
      onSelectMarket(markets[0].marketIndex)
    }
  }, [selectedMarket, onSelectMarket, markets])

  // Mostrar loading enquanto os mercados estão sendo carregados
  if (isLoading || markets.length === 0) {
    return <div className="py-2 text-sm">Carregando mercados da Drift...</div>
  }

  // Mostrar mensagem de erro se ocorrer algum problema
  if (error) {
    return <div className="py-2 text-sm text-red-500">{error}</div>
  }

  return (
    <div className="flex flex-row flex-wrap gap-2">
      {markets.map((market) => (
        <button
          key={market.marketIndex}
          onClick={() => onSelectMarket(market.marketIndex)}
          className={`px-4 py-2 rounded-full text-sm ${
            selectedMarket === market.marketIndex
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {market.symbol}
        </button>
      ))}
    </div>
  )
}
