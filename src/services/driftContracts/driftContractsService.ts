/**
 * DriftContractsService - Provides access to Drift Protocol contracts API endpoint
 * for fetching contract data and market information.
 */

import { monitor } from '../../store/monitor'

/**
 * Interface for Drift contract data structure
 */
export interface DriftContract {
  contract_index: number
  ticker_id: string
  base_currency: string
  quote_currency: string
  last_price: string
  base_volume: string
  quote_volume: string
  high: string
  low: string
  product_type: string
  open_interest: string
  index_price: string
  index_name: string
  index_currency: string
  start_timestamp: string
  end_timestamp: string
  funding_rate: string
  next_funding_rate: string
  next_funding_rate_timestamp: string
}

/**
 * Interface for Drift API response
 */
export interface DriftApiResponse {
  contracts: DriftContract[]
}

class DriftContractsService {
  private baseUrl =
    process.env.NEXT_PUBLIC_DRIFT_DATA_API_URL || 'https://data.api.drift.trade'
  private contractsEndpoint = '/contracts'
  private cacheTimeout = 30000 // 30 seconds cache

  /**
   * Check if data in store is still valid (within cache timeout)
   */
  private isStoreDataValid(lastUpdate: number): boolean {
    return Date.now() - lastUpdate < this.cacheTimeout
  }

  /**
   * Fetch contracts data from Drift API
   * @returns Promise with contracts data
   */
  async fetchContracts(): Promise<DriftContract[]> {
    try {
      // Check Zustand store first (with SSR safety)
      try {
        const storeData = monitor
          .getState()
          .items.find((item: any) => item.id === 'contracts')

        if (storeData && this.isStoreDataValid(storeData.lastUpdate)) {
          // Return raw contracts data from store (now we have all original fields)
          return storeData.data.map((processedContract: DriftContract) => ({
            contract_index: processedContract.contract_index,
            ticker_id: processedContract.ticker_id,
            base_currency: processedContract.base_currency,
            quote_currency: processedContract.quote_currency,
            last_price: processedContract.last_price,
            base_volume: processedContract.base_volume,
            quote_volume: processedContract.quote_volume,
            high: processedContract.high,
            low: processedContract.low,
            product_type: processedContract.product_type,
            open_interest: processedContract.open_interest,
            index_price: processedContract.index_price,
            index_name: processedContract.index_name,
            index_currency: processedContract.index_currency,
            start_timestamp: processedContract.start_timestamp,
            end_timestamp: processedContract.end_timestamp,
            funding_rate: processedContract.funding_rate,
            next_funding_rate: processedContract.next_funding_rate,
            next_funding_rate_timestamp:
              processedContract.next_funding_rate_timestamp,
          }))
        }
      } catch (storeError) {
        // Store not available (SSR or other issues) - continue to API fetch
        console.debug('Store not available, fetching from API:', storeError)
      }

      // If no valid data in store, fetch from API
      const url = `${this.baseUrl}${this.contractsEndpoint}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: DriftApiResponse = await response.json()

      return data.contracts
    } catch (error) {
      console.error('Error fetching Drift contracts:', error)
      throw error
    }
  }

  /**
   * Process raw contract data into a more usable format
   * @param contracts Raw contract data from API
   * @returns Processed contract data
   */
  processContracts(contracts: DriftContract[]): DriftContract[] {
    return contracts.map((contract) => ({
      contract_index: contract.contract_index,
      ticker_id: contract.ticker_id,
      base_currency: contract.base_currency,
      quote_currency: contract.quote_currency,
      last_price: contract.last_price,
      base_volume: contract.base_volume,
      quote_volume: contract.quote_volume,
      high: contract.high,
      low: contract.low,
      product_type: contract.product_type,
      open_interest: contract.open_interest,
      index_price: contract.index_price,
      index_name: contract.index_name,
      index_currency: contract.index_currency,
      start_timestamp: contract.start_timestamp,
      end_timestamp: contract.end_timestamp,
      funding_rate: contract.funding_rate,
      next_funding_rate: contract.next_funding_rate,
      next_funding_rate_timestamp: contract.next_funding_rate_timestamp,
    }))
  }

  /**
   * Get contracts filtered by product type
   * @param productType Product type to filter by (e.g., 'PERP', 'SPOT')
   * @returns Filtered contracts
   */
  async getContractsByType(productType: string): Promise<DriftContract[]> {
    const contracts = await this.fetchContracts()
    const filtered = contracts.filter(
      (contract) => contract.product_type === productType,
    )
    return this.processContracts(filtered)
  }

  /**
   * Get perpetual contracts only
   * @returns Perpetual contracts
   */
  async getPerpetualContracts(): Promise<DriftContract[]> {
    return this.getContractsByType('PERP')
  }

  /**
   * Get spot contracts only
   * @returns Spot contracts
   */
  async getSpotContracts(): Promise<DriftContract[]> {
    return this.getContractsByType('SPOT')
  }

  /**
   * Get contract by ticker ID
   * @param tickerId Ticker ID to search for
   * @returns Contract data or null if not found
   */
  async getContractByTicker(tickerId: string): Promise<DriftContract | null> {
    const contracts = await this.fetchContracts()
    const contract = contracts.find((c) => c.ticker_id === tickerId)
    if (!contract) return null

    const processed = this.processContracts([contract])
    return processed[0]
  }

  /**
   * Clear the store cache
   */
  clearCache(): void {
    try {
      monitor.getState().removeMonitor('contracts')
      monitor.getState().removeMonitor('perpetual-contracts')
      monitor.getState().removeMonitor('spot-contracts')
    } catch (error) {
      console.debug('Could not clear store cache:', error)
    }
  }

  /**
   * Get store cache information
   * @returns Cache information
   */
  getCacheInfo(): { size: number; entries: string[] } {
    try {
      const items = monitor.getState().items
      const contractEntries = items
        .filter(
          (item: any) =>
            item.id === 'contracts' ||
            item.id === 'perpetual-contracts' ||
            item.id === 'spot-contracts',
        )
        .map((item: any) => item.id)

      return {
        size: contractEntries.length,
        entries: contractEntries,
      }
    } catch (error) {
      console.debug('Could not get store cache info:', error)
      return { size: 0, entries: [] }
    }
  }
}

// Export singleton instance
export const driftContractsService = new DriftContractsService()
