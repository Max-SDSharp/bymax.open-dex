'use client'

import { ReactNode, useMemo } from 'react'

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'

// Import the required CSS
import '@solana/wallet-adapter-react-ui/styles.css'

interface SolanaProviderProps {
  children: ReactNode
}

export default function SolanaProvider({ children }: SolanaProviderProps) {
  // Set to 'mainnet-beta', 'testnet', 'devnet' or 'localnet'
  const network = WalletAdapterNetwork.Mainnet

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => {
    return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network)
  }, [network])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
