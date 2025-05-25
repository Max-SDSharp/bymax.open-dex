'use client'

import { FormEvent, useEffect, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Connection, PublicKey } from '@solana/web3.js'

const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL as string

export default function DriftClient() {
  const { connected, publicKey, signTransaction, signAllTransactions } =
    useWallet()

  // View controls
  const [walletInput, setWalletInput] = useState<string>('')
  const [viewMode, setViewMode] = useState<'connected' | 'view'>('connected')
  const [viewWallet, setViewWallet] = useState<PublicKey | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Account data
  const [subaccounts, setSubaccounts] = useState<number[]>([0])
  const [activeSubaccount, setActiveSubaccount] = useState<number>(0)
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null)
  const [spotBalances, setSpotBalances] = useState<
    { symbol: string; balance: number }[]
  >([])
  const [perpPositions, setPerpPositions] = useState<
    { symbol: string; size: number; notional: number }[]
  >([])

  // Trading states
  const [activeTab, setActiveTab] = useState<'account' | 'trade' | 'orders'>(
    'account',
  )
  const [selectedMarket, setSelectedMarket] = useState<number>(1) // Default to SOL-PERP (index 1)
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [depositAmount, setDepositAmount] = useState<string>('')
  const [withdrawAmount, setWithdrawAmount] = useState<string>('')

  // Orders state
  const [orders, setOrders] = useState<any[]>([])
  const [orderHistory, setOrderHistory] = useState<any[]>([])

  useEffect(() => {
    if (viewMode === 'connected' && (!connected || !publicKey)) return
    if (viewMode === 'view' && !viewWallet) return

    setLoading(true)
    setError(null)

    const run = async () => {
      try {
        const sdk = await import('@drift-labs/sdk')
        const {
          DriftClient,
          User,
          convertToNumber,
          QUOTE_PRECISION,
          SpotMarkets,
        } = sdk

        const connection = new Connection(
          endpoint || 'https://api.devnet.solana.com',
          'confirmed',
        )
        console.log(
          'Connected to:',
          endpoint || 'https://api.devnet.solana.com',
        )

        // Create a wallet provider based on mode
        const wallet =
          viewMode === 'connected'
            ? {
                publicKey: publicKey!,
                signTransaction: signTransaction!,
                signAllTransactions: signAllTransactions!,
              }
            : {
                // Dummy wallet for view mode
                publicKey: viewWallet!,
                signTransaction: (() =>
                  Promise.reject(new Error('View only mode'))) as any,
                signAllTransactions: (() =>
                  Promise.reject(new Error('View only mode'))) as any,
              }

        // Create drift client
        const driftClient = new DriftClient({
          connection,
          wallet,
          programID: new PublicKey(
            'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH',
          ), // Drift mainnet program ID
        })

        // Only subscribe in connected mode
        if (viewMode === 'connected') {
          await driftClient.subscribe()

          // Fetch subaccount information
          try {
            const nextSubaccountId = await driftClient.getNextSubAccountId()
            console.log('Next subaccount ID:', nextSubaccountId)

            if (nextSubaccountId > 0) {
              const subaccountIds = Array.from(
                { length: nextSubaccountId },
                (_, i) => i,
              )
              console.log('Subaccount IDs:', subaccountIds)
              setSubaccounts(subaccountIds)
            }
          } catch (error) {
            console.error('Error fetching subaccounts:', error)
            setError('Failed to fetch subaccounts')
          }
        }

        try {
          // Get the target subaccount
          const subaccountId = viewMode === 'connected' ? activeSubaccount : 0

          // No modo de visualização, abordagem direta sem verificação prévia
          let userAccountPublicKey

          try {
            if (viewMode === 'view') {
              console.log('View mode for wallet:', viewWallet?.toString())

              // No modo de visualização, use o authority (endereço da carteira) diretamente
              // em vez de tentar verificar se o usuário existe primeiro
              try {
                // Usando uma abordagem alternativa para o modo de visualização
                const driftClientAny = driftClient as any

                // Tente primeiro usar getUserAccount se disponível
                if (typeof driftClientAny.getUserAccount === 'function') {
                  const userAccount = await driftClientAny.getUserAccount(
                    viewWallet!,
                    subaccountId,
                  )
                  console.log('Found user account directly:', userAccount)

                  // Extrair a chave pública da conta do usuário
                  userAccountPublicKey = userAccount.pubkey
                } else {
                  // Se não funcionar, use o método padrão, mas com tratamento de erro
                  userAccountPublicKey =
                    await driftClient.getUserAccountPublicKey(0)
                  console.log(
                    'Used default method to get user account public key',
                  )
                }
              } catch (viewErr) {
                console.log(
                  'Error in view mode, trying alternative approach:',
                  viewErr,
                )

                // Como último recurso, crie uma chave derivada manualmente
                // Isso é uma simplificação, mas pode funcionar para visualização
                try {
                  const programID = new PublicKey(
                    'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH',
                  )
                  const [derivedKey] = await PublicKey.findProgramAddress(
                    [
                      Buffer.from('user'),
                      viewWallet!.toBuffer(),
                      Buffer.from([subaccountId]),
                    ],
                    programID,
                  )
                  userAccountPublicKey = derivedKey
                  console.log(
                    'Created derived key manually:',
                    userAccountPublicKey.toString(),
                  )
                } catch (derivedErr) {
                  console.error('Failed to create derived key:', derivedErr)
                  throw new Error('Cannot access this wallet in view mode')
                }
              }

              console.log(
                'View mode user account public key:',
                userAccountPublicKey.toString(),
              )
            } else {
              userAccountPublicKey =
                await driftClient.getUserAccountPublicKey(subaccountId)
            }

            // Create user for data access
            const user = new User({ driftClient, userAccountPublicKey })

            // Only subscribe in connected mode
            if (viewMode === 'connected') {
              await user.subscribe()
            }

            console.log('User object:', user)

            // Get USDC balance (marketIndex 0)
            try {
              const usdcPosition = user.getSpotPosition(0)
              if (usdcPosition) {
                // Log all properties of the position for debugging
                console.log('Full USDC position object:', usdcPosition)
                console.log('Type of position:', typeof usdcPosition)
                console.log('Available properties:', Object.keys(usdcPosition))

                console.log(
                  'Raw USDC balance:',
                  usdcPosition.scaledBalance.toString(),
                )
                console.log('QUOTE_PRECISION:', QUOTE_PRECISION.toString())
              } else {
                setUsdcBalance(0)
              }
            } catch (err) {
              console.error('Error getting USDC balance:', err)
              setUsdcBalance(0)
            }

            // Get all spot positions (simplified)
            try {
              const spotPositionsData = []
              // Check positions for market indices 0-10
              for (let i = 0; i < 10; i++) {
                const position = user.getSpotPosition(i)

                if (position && !position.scaledBalance.isZero()) {
                  const spotMarket = driftClient.getSpotMarketAccount(i)
                  let balance = 0
                  let symbol = `Market ${i}` // Default value

                  if (spotMarket) {
                    // Use getTokenAmount for proper conversion including interest
                    const { getTokenAmount } = sdk
                    const tokenAmount = getTokenAmount(
                      position.scaledBalance,
                      spotMarket,
                      position.balanceType,
                    )
                    balance = convertToNumber(tokenAmount, QUOTE_PRECISION)

                    // Update USDC Balance if this is market 0 (USDC)
                    if (i === 0) {
                      setUsdcBalance(balance)
                      console.log(
                        'Updated USDC balance from spot positions:',
                        balance,
                      )
                    }

                    // Log the entire spotMarket object to find the symbol property
                    console.log(`Full Spot Market ${i} object:`, spotMarket)

                    // Get symbol from SDK SpotMarkets configuration
                    try {
                      // Try to get from mainnet-beta configuration first
                      const marketConfig = SpotMarkets['mainnet-beta'].find(
                        (market) => market.marketIndex === i,
                      )

                      if (marketConfig && marketConfig.symbol) {
                        symbol = marketConfig.symbol
                        console.log(
                          `Found symbol from SpotMarkets config for market ${i}:`,
                          symbol,
                        )
                      } else {
                        // Fallback to hard-coded values for common markets
                        if (i === 0) symbol = 'USDC'
                        if (i === 1) symbol = 'SOL'
                        if (i === 3) symbol = 'BTC'
                        if (i === 4) symbol = 'ETH'
                      }
                    } catch (e) {
                      console.log(
                        `Error getting symbol from SpotMarkets for market ${i}:`,
                        e,
                      )
                      // Fallback to hard-coded values for common markets
                      if (i === 0) symbol = 'USDC'
                      if (i === 1) symbol = 'SOL'
                      if (i === 3) symbol = 'BTC'
                      if (i === 4) symbol = 'ETH'
                    }

                    // Additional attempt to access properties from spotMarket object
                    try {
                      // Check if any relevant properties exist on the spotMarket object
                      const marketAccount = spotMarket as any
                      if (marketAccount && typeof marketAccount === 'object') {
                        if (
                          marketAccount.name &&
                          typeof marketAccount.name === 'string'
                        ) {
                          symbol = marketAccount.name
                          console.log(
                            `Found name property for market ${i}:`,
                            symbol,
                          )
                        }

                        if (
                          marketAccount.symbol &&
                          typeof marketAccount.symbol === 'string'
                        ) {
                          symbol = marketAccount.symbol
                          console.log(
                            `Found symbol property for market ${i}:`,
                            symbol,
                          )
                        }
                      }
                    } catch (e) {
                      console.log(`Error getting symbol for market ${i}:`, e)
                    }
                  } else {
                    // Fallback to direct conversion if spot market not found
                    balance = convertToNumber(
                      position.scaledBalance,
                      QUOTE_PRECISION,
                    )

                    // Update USDC Balance if this is market 0 (USDC)
                    if (i === 0) {
                      setUsdcBalance(balance)
                      console.log(
                        'Updated USDC balance from spot positions (fallback):',
                        balance,
                      )
                    }
                  }

                  spotPositionsData.push({
                    symbol,
                    balance,
                  })
                }
              }
              setSpotBalances(spotPositionsData)
            } catch (err) {
              console.error('Error getting spot positions:', err)
            }

            // Get all perp positions (simplified)
            try {
              const perpPositionsData = []
              // Check positions for market indices 0-10
              for (let i = 0; i < 10; i++) {
                const position = user.getPerpPosition(i)
                if (position && !position.baseAssetAmount.isZero()) {
                  const size = convertToNumber(
                    position.baseAssetAmount,
                    QUOTE_PRECISION,
                  )

                  let symbol = `Market ${i}`

                  // Hard-coded symbols for common markets
                  if (i === 0) symbol = 'USDC'
                  if (i === 1) symbol = 'SOL'
                  if (i === 3) symbol = 'BTC'
                  if (i === 4) symbol = 'ETH'

                  // Try to get from SpotMarkets configuration
                  try {
                    // Try to get from mainnet-beta configuration
                    const marketConfig = SpotMarkets['mainnet-beta'].find(
                      (market) => market.marketIndex === i,
                    )
                    if (marketConfig && marketConfig.symbol) {
                      symbol = marketConfig.symbol
                    }
                  } catch (e) {
                    console.log(
                      `Error getting symbol from SpotMarkets for perp market ${i}:`,
                      e,
                    )
                  }

                  perpPositionsData.push({
                    symbol: `${symbol}-PERP`,
                    size,
                    notional: size * 1, // Placeholder for notional value
                  })
                }
              }
              setPerpPositions(perpPositionsData)
            } catch (err) {
              console.error('Error getting perp positions:', err)
            }

            // Fetch user's open orders
            try {
              // Get open orders from the SDK
              console.log('Fetching open orders for user...')
              const openOrders = user.getOpenOrders()
              console.log('Open orders from SDK:', openOrders)

              if (openOrders && openOrders.length > 0) {
                const formattedOrders = openOrders.map((order) => {
                  // Exibir informações detalhadas da ordem para depuração
                  console.log('Raw order data:', JSON.stringify(order, null, 2))
                  console.log('Order properties:', Object.keys(order))
                  console.log(
                    'Order type:',
                    order.orderType,
                    'toString():',
                    String(order.orderType),
                  )
                  console.log('Market index:', order.marketIndex)

                  // Get market symbol - primeiro tente obter o marketName diretamente
                  const marketIndex = order.marketIndex || 0
                  let symbol = `Market ${marketIndex}`

                  // Tentar obter o símbolo do mercado perpétuo diretamente
                  try {
                    // No Drift, o símbolo perpétuo pode estar em PerpMarkets em vez de SpotMarkets
                    if (sdk.PerpMarkets && sdk.PerpMarkets['mainnet-beta']) {
                      const perpMarketConfig = sdk.PerpMarkets[
                        'mainnet-beta'
                      ].find((market) => market.marketIndex === marketIndex)
                      if (perpMarketConfig && perpMarketConfig.symbol) {
                        symbol = perpMarketConfig.symbol
                        console.log(
                          `Found symbol from PerpMarkets config: ${symbol}`,
                        )
                      }
                    }

                    // Caso não encontre em PerpMarkets, tente no mercado perpétuo direto
                    if (symbol === `Market ${marketIndex}`) {
                      const perpMarket =
                        driftClient.getPerpMarketAccount(marketIndex)
                      console.log(
                        `Perp market for index ${marketIndex}:`,
                        perpMarket,
                      )

                      if (perpMarket && perpMarket.name) {
                        // O nome pode ser um array de números (bytes), converter para string
                        const nameValue = perpMarket.name
                        if (Array.isArray(nameValue)) {
                          // Converter array de números para string
                          symbol = String.fromCharCode(
                            ...nameValue.filter((n) => n > 0),
                          )
                        } else {
                          symbol = String(nameValue)
                        }
                        console.log(
                          `Found symbol from perp market object: ${symbol}`,
                        )
                      }
                    }

                    // Tente verificar se temos dados de informação de mercado perpétuo mais detalhados
                    // Este método pode não existir na versão atual da SDK, então envolvemos em try/catch
                    try {
                      const driftClientAny = driftClient as any
                      if (typeof driftClientAny.getMarketInfo === 'function') {
                        const marketInfo = driftClientAny.getMarketInfo(
                          marketIndex,
                          true,
                        ) // true para perpétuo
                        console.log(
                          `Market info for perp ${marketIndex}:`,
                          marketInfo,
                        )
                        if (marketInfo && marketInfo.symbol) {
                          symbol = marketInfo.symbol
                          console.log(`Found symbol from marketInfo: ${symbol}`)
                        }
                      }
                    } catch (e) {
                      console.log(`Error getting market info: ${e}`)
                    }

                    // Fallback para alguns mercados conhecidos
                    if (symbol === `Market ${marketIndex}`) {
                      // Mapeamento comum de índices de mercado perpétuo
                      const knownPerpMarkets: Record<number, string> = {
                        0: 'SOL',
                        1: 'BTC',
                        2: 'ETH',
                        3: 'ARB',
                        4: 'BNB',
                        5: 'PYTH',
                        6: 'DOGE',
                        7: 'RNDR',
                        8: 'XRP',
                        9: 'SUI',
                        10: 'TIA',
                        11: 'JUP',
                        12: 'SEI',
                        13: 'JTO',
                        14: 'BONK',
                        15: 'WIF',
                      }

                      if (knownPerpMarkets[marketIndex]) {
                        symbol = knownPerpMarkets[marketIndex]
                        console.log(
                          `Used known perp market mapping for index ${marketIndex}: ${symbol}`,
                        )
                      }
                    }
                  } catch (e) {
                    console.log('Error getting perp market symbol:', e)
                  }

                  // Determinando o tipo de ordem corretamente
                  let orderTypeStr = 'market'

                  try {
                    // Logging completo do objeto orderType
                    console.log('Order type object:', order.orderType)

                    // Verificação adicional para a ordenType que vem da JUP
                    console.log('Order details for debugging:', {
                      orderType: order.orderType,
                      direction: order.direction,
                      price: order.price,
                      triggerPrice: order.triggerPrice,
                      postOnly: order.postOnly,
                      reduceOnly: order.reduceOnly,
                      triggerCondition: order.triggerCondition,
                      immediateOrCancel: order.immediateOrCancel,
                      // Usar acesso seguro para propriedades que podem não existir no tipo Order
                      limitPrice: (order as any).limitPrice,
                    })

                    // Verificar se orderType é um objeto com chaves específicas (formato Rust/Anchor)
                    const orderTypeObj = order.orderType as any
                    if (
                      typeof orderTypeObj === 'object' &&
                      orderTypeObj !== null
                    ) {
                      console.log(
                        'OrderType é um objeto, chaves:',
                        Object.keys(orderTypeObj),
                      )

                      // Verificar chaves diretas que representam o tipo
                      if (orderTypeObj.limit !== undefined) {
                        orderTypeStr = 'limit'
                        console.log(
                          'Tipo de ordem detectado diretamente como limit',
                        )
                      } else if (orderTypeObj.postOnly !== undefined) {
                        orderTypeStr = 'limit'
                        console.log(
                          'Tipo de ordem detectado diretamente como post-only (limit)',
                        )
                      } else if (orderTypeObj.postOnlySlide !== undefined) {
                        orderTypeStr = 'limit'
                        console.log(
                          'Tipo de ordem detectado diretamente como post-only-slide (limit)',
                        )
                      } else if (orderTypeObj.market !== undefined) {
                        orderTypeStr = 'market'
                        console.log(
                          'Tipo de ordem detectado diretamente como market',
                        )
                      } else if (
                        orderTypeObj.triggerLimit !== undefined ||
                        orderTypeObj.triggerMarket !== undefined
                      ) {
                        orderTypeStr = 'limit'
                        console.log(
                          'Tipo de ordem detectado diretamente como trigger (limit)',
                        )
                      }
                    }

                    // Caso não seja detectado acima, prosseguir com as verificações existentes...

                    // Verificar se a ordem tem preço definido (ordens limit geralmente têm)
                    if (
                      order.price &&
                      !order.price.isZero &&
                      !order.price.isZero()
                    ) {
                      orderTypeStr = 'limit'
                      console.log('Order has price, assuming limit order')
                    }

                    // Se não tem preço mas tem triggerPrice, pode ser uma ordem stop
                    if (
                      order.triggerPrice &&
                      !order.triggerPrice.isZero &&
                      !order.triggerPrice.isZero()
                    ) {
                      orderTypeStr = 'limit'
                      console.log(
                        'Order has trigger price, assuming limit order',
                      )
                    }

                    // Verificar se existe limitPrice em algum campo (usando 'as any' para evitar erro de tipo)
                    const orderAsAny = order as any
                    if (
                      orderAsAny.limitPrice &&
                      !orderAsAny.limitPrice.isZero &&
                      !orderAsAny.limitPrice.isZero()
                    ) {
                      orderTypeStr = 'limit'
                      console.log('Order has limit price, assuming limit order')
                    }

                    // Determinar tipo baseado nas propriedades da ordem
                    if (order.orderType) {
                      // Converter para string e verificar
                      const typeStr = String(order.orderType).toUpperCase()
                      console.log('Order type string (uppercase):', typeStr)

                      // Verificar por várias strings que podem indicar uma ordem limit
                      if (
                        typeStr.includes('LIMIT') ||
                        typeStr.includes('TRIGGER') ||
                        typeStr === '1' ||
                        typeStr === 'POSTONLY' ||
                        typeStr === 'POST_ONLY'
                      ) {
                        orderTypeStr = 'limit'
                        console.log('Order type string indicates limit order')
                      }

                      // Verificar enumeração numérica se for o caso
                      const typeNum = Number(order.orderType)
                      console.log('Order type as number:', typeNum)

                      // Se for um número, pode estar usando enumeração (0 = market, 1 = limit, etc.)
                      if (!isNaN(typeNum)) {
                        if (
                          typeNum === 1 ||
                          typeNum === 2 ||
                          typeNum === 3 ||
                          typeNum === 4 ||
                          typeNum === 5
                        ) {
                          // Na maioria das APIs, qualquer número diferente de 0 é um tipo de ordem limit
                          orderTypeStr = 'limit'
                          console.log(
                            `Determined order type from enum (${typeNum}): limit`,
                          )
                        }
                      }
                    }

                    // Verificar também outras propriedades que possam indicar o tipo de ordem
                    const orderAny = order as any
                    if (
                      orderAny.postOnly ||
                      orderAny.postOnlySlide ||
                      orderAny.price ||
                      orderAny.triggerPrice ||
                      orderAny.limitPrice ||
                      (orderAny.orderType &&
                        orderAny.orderType.toString &&
                        orderAny.orderType.toString().includes('LIMIT'))
                    ) {
                      orderTypeStr = 'limit'
                      console.log('Order has limit-related properties')
                    }

                    // Para JUP-PERP especificamente (baseado na sua ordem)
                    if (symbol.includes('JUP') && orderAny.price) {
                      orderTypeStr = 'limit'
                      console.log(
                        'JUP order with price detected, setting as limit',
                      )
                    }
                  } catch (e) {
                    console.log('Error determining order type:', e)
                  }

                  // Format the order data
                  return {
                    id:
                      order.orderId?.toString() ||
                      Math.random().toString(36).substring(7),
                    market: `${symbol}-PERP`,
                    type: orderTypeStr,
                    side: order.direction === 0 ? 'buy' : 'sell', // Assuming 0 is long/buy, 1 is short/sell
                    amount: convertToNumber(
                      order.baseAssetAmount,
                      QUOTE_PRECISION,
                    ),
                    price: order.price
                      ? convertToNumber(order.price, QUOTE_PRECISION)
                      : 'Market',
                    status: 'open',
                    timestamp: new Date().toISOString(),
                    // Store the original order for reference
                    originalOrder: order,
                  }
                })

                console.log('Formatted open orders:', formattedOrders)
                setOrders(formattedOrders)
              } else {
                console.log('No open orders found')
              }
            } catch (err) {
              console.error('Error fetching open orders:', err)
            }
          } catch (err) {
            console.error('Error accessing user account:', err)
            setError('Could not access account data')
          }
        } catch (err) {
          console.error('Error accessing user account:', err)
          setError('Could not access account data')
        }
      } catch (err) {
        console.error('Error loading data:', err)
        setError(
          `Failed to load account data: ${err instanceof Error ? err.message : String(err)}`,
        )
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [
    connected,
    publicKey,
    signTransaction,
    signAllTransactions,
    activeSubaccount,
    viewMode,
    viewWallet,
  ])

  const handleSubmitWalletView = (e: FormEvent) => {
    e.preventDefault()
    try {
      const pubkey = new PublicKey(walletInput)
      setViewWallet(pubkey)
      setViewMode('view')
    } catch {
      setError('Invalid wallet address')
    }
  }

  const handleSubaccountChange = (subaccountId: number) => {
    // Limpar as orders e orderHistory ao trocar de subaccount
    setOrders([])
    setOrderHistory([])
    setActiveSubaccount(subaccountId)
  }

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!connected) {
      setError('Please connect your wallet first')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      setError('Please enter a valid price')
      return
    }

    setLoading(true)
    try {
      // Here would be the integration with Drift SDK to place the order
      // This is a placeholder for demonstration purposes
      console.log('Placing order:', {
        market: selectedMarket,
        type: orderType,
        side: orderSide,
        amount,
        price: orderType === 'limit' ? price : 'market',
      })

      // Mock successful order placement
      const newOrder = {
        id: Math.random().toString(36).substring(7),
        market: `Market ${selectedMarket}`,
        type: orderType,
        side: orderSide,
        amount: parseFloat(amount),
        price: orderType === 'limit' ? parseFloat(price) : 'Market',
        status: 'open',
        timestamp: new Date().toISOString(),
      }

      // Add to orders list
      setOrders((prev) => [...prev, newOrder])

      // Clear form
      setAmount('')
      setPrice('')
    } catch (err) {
      console.error('Error placing order:', err)
      setError(
        `Failed to place order: ${err instanceof Error ? err.message : String(err)}`,
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!connected) {
      setError('Please connect your wallet first')
      return
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid deposit amount')
      return
    }

    setLoading(true)
    try {
      // Here would be the integration with Drift SDK to deposit
      console.log('Depositing:', {
        amount: depositAmount,
        subaccount: activeSubaccount,
      })

      // Clear form
      setDepositAmount('')
    } catch (err) {
      console.error('Error depositing:', err)
      setError(
        `Failed to deposit: ${err instanceof Error ? err.message : String(err)}`,
      )
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!connected) {
      setError('Please connect your wallet first')
      return
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid withdrawal amount')
      return
    }

    setLoading(true)
    try {
      // Here would be the integration with Drift SDK to withdraw
      console.log('Withdrawing:', {
        amount: withdrawAmount,
        subaccount: activeSubaccount,
      })

      // Clear form
      setWithdrawAmount('')
    } catch (err) {
      console.error('Error withdrawing:', err)
      setError(
        `Failed to withdraw: ${err instanceof Error ? err.message : String(err)}`,
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = (orderId: string) => {
    // Find the order to cancel
    const orderToCancel = orders.find((order) => order.id === orderId)

    if (orderToCancel) {
      setLoading(true)
      // If the order has an originalOrder property, it's a real order from the protocol
      if (orderToCancel.originalOrder) {
        try {
          console.log(
            'Attempting to cancel order from Drift protocol:',
            orderToCancel.id,
          )

          // Here you would integrate with the Drift SDK to cancel the order
          // Example: await driftClient.cancelOrder(orderToCancel.originalOrder)

          // Since this is just a placeholder, we'll simulate success after a delay
          setTimeout(() => {
            setOrders((prev) => prev.filter((order) => order.id !== orderId))
            setOrderHistory((prev) => [
              ...prev,
              {
                ...orderToCancel,
                status: 'canceled',
              },
            ])
            setLoading(false)
          }, 500)
        } catch (err) {
          console.error('Error canceling order:', err)
          setLoading(false)
        }
      } else {
        // For mock orders created in the UI
        setOrders((prev) => prev.filter((order) => order.id !== orderId))
        setOrderHistory((prev) => [
          ...prev,
          {
            ...orderToCancel,
            status: 'canceled',
          },
        ])
        setLoading(false)
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Drift Protocol Dashboard</h1>
        <WalletMultiButton />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* View other wallet form */}
      <div className="mb-6">
        <form onSubmit={handleSubmitWalletView} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter wallet address to view"
            className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            value={walletInput}
            onChange={(e) => setWalletInput(e.target.value)}
            id="wallet-input"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            View
          </button>
          {viewMode === 'view' && (
            <button
              type="button"
              onClick={() => setViewMode('connected')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to My Wallet
            </button>
          )}
        </form>
      </div>

      {loading && !activeTab ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Subaccount selector (only for connected wallet) */}
          {viewMode === 'connected' && connected && subaccounts.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Subaccounts:</h2>
              <div className="flex gap-2 flex-wrap">
                {subaccounts.map((id) => (
                  <button
                    key={id}
                    onClick={() => handleSubaccountChange(id)}
                    className={`px-3 py-1 rounded ${
                      activeSubaccount === id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'
                    }`}
                  >
                    {id === 0 ? 'Default' : `Subaccount ${id}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('account')}
                  className={`py-2 px-4 ${
                    activeTab === 'account'
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Account
                </button>
                <button
                  onClick={() => setActiveTab('trade')}
                  className={`py-2 px-4 ${
                    activeTab === 'trade'
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Trade
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-2 px-4 ${
                    activeTab === 'orders'
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Orders
                </button>
              </nav>
            </div>
          </div>

          {/* Tab content */}
          <div>
            {/* Account Info */}
            {activeTab === 'account' && (
              <div>
                {/* USDC Balance */}
                <div className="mb-6 p-4 border rounded-lg shadow-sm dark:border-gray-700">
                  <h2 className="text-xl font-medium mb-2">USDC Balance</h2>
                  <p className="text-3xl font-bold">
                    $
                    {usdcBalance?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || '0.00'}
                  </p>
                </div>

                {/* Deposit/Withdraw Section */}
                {viewMode === 'connected' && connected && (
                  <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded shadow-sm dark:border-gray-700">
                      <h3 className="text-lg font-medium mb-3">Deposit</h3>
                      <form onSubmit={handleDeposit}>
                        <div className="mb-3">
                          <label
                            htmlFor="deposit-amount"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Amount (USDC)
                          </label>
                          <input
                            id="deposit-amount"
                            type="number"
                            min="0"
                            step="any"
                            placeholder="0.00"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Deposit'}
                        </button>
                      </form>
                    </div>

                    <div className="p-4 border rounded shadow-sm dark:border-gray-700">
                      <h3 className="text-lg font-medium mb-3">Withdraw</h3>
                      <form onSubmit={handleWithdraw}>
                        <div className="mb-3">
                          <label
                            htmlFor="withdraw-amount"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Amount (USDC)
                          </label>
                          <input
                            id="withdraw-amount"
                            type="number"
                            min="0"
                            step="any"
                            placeholder="0.00"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Withdraw'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Spot Balances */}
                <div className="mb-6">
                  <h2 className="text-xl font-medium mb-4">Spot Balances</h2>
                  {spotBalances.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Asset
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Balance
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                          {spotBalances.map((balance, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {balance.symbol}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {balance.balance.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 6,
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      No spot balances found
                    </p>
                  )}
                </div>

                {/* Perp Positions */}
                <div className="mb-6">
                  <h2 className="text-xl font-medium mb-4">
                    Perpetual Positions
                  </h2>
                  {perpPositions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Market
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Size
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Notional
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                          {perpPositions.map((position, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {position.symbol}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {position.size.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 6,
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                $
                                {position.notional.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      No perpetual positions found
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Trade Tab */}
            {activeTab === 'trade' && (
              <div className="mb-6">
                <div className="bg-white dark:bg-gray-900 p-4 border rounded-lg shadow-sm dark:border-gray-700">
                  <h2 className="text-xl font-medium mb-4">Trade</h2>

                  {viewMode === 'view' ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400">
                        Trading is not available in view-only mode.
                      </p>
                    </div>
                  ) : !connected ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Please connect your wallet to trade.
                      </p>
                      <WalletMultiButton />
                    </div>
                  ) : (
                    <form onSubmit={handlePlaceOrder}>
                      <div className="mb-4">
                        <label
                          htmlFor="select-market"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Market
                        </label>
                        <select
                          id="select-market"
                          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                          value={selectedMarket}
                          onChange={(e) =>
                            setSelectedMarket(parseInt(e.target.value))
                          }
                        >
                          <option value={1}>SOL-PERP</option>
                          <option value={2}>BTC-PERP</option>
                          <option value={3}>ETH-PERP</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <fieldset>
                          <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Order Type
                          </legend>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <button
                                type="button"
                                onClick={() => setOrderType('market')}
                                className={`w-full py-2 px-4 rounded-md ${
                                  orderType === 'market'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'
                                }`}
                              >
                                Market
                              </button>
                            </div>
                            <div className="flex-1">
                              <button
                                type="button"
                                onClick={() => setOrderType('limit')}
                                className={`w-full py-2 px-4 rounded-md ${
                                  orderType === 'limit'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'
                                }`}
                              >
                                Limit
                              </button>
                            </div>
                          </div>
                        </fieldset>
                      </div>

                      <div className="mb-4">
                        <fieldset>
                          <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Side
                          </legend>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <button
                                type="button"
                                onClick={() => setOrderSide('buy')}
                                className={`w-full py-2 px-4 rounded-md ${
                                  orderSide === 'buy'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'
                                }`}
                              >
                                Buy
                              </button>
                            </div>
                            <div className="flex-1">
                              <button
                                type="button"
                                onClick={() => setOrderSide('sell')}
                                className={`w-full py-2 px-4 rounded-md ${
                                  orderSide === 'sell'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'
                                }`}
                              >
                                Sell
                              </button>
                            </div>
                          </div>
                        </fieldset>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="trade-amount"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Size
                        </label>
                        <input
                          id="trade-amount"
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0.00"
                          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                        />
                      </div>

                      {orderType === 'limit' && (
                        <div className="mb-4">
                          <label
                            htmlFor="trade-price"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Price
                          </label>
                          <input
                            id="trade-price"
                            type="number"
                            min="0"
                            step="any"
                            placeholder="0.00"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required={orderType === 'limit'}
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                          orderSide === 'buy'
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                        disabled={loading}
                      >
                        {loading
                          ? 'Processing...'
                          : `${orderSide === 'buy' ? 'Buy' : 'Sell'} ${orderType === 'market' ? 'Market' : 'Limit'}`}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-medium mb-4">Open Orders</h2>
                  {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Market
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Side
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Size
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                          {orders.map((order) => (
                            <tr key={order.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {order.market}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap capitalize">
                                {order.type}
                              </td>
                              <td
                                className={`px-6 py-4 whitespace-nowrap capitalize ${
                                  order.side === 'buy'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {order.side}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {typeof order.amount === 'number'
                                  ? order.amount.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 6,
                                    })
                                  : order.amount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {typeof order.price === 'number'
                                  ? order.price.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 6,
                                    })
                                  : order.price}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Cancel
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      No open orders
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-medium mb-4">Order History</h2>
                  {orderHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Market
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Side
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Size
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                          {orderHistory.map((order, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {order.market}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap capitalize">
                                {order.type}
                              </td>
                              <td
                                className={`px-6 py-4 whitespace-nowrap capitalize ${
                                  order.side === 'buy'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {order.side}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {typeof order.amount === 'number'
                                  ? order.amount.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 6,
                                    })
                                  : order.amount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {typeof order.price === 'number'
                                  ? order.price.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 6,
                                    })
                                  : order.price}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap capitalize">
                                {order.status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      No order history
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
