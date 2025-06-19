'use client'

import React, { useEffect } from 'react'

import { useDriftContracts } from '../../hooks/useDriftContracts'

export default function DriftContracts() {
  const {
    contracts,
    loading,
    error,
    fetchContracts,
    fetchPerpetualContracts,
    fetchSpotContracts,
    getContractByTicker,
    refreshData,
  } = useDriftContracts()

  useEffect(() => {
    // Fetch all contracts on component mount
    fetchContracts()
  }, [fetchContracts])

  const handleFetchPerpetual = async () => {
    try {
      await fetchPerpetualContracts()
    } catch (err) {
      console.error('Error fetching perpetual contracts:', err)
    }
  }

  const handleFetchSpot = async () => {
    try {
      await fetchSpotContracts()
    } catch (err) {
      console.error('Error fetching spot contracts:', err)
    }
  }

  const handleGetSOL = async () => {
    try {
      const solContract = await getContractByTicker('SOL-PERP')
      console.log('SOL Contract:', solContract)
    } catch (err) {
      console.error('Error fetching SOL contract:', err)
    }
  }

  const handleRefresh = async () => {
    try {
      await refreshData()
    } catch (err) {
      console.error('Error refreshing data:', err)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Drift Contracts Example</h1>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleFetchPerpetual}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Fetch Perpetual
        </button>
        <button
          onClick={handleFetchSpot}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Fetch Spot
        </button>
        <button
          onClick={handleGetSOL}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Get SOL Contract
        </button>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Refresh Data
        </button>
      </div>

      {/* Status */}
      <div className="mb-6">
        {loading && <div className="text-blue-600">Loading...</div>}
        {error && <div className="text-red-600">Error: {error}</div>}
        <div className="text-gray-600">Total contracts: {contracts.length}</div>
      </div>

      {/* Contracts List */}
      <div className="grid gap-4">
        {contracts.slice(0, 10).map((contract) => (
          <div
            key={contract.contract_index}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{contract.ticker_id}</h3>
                <p className="text-sm text-gray-600">
                  {contract.base_currency}/{contract.quote_currency} -{' '}
                  {contract.product_type}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">
                  ${parseFloat(contract.last_price).toFixed(4)}
                </div>
                <div className="text-sm text-gray-600">
                  Vol: {contract.base_volume.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">High:</span> $
                {parseFloat(contract.high).toFixed(4)}
              </div>
              <div>
                <span className="text-gray-600">Low:</span> $
                {parseFloat(contract.low).toFixed(4)}
              </div>
              <div>
                <span className="text-gray-600">OI:</span>{' '}
                {contract.open_interest.toLocaleString()}
              </div>
              <div>
                <span className="text-gray-600">Funding:</span>{' '}
                {parseFloat(contract.funding_rate) * 100}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {contracts.length > 10 && (
        <div className="mt-4 text-center text-gray-600">
          Showing first 10 of {contracts.length} contracts
        </div>
      )}
    </div>
  )
}
