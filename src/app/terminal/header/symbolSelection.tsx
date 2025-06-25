'use client'

import React, { useMemo, useEffect, useCallback } from 'react'

import Select from '@/components/ui/bymaxReactSelect'
import { useDriftContracts } from '@/hooks/useDriftContracts'
import { monitor } from '@/store/monitor'
import { useTradeStore, TradeOption } from '@/store/trade'
import { DriftContract } from '@/types'

// Symbols list allowed
const ALLOWED_SYMBOLS = ['SOL', 'BTC', 'ETH', 'DRIFT', 'JUP', 'HYPE']

// Default symbol
const tokenDefault = 'SOL'

const SymbolSelection: React.FC = () => {
  const { loading, fetchContracts, error } = useDriftContracts()
  const { selectedSymbol, setSelectedSymbol } = useTradeStore()

  const contracts = monitor(
    (state) => state.items.find((item) => item.id === 'contracts')?.data || [],
  ) as DriftContract[]

  const onFetchContracts = useCallback(async () => {
    await fetchContracts()
  }, [fetchContracts])

  useEffect(() => {
    if (contracts.length === 0) {
      onFetchContracts()
    }
  }, [contracts.length, onFetchContracts])

  const filteredTokens = useMemo(
    () =>
      contracts.filter(
        (token) =>
          token.product_type === 'PERP' &&
          ALLOWED_SYMBOLS.includes(token.base_currency),
      ),
    [contracts],
  )

  const options: TradeOption[] = useMemo(
    () =>
      filteredTokens.map((token) => ({
        id: token.contract_index.toString(),
        value: token.ticker_id,
        label: token.base_currency,
        base: token.base_currency,
        quote: token.quote_currency,
      })),
    [filteredTokens],
  )

  useEffect(() => {
    if (options.length > 0 && !selectedSymbol) {
      let initialSymbol = options.find((opt) => opt.base === tokenDefault)

      if (!initialSymbol) {
        initialSymbol = options[0]
      }

      setSelectedSymbol(initialSymbol)
    }
  }, [options, selectedSymbol, setSelectedSymbol])

  if (error) {
    return <div className="text-red-500">Error loading symbols.</div>
  }

  return (
    <div className="w-full z-10">
      <Select
        id="symbols"
        value={selectedSymbol}
        isMulti={false}
        isClearable={false}
        options={options}
        placeholder={loading ? 'Loading...' : 'Select a symbol'}
        placeholderSearch="Search for a symbol"
        noOptionsMessage="No symbols found"
        moveSelectedToTop={true}
        isLoading={loading}
        loadingMessage="Loading..."
        onChange={(option: any) =>
          setSelectedSymbol(option as TradeOption | null)
        }
      />
    </div>
  )
}

export default SymbolSelection
