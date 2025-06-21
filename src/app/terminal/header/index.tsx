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
        <div className="col-span-1">
          <SymbolSelection />
        </div>
        {/* Other header info can go here
        <div className="col-span-1 md:col-span-3">
           
        </div>
        */}
      </div>
      <hr className="border-border" />
    </div>
  )
}

export default HeaderInformation
