import { useEffect } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'

import { useDriftStore } from './useDriftStore'

/**
 * Custom hook to synchronize Solana wallet state with the Drift Zustand store
 * This keeps the wallet state in sync with our application state
 */
export function useWalletSync() {
  // Get wallet state from Solana wallet adapter
  const { connected, publicKey, signTransaction, signAllTransactions } =
    useWallet()

  // Get store actions and state
  const {
    setConnected,
    setPublicKey,
    setSignTransaction,
    setSignAllTransactions,
    setConnection,
    endpoint,
    loadUserData,
    activeSubaccount,
  } = useDriftStore()

  // Sync wallet connection status
  useEffect(() => {
    setConnected(connected)
  }, [connected, setConnected])

  // Sync public key
  useEffect(() => {
    setPublicKey(publicKey)
  }, [publicKey, setPublicKey])

  // Sync signing methods
  useEffect(() => {
    // Cast to any to avoid TypeScript errors with undefined
    setSignTransaction(signTransaction as any)
    setSignAllTransactions(signAllTransactions as any)
  }, [
    signTransaction,
    signAllTransactions,
    setSignTransaction,
    setSignAllTransactions,
  ])

  // Initialize connection
  useEffect(() => {
    const conn = new Connection(
      endpoint || 'https://api.devnet.solana.com',
      'confirmed',
    )
    setConnection(conn)
    console.log('Connected to:', endpoint || 'https://api.devnet.solana.com')
  }, [endpoint, setConnection])

  // Load user data when wallet, connection or subaccount changes
  useEffect(() => {
    // Load data only if wallet is connected or in view mode
    const state = useDriftStore.getState()
    if (
      (state.viewMode === 'connected' && connected && publicKey) ||
      (state.viewMode === 'view' && state.viewWallet)
    ) {
      console.log('Loading user data with subaccount:', activeSubaccount)
      loadUserData()
    }
  }, [connected, publicKey, loadUserData, activeSubaccount])

  return null
}
