# Drift Contracts Service

![Drift Labs Logo](https://drift-labs.github.io/v2-teacher/images/logo-a64972c9.png)

This service provides access to the Drift Protocol contracts API for fetching contract data and market information.

## Structure

### Files

- `driftContractsService.ts` - Main service for accessing Drift contracts API
- `useDriftContracts.ts` - React hook for managing contracts data

## Features

### DriftContractsService

The main service offers the following features:

#### Main Methods

- `fetchContracts()` - Fetches all contracts from the API
- `getPerpetualContracts()` - Fetches perpetual contracts only
- `getSpotContracts()` - Fetches spot contracts only
- `getContractByTicker(tickerId)` - Fetches a specific contract by ticker
- `processContracts(contracts)` - Processes raw API data

#### Cache

- **Zustand Store Integration**: Uses the application's Zustand store for caching instead of local cache
- **30-second cache timeout** to avoid unnecessary requests
- **SSR-safe**: Gracefully handles server-side rendering
- `clearCache()` - Clears the store cache
- `getCacheInfo()` - Returns store cache information

### useDriftContracts Hook

React hook that integrates the service with the application store:

#### States

- `contracts` - Array of processed contracts
- `loading` - Loading state
- `error` - Error message (if any)

#### Methods

- `fetchContracts()` - Fetches all contracts and saves to store
- `fetchPerpetualContracts()` - Fetches perpetual contracts
- `fetchSpotContracts()` - Fetches spot contracts
- `getContractByTicker(tickerId)` - Fetches specific contract
- `refreshData()` - Clears cache and refetches data
- `getContractsFromStore()` - Gets data from store
- `getPerpetualContractsFromStore()` - Gets perpetual contracts from store
- `getSpotContractsFromStore()` - Gets spot contracts from store

## Usage

### Basic Service Usage

```typescript
import { driftContractsService } from '../services/driftContractsService'

// Fetch all contracts
const contracts = await driftContractsService.fetchContracts()

// Fetch perpetual contracts only
const perpetuals = await driftContractsService.getPerpetualContracts()

// Fetch specific contract
const solContract = await driftContractsService.getContractByTicker('SOL-PERP')
```

### Usage with React Hook

```typescript
import { useDriftContracts } from '../hooks/useDriftContracts'

function MyComponent() {
  const {
    contracts,
    loading,
    error,
    fetchContracts,
    fetchPerpetualContracts
  } = useDriftContracts()

  useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {contracts.map(contract => (
        <div key={contract.id}>
          {contract.ticker}: ${contract.lastPrice}
        </div>
      ))}
    </div>
  )
}
```

## Data Structure

### DriftContract

```typescript
interface DriftContract {
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
```

## Store Integration

The service automatically saves data to the Zustand store (`monitor`) with the following IDs:

- `'contracts'` - All contracts
- `'perpetual-contracts'` - Perpetual contracts only
- `'spot-contracts'` - Spot contracts only

### Cache Behavior

- **Primary Cache**: Zustand store with persistence
- **Cache Timeout**: 30 seconds
- **SSR Safe**: Graceful fallback to API when store is unavailable
- **No Duplication**: Single source of truth in the store

Data is saved using `monitor.getState().addMonitor()` and can be retrieved using the `get*FromStore()` methods from the hook.

## Key Improvements

### Data Preservation

- **All original API fields** are preserved in the store
- **Complete data structure** available for all use cases

### Cache Optimization

- **Centralized state management** - single source of truth
- **Better performance** - avoids unnecessary API calls

### SSR Compatibility

- **Server-side rendering safe** - graceful error handling
- **Browser-only features** - automatic fallback to API
- **No hydration issues** - consistent behavior across environments
