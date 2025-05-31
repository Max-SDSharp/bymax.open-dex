import { useCallback, useEffect, useState } from 'react'

import { Connection, PublicKey } from '@solana/web3.js'

// Cache para os símbolos obtidos do SDK para não ter que recarregar a cada vez
const symbolCache: Record<number, string> = {}
let isSDKInitialized = false

// Drift program ID (mainnet)
const DRIFT_PROGRAM_ID = 'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH'

/**
 * Hook que inicializa o SDK da Drift e fornece acesso às informações de mercado
 * Carrega os símbolos dos mercados diretamente do SDK
 */
export function useDriftSdk() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [marketsLoaded, setMarketsLoaded] = useState(false)
  const [marketsSymbols, setMarketsSymbols] = useState<Record<number, string>>(
    {},
  )

  // Inicializar o SDK e carregar os símbolos de mercado
  useEffect(() => {
    // Evitar recarregar se já estiver inicializado
    if (isSDKInitialized && Object.keys(symbolCache).length > 0) {
      setMarketsSymbols(symbolCache)
      setIsLoading(false)
      setMarketsLoaded(true)
      return
    }

    async function initializeSdk() {
      try {
        setIsLoading(true)
        setError(null)

        // Importar o SDK dinamicamente para evitar problemas de SSR
        const sdk = await import('@drift-labs/sdk')

        console.log('Inicializando SDK da Drift para obter símbolos de mercado')

        // Criar uma conexão com a rede Solana
        const connection = new Connection(
          process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
            'https://api.mainnet-beta.solana.com',
          'confirmed',
        )

        // Criar uma carteira fictícia apenas para inicialização
        const dummyWallet = {
          publicKey: PublicKey.default,
          signTransaction: (() =>
            Promise.reject(new Error('View only mode'))) as any,
          signAllTransactions: (() =>
            Promise.reject(new Error('View only mode'))) as any,
        }

        // Inicializar o cliente Drift para acessar os mercados
        const driftClient = new sdk.DriftClient({
          connection,
          wallet: dummyWallet,
          programID: new PublicKey(DRIFT_PROGRAM_ID),
        })

        const sdkSymbols: Record<number, string> = {}

        // Primeiro, tentar carregar os símbolos dos mercados perpétuos diretamente do SDK
        let foundSymbolsFromSDK = false
        if (sdk.PerpMarkets && sdk.PerpMarkets['mainnet-beta']) {
          console.log('Carregando mercados da Drift do SDK')

          // Adicionar cada mercado ao cache
          sdk.PerpMarkets['mainnet-beta'].forEach((market) => {
            if (market.marketIndex !== undefined && market.symbol) {
              sdkSymbols[market.marketIndex] = market.symbol
              symbolCache[market.marketIndex] = market.symbol
              foundSymbolsFromSDK = true
            }
          })

          console.log('Símbolos carregados do SDK:', sdkSymbols)
        }

        // Se não encontramos no PerpMarkets, tentar método alternativo
        if (!foundSymbolsFromSDK) {
          console.log('PerpMarkets não encontrado no SDK, tentando alternativa')

          // Método alternativo: tentar obter mercados do cliente Drift diretamente
          try {
            // Tentar acessar mercados perpétuos do cliente
            const marketsAccounts = await driftClient.getPerpMarketAccounts()
            if (marketsAccounts && marketsAccounts.length > 0) {
              console.log(
                'Obtidos mercados perpétuos do cliente Drift:',
                marketsAccounts.length,
              )

              // Processar cada mercado para obter seu símbolo
              for (const marketAccount of marketsAccounts) {
                try {
                  const marketIndex = marketAccount.marketIndex

                  // Obter nome do mercado dos bytes (o nome geralmente é armazenado como array de bytes)
                  if (marketAccount.name && Array.isArray(marketAccount.name)) {
                    // Converter os bytes para string (remover bytes nulos)
                    const marketName = String.fromCharCode(
                      ...marketAccount.name.filter((b) => b > 0),
                    )
                    const symbol = `${marketName}-PERP`

                    sdkSymbols[marketIndex] = symbol
                    symbolCache[marketIndex] = symbol
                    foundSymbolsFromSDK = true

                    console.log(`Mercado ${marketIndex}: ${symbol}`)
                  }
                } catch (err) {
                  console.warn(`Erro ao processar mercado:`, err)
                }
              }
            }
          } catch (err) {
            console.warn(
              'Não foi possível obter mercados do cliente Drift:',
              err,
            )
          }
        }

        // Se não conseguimos dados do SDK por nenhum método, manter loading
        if (!foundSymbolsFromSDK) {
          console.warn(
            'Não foi possível obter símbolos da Drift. A UI permanecerá em estado de loading.',
          )
          setError(
            'Não foi possível carregar os símbolos dos mercados da Drift. Por favor, tente novamente mais tarde.',
          )
          setIsLoading(true)
          return
        }

        // Atualizar o estado com os símbolos obtidos
        setMarketsSymbols(sdkSymbols)

        // Marcar como inicializado
        isSDKInitialized = true
        setMarketsLoaded(true)
        setIsLoading(false)
      } catch (err) {
        console.error('Erro ao inicializar SDK da Drift:', err)
        setError(
          `Falha ao inicializar SDK: ${err instanceof Error ? err.message : String(err)}`,
        )
        // Manter loading quando ocorrer erro
        setIsLoading(true)
      }
    }

    initializeSdk()
  }, [])

  /**
   * Função para obter o símbolo de um mercado a partir do seu índice
   */
  const getMarketSymbol = useCallback(
    (marketIndex: number): string | null => {
      // Primeiro tentar do cache do SDK
      if (symbolCache[marketIndex]) {
        return symbolCache[marketIndex]
      }

      // Depois tentar do estado atual
      if (marketsSymbols[marketIndex]) {
        return marketsSymbols[marketIndex]
      }

      // Se não encontrar, retornar null para indicar que o símbolo não está disponível
      return null
    },
    [marketsSymbols],
  )

  /**
   * Retorna todos os símbolos de mercados disponíveis
   */
  const getAllMarketSymbols = useCallback((): Record<number, string> => {
    // Se temos símbolos carregados do SDK, retornar
    if (Object.keys(marketsSymbols).length > 0) {
      return marketsSymbols
    }

    // Senão, tentar usar o cache
    if (Object.keys(symbolCache).length > 0) {
      return symbolCache
    }

    // Se não temos nada, retornar objeto vazio
    return {}
  }, [marketsSymbols])

  return {
    isLoading,
    error,
    marketsLoaded,
    getMarketSymbol,
    getAllMarketSymbols,
  }
}
