'use client'

import React from 'react'

import dynamic from 'next/dynamic'

const SymbolSelection = dynamic(() => import('./symbolSelection'), {
  ssr: false,
})

const HeaderInformation: React.FC = () => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-1 md:mb-4">
          <SymbolSelection />
        </div>
        <div className="col-span-1 md:col-span-3">
          {/* Other header info can go here */}
        </div>
      </div>
      <hr className="border-gray-600" />
    </div>
  )
}

export default HeaderInformation
