"use client"

import React, { useEffect, useState } from "react"
import { priceFeedAddresses, rpcUrls, tokenBOptions } from "@/Constants/config"
import { ethers } from "ethers"
import { useNetwork } from "wagmi"

import { Navbar } from "@/components/walletconnect/walletconnect"

import "./swap.css"

const TokenSwap: React.FC = () => {
  const { chain } = useNetwork()
  const [tokenPrices, setTokenPrices] = useState<{
    [key: string]: { [symbol: string]: number | null }
  }>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedTokenFrom, setSelectedTokenFrom] = useState<string | null>(
    null
  )
  const [selectedTokenTo, setSelectedTokenTo] = useState<string | null>(null)
  const [amount, setAmount] = useState<number>(1)
  const [estimatedOutput, setEstimatedOutput] = useState<number>(0)

  useEffect(() => {
    const fetchTokenPrices = async () => {
      const allTokenPrices: {
        [key: string]: { [symbol: string]: number | null }
      } = {}

      const aggregatorV3InterfaceABI = [
        {
          inputs: [],
          name: "latestRoundData",
          outputs: [
            { internalType: "uint80", name: "roundId", type: "uint80" },
            { internalType: "int256", name: "answer", type: "int256" },
            { internalType: "uint256", name: "startedAt", type: "uint256" },
            { internalType: "uint256", name: "updatedAt", type: "uint256" },
            {
              internalType: "uint80",
              name: "answeredInRound",
              type: "uint80",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ]

      for (const [chainId, tokens] of Object.entries(tokenBOptions)) {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrls[chainId])
        const chainPrices: { [symbol: string]: number | null } = {}

        for (const token of tokens) {
          const priceFeedAddress =
            priceFeedAddresses[chainId]?.[`${token.symbol}/USD`]
          if (!priceFeedAddress) continue

          try {
            const priceFeed = new ethers.Contract(
              priceFeedAddress,
              aggregatorV3InterfaceABI,
              provider
            )
            const roundData = await priceFeed.latestRoundData()
            const price = parseFloat(
              ethers.utils.formatUnits(roundData.answer, 8)
            )
            chainPrices[token.symbol] = price
          } catch (error) {
            console.error(`Error fetching price for ${token.symbol}:`, error)
            chainPrices[token.symbol] = null
          }
        }

        allTokenPrices[chainId] = chainPrices
      }

      setTokenPrices(allTokenPrices)
      setLoading(false)
    }

    fetchTokenPrices()
  }, [])

  const handleTokenFromChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedTokenFrom(event.target.value)
  }

  const handleTokenToChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTokenTo(event.target.value)
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(parseFloat(event.target.value))
  }

  const handleQuickSelect = (percentage: number) => {
    // Example function, you can implement the logic to fetch the max amount user can trade
    const maxAmount = 100 // Example max amount
    setAmount((maxAmount * percentage) / 100)
  }

  const handleReverse = () => {
    const tempToken = selectedTokenFrom
    setSelectedTokenFrom(selectedTokenTo)
    setSelectedTokenTo(tempToken)
  }

  const handleSwap = () => {
    // Implement the swap functionality
    console.log("Swapping tokens")
  }

  const allTokens = Object.entries(tokenBOptions).flatMap(([chainId, tokens]) =>
    tokens.map((token) => ({ chainId, ...token }))
  )

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="swap-container">
            <h1 className="page-title">Token Swap</h1>
            <div className="swap-card">
              <div className="token-section">
                <label htmlFor="tokenFrom">From</label>
                <div className="token-amount-container">
                  <select
                    id="tokenFrom"
                    value={selectedTokenFrom ?? ""}
                    onChange={handleTokenFromChange}
                    className="input-field"
                  >
                    <option value="">Select Token</option>
                    {allTokens.map((token, index) => (
                      <option
                        key={index}
                        value={`${token.chainId}-${token.symbol}`}
                      >
                        {token.symbol} (Chain ID: {token.chainId})
                      </option>
                    ))}
                  </select>
                  <div className="amount-container">
                    <div className="quick-select-buttons">
                      <button onClick={() => handleQuickSelect(25)}>25%</button>
                      <button onClick={() => handleQuickSelect(50)}>50%</button>
                      <button onClick={() => handleQuickSelect(75)}>75%</button>
                      <button onClick={() => handleQuickSelect(100)}>
                        Max
                      </button>
                    </div>
                    <div className="amount-input-with-price">
                      <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="Amount"
                        className="input-field with-price"
                      />
                      <div className="price-info">
                        {selectedTokenFrom &&
                        tokenPrices[selectedTokenFrom.split("-")[0]]
                          ? `$${tokenPrices[selectedTokenFrom.split("-")[0]][
                              selectedTokenFrom.split("-")[1]
                            ]?.toFixed(2)}`
                          : "Select a token"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="reverse-button-container">
                <button className="reverse-button" onClick={handleReverse}>
                  &#x21C5;
                </button>
              </div>

              <div className="token-section">
                <label htmlFor="tokenTo">To</label>
                <div className="token-amount-container">
                  <select
                    id="tokenTo"
                    value={selectedTokenTo ?? ""}
                    onChange={handleTokenToChange}
                    className="input-field"
                  >
                    <option value="">Select Token</option>
                    {allTokens.map((token, index) => (
                      <option
                        key={index}
                        value={`${token.chainId}-${token.symbol}`}
                      >
                        {token.symbol} (Chain ID: {token.chainId})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    id="estimatedOutput"
                    value={estimatedOutput}
                    disabled
                    className="input-field"
                  />
                  {selectedTokenTo && (
                    <span className="price-info">
                      {tokenPrices[selectedTokenTo.split("-")[0]]
                        ? `$${tokenPrices[selectedTokenTo.split("-")[0]][
                            selectedTokenTo.split("-")[1]
                          ]?.toFixed(2)}`
                        : "Select a token"}
                    </span>
                  )}
                </div>
              </div>
              <div className="swap-summary">
                <p>Exchange Rate: {estimatedOutput / amount || 0}</p>
                <p>Estimated Output: {estimatedOutput}</p>
                <p>Slippage: 0.5%</p>
                <p>Price Impact: 0.3%</p>
              </div>
              <button className="swap-button" onClick={handleSwap}>
                Swap
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default TokenSwap
