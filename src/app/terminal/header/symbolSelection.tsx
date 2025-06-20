'use client'

import React, { useMemo, useEffect, useCallback } from 'react'

import SelectWithValidation from '@/components/ui/bymaxReactSelect'
import { useDriftContracts } from '@/hooks/useDriftContracts'
import { DriftContract } from '@/services/driftContracts/driftContractsService'
import { monitor } from '@/store/monitor'
import { useTradeStore, TradeOption } from '@/store/trade'

const SymbolSelection: React.FC = () => {
  const { loading, fetchContracts, error } = useDriftContracts()
  const { selectedSymbol, setSelectedSymbol, selectedQuote, setSelectedQuote } =
    useTradeStore()

  const contracts = monitor(
    (state) => state.items.find((item) => item.id === 'contracts')?.data || [],
  ) as DriftContract[]

  const quoteTokenDefault = 'USDC' // Using USDC as a common quote currency in Solana

  const onFetchContracts = useCallback(async () => {
    await fetchContracts()
  }, [fetchContracts])

  useEffect(() => {
    if (contracts.length === 0) {
      onFetchContracts()
    }
  }, [contracts.length, onFetchContracts])

  useEffect(() => {
    if (contracts.length > 0 && !selectedQuote) {
      // Create a dummy option for the default quote token
      const quoteOption: TradeOption = {
        id: quoteTokenDefault,
        value: quoteTokenDefault,
        label: quoteTokenDefault,
        base: quoteTokenDefault,
        quote: '',
      }
      setSelectedQuote(quoteOption)
    }
  }, [contracts, selectedQuote, setSelectedQuote, quoteTokenDefault])

  const filteredTokens = useMemo(
    () =>
      contracts.filter(
        (token) =>
          token.base_currency !== (selectedQuote?.base || quoteTokenDefault) &&
          token.product_type === 'PERP',
      ),
    [contracts, selectedQuote, quoteTokenDefault],
  )

  const options: TradeOption[] = useMemo(
    () =>
      filteredTokens.map((token) => ({
        id: token.ticker_id,
        value: token.ticker_id,
        label: token.base_currency,
        base: token.base_currency,
        quote: token.quote_currency,
      })),
    [filteredTokens],
  )

  useEffect(() => {
    if (options.length > 0 && !selectedSymbol) {
      const tokenDefault = 'SOL'
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
      <SelectWithValidation
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
