'use client'

import dynamic from 'next/dynamic'

// Use dynamic import for DriftDashboard to avoid SSR issues
const DriftDashboard = dynamic(
  () => import('../../components/drift/DriftDashboard'),
  {
    ssr: false,
  },
)

// Use dynamic import for DriftMarketData to avoid SSR issues
const DriftMarketData = dynamic(
  () => import('../../components/drift/DriftMarketData'),
  {
    ssr: false,
  },
)

// Use dynamic import for SolanaWalletProvider to avoid SSR issues
const SolanaWalletProvider = dynamic(
  () => import('../../components/SolanaWalletProvider'),
  { ssr: false },
)

/**
 * DAX (Decentralized Automated Exchange) page
 * Provides access to the Drift protocol through our componentized interface
 */
export default function DAXPage() {
  return (
    <SolanaWalletProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Drift Protocol Dashboard</h1>

        {/* Market Data Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Market Data</h2>
          <DriftMarketData />
        </div>

        {/* Dashboard Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Trading Dashboard</h2>
          <DriftDashboard />
        </div>
      </div>
    </SolanaWalletProvider>
  )
}
