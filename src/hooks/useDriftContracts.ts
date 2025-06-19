import { useState, useCallback } from 'react'

import {
  driftContractsService,
  DriftContract,
} from '../services/driftContracts/driftContractsService'
import { monitor } from '../store/monitor'

/**
 * Hook for managing Drift contracts data
 * Provides access to contracts data with automatic store integration
 */
export const useDriftContracts = () => {
  const [contracts, setContracts] = useState<DriftContract[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch all contracts and update store
   */
  const fetchContracts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const rawContracts = await driftContractsService.fetchContracts()
      const processedContracts =
        driftContractsService.processContracts(rawContracts)

      setContracts(processedContracts)

      // Save to store with id 'contracts'
      monitor.getState().addMonitor({
        id: 'contracts',
        data: processedContracts,
        lastUpdate: Date.now(),
      })

      return processedContracts
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch contracts'
      setError(errorMessage)
      console.error('Error in useDriftContracts:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Fetch perpetual contracts only
   */
  const fetchPerpetualContracts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const perpetualContracts =
        await driftContractsService.getPerpetualContracts()
      setContracts(perpetualContracts)

      // Save to store with id 'perpetual-contracts'
      monitor.getState().addMonitor({
        id: 'perpetual-contracts',
        data: perpetualContracts,
        lastUpdate: Date.now(),
      })

      return perpetualContracts
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch perpetual contracts'
      setError(errorMessage)
      console.error('Error in useDriftContracts:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Fetch spot contracts only
   */
  const fetchSpotContracts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const spotContracts = await driftContractsService.getSpotContracts()
      setContracts(spotContracts)

      // Save to store with id 'spot-contracts'
      monitor.getState().addMonitor({
        id: 'spot-contracts',
        data: spotContracts,
        lastUpdate: Date.now(),
      })

      return spotContracts
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch spot contracts'
      setError(errorMessage)
      console.error('Error in useDriftContracts:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Get contract by ticker ID
   */
  const getContractByTicker = useCallback(async (tickerId: string) => {
    try {
      const contract = await driftContractsService.getContractByTicker(tickerId)
      return contract
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch contract'
      setError(errorMessage)
      console.error('Error in useDriftContracts:', err)
      throw err
    }
  }, [])

  /**
   * Clear cache and refetch data
   */
  const refreshData = useCallback(async () => {
    driftContractsService.clearCache()
    return await fetchContracts()
  }, [fetchContracts])

  /**
   * Get contracts from store if available
   */
  const getContractsFromStore = useCallback(() => {
    const storeData = monitor
      .getState()
      .items.find((item) => item.id === 'contracts')
    return storeData?.data || []
  }, [])

  /**
   * Get perpetual contracts from store if available
   */
  const getPerpetualContractsFromStore = useCallback(() => {
    const storeData = monitor
      .getState()
      .items.find((item) => item.id === 'perpetual-contracts')
    return storeData?.data || []
  }, [])

  /**
   * Get spot contracts from store if available
   */
  const getSpotContractsFromStore = useCallback(() => {
    const storeData = monitor
      .getState()
      .items.find((item) => item.id === 'spot-contracts')
    return storeData?.data || []
  }, [])

  return {
    contracts,
    loading,
    error,
    fetchContracts,
    fetchPerpetualContracts,
    fetchSpotContracts,
    getContractByTicker,
    refreshData,
    getContractsFromStore,
    getPerpetualContractsFromStore,
    getSpotContractsFromStore,
  }
}
