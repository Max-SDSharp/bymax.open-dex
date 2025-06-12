'use client'

import { useEffect } from 'react'

import websocketService from '@/services/websocketService'
import { websocket } from '@/store/websocketMiddleware'

import OrderBook from './orderBook'
import TradeForm from './tradeForm'
import TradingViewChart from './tradingViewChart'
import HistoryPanel from './userHistoryPanel'

export default function Terminal() {
  useEffect(() => {
    websocket.getState().connect()
    // After connecting, send subscribe to Drift's orderbook
    const subscribeOrderbook = () => {
      websocketService.send({
        type: 'subscribe',
        marketType: 'perp',
        channel: 'orderbook',
        market: 'SOL-PERP',
      })
    }
    // After connecting, send subscribe to Drift's trades
    const subscribeTrades = () => {
      websocketService.send({
        type: 'subscribe',
        marketType: 'perp',
        channel: 'trades',
        market: 'SOL-PERP',
      })
    }

    // Wait for connection before sending subscribe
    const waitForConnection = () => {
      if (websocketService.isActive()) {
        subscribeOrderbook()
        subscribeTrades()
      } else {
        setTimeout(waitForConnection, 200)
      }
    }

    waitForConnection()

    return () => {
      websocketService.send({
        type: 'unsubscribe',
        marketType: 'perp',
        channel: 'orderbook',
        market: 'SOL-PERP',
      })
      websocketService.send({
        type: 'unsubscribe',
        marketType: 'perp',
        channel: 'trades',
        market: 'SOL-PERP',
      })
      websocket.getState().disconnect()
    }
  }, [])

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4">
      <div className="flex flex-col md:flex-row flex-1 gap-4">
        <div className="w-full md:w-[55%] bg-background-secondary p-4 rounded-lg border border-border h-[500px]">
          <TradingViewChart />
        </div>

        <div className="flex flex-col md:flex-row md:w-[45%] gap-4">
          <div className="w-full md:w-1/2 bg-background-tertiary p-4 rounded-lg border border-border h-[500px]">
            <OrderBook />
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
