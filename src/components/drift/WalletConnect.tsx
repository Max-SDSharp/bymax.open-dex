'use client'

import { FormEvent, useState } from 'react'

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { PublicKey } from '@solana/web3.js'

import { useDriftStore } from './hooks/useDriftStore'

/**
 * WalletConnect component
 * Provides UI for connecting wallet and viewing other wallets
 */
export default function WalletConnect() {
  const { setViewWallet, setViewMode, viewMode } = useDriftStore()
  const [walletInput, setWalletInput] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  /**
   * Handle submission of wallet address for view mode
   * @param e Form event
   */
  const handleSubmitWalletView = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const pubkey = new PublicKey(walletInput)
      setViewWallet(pubkey)
      setViewMode('view')
    } catch {
      setError('Invalid wallet address')
    }
  }

  /**
   * Switch back to connected wallet mode
   */
  const handleBackToMyWallet = () => {
    setViewMode('connected')
  }

  return (
    <div className="mb-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Drift Protocol Dashboard</h1>
        <WalletMultiButton />
      </div>

      <form onSubmit={handleSubmitWalletView} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter wallet address to view"
          className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          value={walletInput}
          onChange={(e) => setWalletInput(e.target.value)}
          id="wallet-input"
          aria-label="Wallet address input"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View
        </button>
        {viewMode === 'view' && (
          <button
            type="button"
            onClick={handleBackToMyWallet}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to My Wallet
          </button>
        )}
      </form>
    </div>
  )
}
