'use client'

import React, { useState } from 'react'

import { FaWallet } from 'react-icons/fa'

import Accounts from '@/components/accounts'

const NavbarWallet: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
  }

  return (
    <div className="flex items-center justify-end">
      <button
        aria-label="Wallet"
        onClick={handleOpenDrawer}
        className="p-2 hover:bg-transparent focus:outline-none"
      >
        <FaWallet className="mt-1" size="17px" />
      </button>

      <Accounts isOpen={isDrawerOpen} onClose={handleCloseDrawer} />
    </div>
  )
}

export default NavbarWallet
