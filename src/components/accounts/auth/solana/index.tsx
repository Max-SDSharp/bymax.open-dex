import React, { useState, useEffect } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import { user } from '@/store/user'
import { formatWalletAddress } from '@/utils/wallet'

// Import wallet adapter styles
import './wallet-adapter-tailwind-global.css'

interface SolanaComponentProps {
  onClose: () => void
  currentIndex: number | null
  onAccordionChange: (index: number) => void
}

const SolanaComponent: React.FC<SolanaComponentProps> = ({
  currentIndex,
  onAccordionChange,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { wallet, publicKey, connecting, connected } = useWallet()
  const addUser = user((state) => state.addUser)
  const index = 1

  // Add wallet to user store when connected
  useEffect(() => {
    if (publicKey) {
      addUser({
        id: 'publicKey',
        data: {
          wallet: wallet?.adapter.name,
          publicKey: publicKey.toString(),
        },
        lastUpdate: Date.now(),
      })
    }
  }, [publicKey, wallet, addUser])

  // Simplified function to open the wallet modal
  const handleOpenWalletModal = () => {
    setIsLoading(true)

    // Find all buttons in the DOM that could control the wallet modal
    const walletButtons = document.querySelectorAll(
      '.wallet-adapter-button-trigger',
    )

    if (walletButtons.length > 0) {
      // Fire the click event on the button we found
      walletButtons[0].dispatchEvent(
        new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        }),
      )
    }
    setIsLoading(false)
  }

  return (
    <div className="w-full">
      <div
        className={`border rounded-lg overflow-hidden ${
          currentIndex === index ? 'border-gray-300 dark:border-gray-700' : ''
        }`}
      >
        <button
          className={`w-full px-4 py-3 flex items-center justify-between ${
            currentIndex === index
              ? 'bg-gray-100 dark:bg-gray-700'
              : 'bg-white dark:bg-gray-900'
          }`}
          onClick={() => onAccordionChange(index)}
        >
          <span className="font-medium">Solana Wallet</span>
          <svg
            className={`w-5 h-5 transform transition-transform ${
              currentIndex === index ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {currentIndex === index && (
          <div className="p-4 bg-white dark:bg-gray-900">
            <div className="flex flex-col gap-4">
              {!wallet || !publicKey ? (
                <div className="w-full">
                  <button
                    className="w-full h-[58px] bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleOpenWalletModal}
                    disabled={connecting}
                  >
                    {connecting ? 'Connecting...' : 'Connect Wallet'}
                  </button>

                  {/* Original button hidden */}
                  <div className="hidden">
                    <WalletMultiButton />
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Wallet connected:{' '}
                    {publicKey && formatWalletAddress(publicKey.toString())}
                  </p>
                  <button
                    className="w-full h-[58px] bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {connected ? 'Wallet Connected' : 'Connecting...'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SolanaComponent
