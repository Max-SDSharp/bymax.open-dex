'use client'

import { useState } from 'react'

import HeaderInformation from './header'
import OrderBook from './orderBook'
import RecentTrades from './recentTrades'
import TradeForm from './tradeForm'
import TradingViewChart from './tradingViewChart'
import HistoryPanel from './userHistoryPanel'

export default function Terminal() {
  const [activeTab, setActiveTab] = useState<'orderbook' | 'trades'>(
    'orderbook',
  )

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4">
      <HeaderInformation />
      <div className="flex flex-col md:flex-row flex-1 gap-4">
        <div className="w-full md:w-[55%] bg-background-secondary p-4 rounded-lg border border-border h-[500px]">
          <TradingViewChart />
        </div>

        <div className="flex flex-col md:flex-row md:w-[45%] gap-4">
          <div className="w-full md:w-1/2 bg-background-tertiary p-4 rounded-lg border border-border h-[500px]">
            <div className="flex items-center mb-2 w-full">
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium text-center ${
                  activeTab === 'orderbook'
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-foreground/70'
                }`}
                onClick={() => setActiveTab('orderbook')}
              >
                Orderbook
              </button>
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium text-center ${
                  activeTab === 'trades'
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-foreground/70'
                }`}
                onClick={() => setActiveTab('trades')}
              >
                Recent Trades
              </button>
            </div>
            {activeTab === 'orderbook' ? <OrderBook /> : <RecentTrades />}
          </div>
          <div className="w-full md:w-1/2 bg-background-quaternary p-4 rounded-lg border border-border h-[500px] flex flex-col justify-between">
            <TradeForm />
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="w-full bg-background-primary p-4 rounded-lg border border-border h-[300px]">
          <HistoryPanel />
        </div>
      </div>
    </div>
  )
}
