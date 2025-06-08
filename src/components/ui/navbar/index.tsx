'use client'

import React from 'react'

import NavbarTheme from './theme'
import NavbarWallet from './wallet'

const Navbar: React.FC = () => {
  return (
    <nav className="w-full h-16 border-b border-border bg-background">
      <div className="h-full px-4 mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-foreground">Bymax OpenDEX</h1>
        </div>

        <div className="flex items-center">
          <NavbarTheme />
          <NavbarWallet onOpen={() => {}} />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
