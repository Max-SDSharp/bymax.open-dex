import OrderBook from './terminal/orderBook'
import TradeForm from './terminal/tradeForm'
import ChartBox from './terminal/tradingViewChart'
import HistoryPanel from './terminal/userHistoryPanel'

export default function Home() {
  return (
    <div className="flex flex-col h-full w-full p-4 gap-4">
      {/* Main content area */}
      <div className="flex flex-col md:flex-row flex-1 gap-4">
        {/* Left section: Chart */}
        <div className="w-full md:w-[55%] bg-background-secondary p-4 rounded-lg border border-border h-[500px]">
          <ChartBox />
        </div>

        {/* Right section: Order Book and Trade Form */}
        <div className="flex flex-col md:flex-row md:w-[45%] gap-4">
          {/* Order Book */}
          <div className="w-full md:w-1/2 bg-background-tertiary p-4 rounded-lg border border-border h-[500px]">
            <OrderBook />
          </div>
          {/* Trade Form */}
          <div className="w-full md:w-1/2 bg-background-quaternary p-4 rounded-lg border border-border h-[500px] flex flex-col justify-between">
            <TradeForm />
          </div>
        </div>
      </div>

      {/* Bottom section: Trade History */}
      <div className="w-full">
        <div className="w-full bg-background-primary p-4 rounded-lg border border-border h-[300px]">
          <HistoryPanel />
        </div>
      </div>
    </div>
  )
}
