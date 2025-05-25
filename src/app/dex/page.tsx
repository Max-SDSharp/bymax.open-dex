'use client'

import dynamic from 'next/dynamic'

// Use dynamic import for DriftClient to avoid SSR issues
const DriftTestClient = dynamic(() => import('../../components/DriftClient'), {
  ssr: false,
})

// Use dynamic import for SolanaWalletProvider to avoid SSR issues
const SolanaWalletProvider = dynamic(
  () => import('../../components/SolanaWalletProvider'),
  { ssr: false },
)

export default function TestDriftPage() {
  return (
    <SolanaWalletProvider>
      <DriftTestClient />
    </SolanaWalletProvider>
  )
}
