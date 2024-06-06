"use client"

import { createContext, useContext, useEffect, useState } from "react"

import { ExchangePlatform, Pair, binancePairs } from "@/types/_types"

const COINBASE_WEBSOCKET_URL = "wss://ws-feed.exchange.coinbase.com"
const BINANCE_WEBSOCKET_URL = "wss://stream.binance.com:9443/ws"
const BINANCE_WEBSOCKET_URL_US = "wss://stream.binance.us:9443/ws"

type SocketContextType = {
  sockets: {
    [ExchangePlatform.BINANCE]: any | null
    [ExchangePlatform.COINBASE]: any | null
  }
  isConnected: {
    [ExchangePlatform.BINANCE]: boolean
    [ExchangePlatform.COINBASE]: boolean
  }
  prices: {
    [ExchangePlatform.BINANCE]: {
      [Pair.ETH_USD]: string
      [Pair.AVAX_USD]: string
    }
    [ExchangePlatform.COINBASE]: {
      [Pair.ETH_USD]: string
      [Pair.AVAX_USD]: string
    }
  }
}

const SocketContext = createContext<SocketContextType>({
  sockets: {
    [ExchangePlatform.BINANCE]: null,
    [ExchangePlatform.COINBASE]: null,
  },
  isConnected: {
    [ExchangePlatform.BINANCE]: false,
    [ExchangePlatform.COINBASE]: false,
  },
  prices: {
    [ExchangePlatform.BINANCE]: { [Pair.AVAX_USD]: "", [Pair.ETH_USD]: "" },
    [ExchangePlatform.COINBASE]: { [Pair.AVAX_USD]: "", [Pair.ETH_USD]: "" },
  },
})

export const useSocket = () => {
  return useContext(SocketContext)
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [coinbaseSocket, setCoinbaseSocket] = useState<any>(null)
  const [isConnectedCoinbase, setIsConnectedCoinbase] = useState(false)
  const [binanceSocket, setBinanceSocket] = useState<any>(null)
  const [isConnectedBinance, setIsConnectedBinace] = useState(false)
  const [binanceAvaxUsdPrice, setBinanceAvaxUsdPrice] = useState("")
  const [binanceEthUsdPrice, setBinanceEthUsdPrice] = useState("")
  const [coinbaseAvaxUsdPrice, setCoinbaseAvaxUsdPrice] = useState("")
  const [coinbaseEthUsdPrice, setCoinbaseEthUsdPrice] = useState("")

  useEffect(() => {
    ;(async () => {
      const response = await fetch("https://api.country.is/")
      const result = await response.json()
      const coinbaseSocketInstance = new WebSocket(COINBASE_WEBSOCKET_URL)
      const binanceSocketInstance = new WebSocket(
        result.country == "US"
          ? BINANCE_WEBSOCKET_URL_US
          : BINANCE_WEBSOCKET_URL
      )

      coinbaseSocketInstance.onopen = (e: any) => {
        setIsConnectedCoinbase(true)
        coinbaseSocketInstance.send(
          JSON.stringify({
            type: "subscribe",
            product_ids: ["ETH-USD", "AVAX-USD"],
            channels: [
              {
                name: "ticker",
                product_ids: ["ETH-USD", "AVAX-USD"],
              },
            ],
          })
        )
      }
      binanceSocketInstance.onopen = (e: any) => {
        setIsConnectedBinace(true)
        binanceSocketInstance.send(
          JSON.stringify({
            id: 1,
            method: "SUBSCRIBE",
            params: ["ethusdt@ticker", "avaxusdt@ticker"],
          })
        )
      }

      coinbaseSocketInstance.onclose = (e: any) => {
        setIsConnectedCoinbase(false)
      }
      binanceSocketInstance.onclose = (e: any) => {
        setIsConnectedBinace(false)
      }

      coinbaseSocketInstance.onmessage = (e: any) => {
        const data: {
          product_id: Pair
          price: string
        } = JSON.parse(e.data)
        if (data.product_id === Pair.AVAX_USD) {
          setCoinbaseAvaxUsdPrice(Number(data.price).toFixed(2))
        }
        if (data.product_id === Pair.ETH_USD) {
          setCoinbaseEthUsdPrice(Number(data.price).toFixed(2))
        }
      }
      binanceSocketInstance.onmessage = (e: any) => {
        const data: { s: string; c: string } = JSON.parse(e.data)
        if (data.s === binancePairs[Pair.ETH_USD]) {
          setBinanceEthUsdPrice(Number(data.c).toFixed(2))
        }
        if (data.s === binancePairs[Pair.AVAX_USD]) {
          setBinanceAvaxUsdPrice(Number(data.c).toFixed(2))
        }
      }

      setCoinbaseSocket(coinbaseSocketInstance)
      setBinanceSocket(binanceSocketInstance)
    })()
  }, [])

  return (
    <SocketContext.Provider
      value={{
        sockets: {
          [ExchangePlatform.COINBASE]: coinbaseSocket,
          [ExchangePlatform.BINANCE]: binanceSocket,
        },
        isConnected: {
          [ExchangePlatform.COINBASE]: isConnectedCoinbase,
          [ExchangePlatform.BINANCE]: isConnectedBinance,
        },
        prices: {
          [ExchangePlatform.COINBASE]: {
            [Pair.ETH_USD]: coinbaseEthUsdPrice,
            [Pair.AVAX_USD]: coinbaseAvaxUsdPrice,
          },
          [ExchangePlatform.BINANCE]: {
            [Pair.ETH_USD]: binanceEthUsdPrice,
            [Pair.AVAX_USD]: binanceAvaxUsdPrice,
          },
        },
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
