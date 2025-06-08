import React from 'react'

import { FaWallet } from 'react-icons/fa'

interface NavbarWalletProps {
  onOpen: () => void
}

const NavbarWallet: React.FC<NavbarWalletProps> = ({ onOpen }) => {
  return (
    <div className="flex items-center justify-end">
      <button
        aria-label="Wallet"
        onClick={onOpen}
        className="p-2 hover:bg-transparent focus:outline-none"
      >
        <FaWallet className="mt-1" size="17px" />
      </button>
    </div>
  )
}

export default NavbarWallet
