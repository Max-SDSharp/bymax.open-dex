'use client'

import React, { useState } from 'react'

import NavbarTheme from './theme'
import NavbarWallet from './wallet'
import Drawer from '../drawer'

const Navbar: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
  }

  return (
    <>
      <nav className="w-full h-16 border-b border-border bg-background">
        <div className="h-full px-4 mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-foreground">Bymax OpenDEX</h1>
          </div>

          <div className="flex items-center">
            <NavbarTheme />
            <NavbarWallet onOpen={handleOpenDrawer} />
          </div>
        </div>
      </nav>

      <Drawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} title="Wallet">
        <div className="flex flex-col h-full">
          {/* Add your wallet content here */}
        </div>
      </Drawer>
    </>
  )
}

export default Navbar
