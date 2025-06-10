'use client'

import React, { useState } from 'react'

import Drawer from '../ui/drawer'
import SolanaComponent from './auth/solana'

interface AccountsProps {
  isOpen: boolean
  onClose: () => void
}

const Accounts: React.FC<AccountsProps> = ({ isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)

  const handleAccordionChange = (index: number) => {
    setCurrentIndex(currentIndex === index ? null : index)
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Login in with">
      <div className="flex flex-col h-full">
        <SolanaComponent
          onClose={onClose}
          currentIndex={currentIndex}
          onAccordionChange={handleAccordionChange}
        />
      </div>
    </Drawer>
  )
}

export default Accounts
