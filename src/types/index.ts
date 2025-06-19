/**
 * Interface for order book data structure
 */
export interface OrderBookData {
  marketName: string
  bids: Array<{ price: number; size: number; total: number }>
  asks: Array<{ price: number; size: number; total: number }>
  oracle: number
}

/**
 * Interface for trade data structure
 */
export interface TradeData {
  ts: number
  marketIndex: number
  marketType: string
  filler: string
  takerFee: number
  makerFee: number
  quoteAssetAmountSurplus: number
  baseAssetAmountFilled: number
  quoteAssetAmountFilled: number
  taker: string
  takerOrderId: number
  takerOrderDirection: 'long' | 'short'
  takerOrderBaseAssetAmount: number
  takerOrderCumulativeBaseAssetAmountFilled: number
  takerOrderCumulativeQuoteAssetAmountFilled: number
  makerOrderId: number | null
  makerOrderBaseAssetAmount: number
  makerOrderCumulativeBaseAssetAmountFilled: number
  makerOrderCumulativeQuoteAssetAmountFilled: number
  oraclePrice: number
  txSig: string
  slot: number
  fillRecordId: number
  action: string
  actionExplanation: string
  referrerReward: number
  bitFlags: number
}
