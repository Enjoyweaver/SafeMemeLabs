"use client"

import React, { useEffect, useState } from "react"
import { chainIdToCovalentChainId } from "@/Constants/config"

import "@/styles/tokeninfo.css"

const DexData = ({ tokenAddress, chainId }) => {
  const [dexData, setDexData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDexData = async () => {
      const covalentChainId = chainIdToCovalentChainId[chainId]
      if (!covalentChainId) {
        setError(`Chain ID ${chainId} not supported by Covalent`)
        setLoading(false)
        return
      }

      const apiKey = process.env.NEXT_PUBLIC_COVALENT_API_KEY
      const url = `https://api.covalenthq.com/v1/${covalentChainId}/xy=k/tokens/address/${tokenAddress}/pools/page/1/?quote-currency=USD&dex-name=spookyswap&page-size=100&key=${apiKey}`

      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`)
        }
        const data = await response.json()
        console.log("DEX Data:", data) // Log the entire API response for debugging
        if (!data.data || !data.data.items || data.data.items.length === 0) {
          throw new Error("No DEX data returned from API")
        }
        setDexData(data.data.items)
      } catch (error) {
        console.error("Error fetching DEX data:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDexData()
  }, [tokenAddress, chainId])

  if (loading) return <p className="loading">Loading...</p>
  if (error) return <p className="error">Error: {error}</p>

  return (
    <div>
      <h2 className="title">Exchange Information</h2>
      {dexData && dexData.length > 0 ? (
        dexData.map((dex, index) => (
          <div key={index} className="dex-info">
            <h3 className="subtitle">{dex.dex_name}</h3>
            <p>
              <strong>Pair:</strong> {dex.exchange_ticker_symbol}
            </p>
            <p>
              <strong>Total Liquidity:</strong>{" "}
              {dex.pretty_total_liquidity_quote}
            </p>
            <p>
              <strong>24h Volume:</strong> {dex.pretty_volume_24h_quote}
            </p>
            <p>
              <strong>7d Volume:</strong> {dex.pretty_volume_7d_quote}
            </p>
            <p>
              <strong>24h Fees:</strong> {dex.pretty_fee_24h_quote}
            </p>
            <p>
              <a
                href={
                  dex.explorers && dex.explorers[0]?.url
                    ? dex.explorers[0].url
                    : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Explorer
              </a>
            </p>
          </div>
        ))
      ) : (
        <p>
          This token is not yet listed on any exchanges. Learn how to list your
          token by following our <a href="/guides">guides</a>.
        </p>
      )}
    </div>
  )
}

export default DexData
