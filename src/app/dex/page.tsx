'use client'

import dynamic from 'next/dynamic'

// Use dynamic import for DriftClient to avoid SSR issues
const DriftTestClient = dynamic(
  () => import('../../components/drift/DriftClient'),
  {
    ssr: false,
  },
)

// Use dynamic import for SolanaWalletProvider to avoid SSR issues
const SolanaWalletProvider = dynamic(
  () => import('../../components/drift/SolanaWalletProvider'),
  { ssr: false },
)

export default function TestDriftPage() {
  return (
    <SolanaWalletProvider>
      <DriftTestClient />
    </SolanaWalletProvider>
  )
}
