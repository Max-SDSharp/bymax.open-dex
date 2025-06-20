'use client'

import React from 'react'

import dynamic from 'next/dynamic'

const SymbolSelection = dynamic(() => import('./symbolSelection'), {
  ssr: false,
})

const HeaderInformation: React.FC = () => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="col-span-1">
          <SymbolSelection />
        </div>
        <div className="col-span-3">{/* Other header info can go here */}</div>
      </div>
      <hr className="border-gray-600" />
    </div>
  )
}

export default HeaderInformation
