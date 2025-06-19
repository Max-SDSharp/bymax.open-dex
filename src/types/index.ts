export interface Trade {
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
