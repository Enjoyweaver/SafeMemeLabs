"use client"

import React, { useEffect, useState } from "react"
import { NativeTokens, priceFeedAddresses, rpcUrls } from "@/Constants/config"
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js"
import { ethers } from "ethers"
import { Line } from "react-chartjs-2"

import "@/styles/safememe.css"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const SafeMeme = () => {
  const [initialSupply, setInitialSupply] = useState(1000000)
  const [tokenBPrices, setTokenBPrices] = useState([1, 1, 1, 1, 1])
  const [stageTokenBAmounts, setStageTokenBAmounts] = useState([
    1000, 2000, 3000, 4000, 5000,
  ])
  const [chartData, setChartData] = useState({ labels: [], datasets: [] })
  const [selectedTokenB, setSelectedTokenB] = useState(
    NativeTokens["4002"][0].symbol
  )
  const [tokenPrices, setTokenPrices] = useState({})
  const [provider, setProvider] = useState(null)
  const [stage6Price, setStage6Price] = useState(0)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const web3Provider = new ethers.providers.JsonRpcProvider(rpcUrls["4002"])
      setProvider(web3Provider)
    }
  }, [])

  useEffect(() => {
    fetchTokenPrices()
  }, [])

  useEffect(() => {
    updateChart()
  }, [initialSupply, stageTokenBAmounts, tokenBPrices, selectedTokenB])

  useEffect(() => {
    if (selectedTokenB && tokenPrices["4002"]?.[selectedTokenB]) {
      const newTokenBPrices = stageTokenBAmounts.map(
        () => tokenPrices["4002"][selectedTokenB]
      )
      setTokenBPrices(newTokenBPrices)
    }
  }, [selectedTokenB, tokenPrices])

  const fetchTokenPrices = async () => {
    const allTokenPrices = {}

    const aggregatorV3InterfaceABI = [
      {
        inputs: [],
        name: "latestRoundData",
        outputs: [
          { internalType: "uint80", name: "roundId", type: "uint80" },
          { internalType: "int256", name: "answer", type: "int256" },
          { internalType: "uint256", name: "startedAt", type: "uint256" },
          { internalType: "uint256", name: "updatedAt", type: "uint256" },
          { internalType: "uint80", name: "answeredInRound", type: "uint80" },
        ],
        stateMutability: "view",
        type: "function",
      },
    ]

    for (const [chainId, tokens] of Object.entries(NativeTokens)) {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrls[chainId])
      const chainPrices = {}

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
          console.error(
            `Error fetching price for ${token.symbol} on chain ${chainId}:`,
            error
          )
          chainPrices[token.symbol] = null
        }
      }

      allTokenPrices[chainId] = chainPrices
    }

    setTokenPrices(allTokenPrices)
  }

  const updateChart = () => {
    const labels = []
    const prices = []

    stageTokenBAmounts.forEach((amount, index) => {
      labels.push(`Phase ${index + 1}`)
      prices.push((tokenBPrices[index] * amount) / ((initialSupply * 10) / 100))
    })

    // Calculate the price for the 6th stage
    const totalTokenB = getTotalTokenB()
    const unlockedSafeMemeSupply = initialSupply * 0.5
    const stage6Price = totalTokenB / unlockedSafeMemeSupply
    setStage6Price(stage6Price)

    labels.push("Phase 6")
    prices.push(stage6Price)

    setChartData({
      labels,
      datasets: [
        {
          label: "Price of SafeMeme (USD)",
          data: prices,
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
        },
      ],
    })
  }

  const handleStageTokenBAmountChange = (index, value) => {
    const newAmounts = [...stageTokenBAmounts]
    newAmounts[index] = parseInt(value) || 0
    setStageTokenBAmounts(newAmounts)
  }

  const getTotalTokenB = () => {
    return stageTokenBAmounts.reduce((acc, amount) => acc + amount, 0)
  }

  const getAllNativeTokens = () => {
    return Object.values(NativeTokens).flat()
  }

  const allNativeTokens = getAllNativeTokens()

  const handleSelectedTokenBChange = (e) => {
    setSelectedTokenB(e.target.value)
  }

  return (
    <div>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="blog-container">
            <h1 className="page-title">What is the SafeMeme Token?</h1>
            <p className="blog-content">
              Written in the Vyper programming language, the SafeMeme token is
              designed to provide a structured and secure token launch by
              including an anti-whale mechanism and progressive unlocking of
              your token supply based on specific liquidity thresholds. The
              SafeMeme smart contract is suitable for any token aiming to build
              a strong and stable liquidity pool from the start.
            </p>
            <h2 className="section-title">Tokenomics and Mechanisms</h2>
            <p className="blog-content">
              Every SafeMeme token you create is an ERC20 compatible token with
              the additional ability of creating a SafeLaunch. Upon initializing
              a SafeLaunch, 50% of the total supply is sold in 5 stages with 10%
              of the supply in each stage. In each stage, you set the amount of
              Token B required to purchase tokens in the stage. The remaining
              50% is locked until the initial 50% is sold. The purpose of this
              staged approach is to build liquidity as you build your community.
              At the end of your SafeLaunch, the remaining 50% is unlocked and
              paired with the Token B liquidity used to buy the initial 50%.
              This process provides a safe and stable launch for your token.
            </p>
            <h2 className="section-title">SafeLaunch Liquidity</h2>
            <p className="blog-content">
              A SafeLaunch is a phased rollout for your SafeMeme token. You set
              how much Token B is needed for each of the five stages. Buyers get
              SafeMeme, and as each stage fills up, it helps build liquidity and
              makes your token stronger. By the time all five stages are
              finished, your token has a nice, stable liquidity pool to launch
              your token.
            </p>
            <h2 className="section-title">Interactive Pricing Model</h2>
            <p className="blog-content">
              The charts below illustrate the pricing, liquidity, and phases for
              SafeMeme tokens. Token A is your created SafeMeme token, while
              Token B is the paired token used to purchase Token A. Adjust the
              token supply of your Token A and the amount of Token B you would
              like to receive in each phase.
            </p>
            <p className="blog-content">
              To use the charts, update the "Initial Supply" and "Token B
              Amounts" inputs to see the charts come alive. The chart shows the
              price of your SafeMeme token (Token A) in USD.
            </p>

            <div className="charts-container">
              <div className="chart-section">
                <h3 className="chart-title">Your Tokens Price</h3>
                <div style={{ width: "100%", height: "350px" }}>
                  <Line
                    data={chartData}
                    options={{ maintainAspectRatio: false }}
                  />
                </div>
                <div className="input-section input-section-main">
                  <div className="input-row-container">
                    <div className="input-rowA">
                      <label htmlFor="initialSupply">
                        Your Token Supply (Token A):
                      </label>
                      <input
                        type="number"
                        id="initialSupply"
                        value={initialSupply}
                        onChange={(e) =>
                          setInitialSupply(parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div className="input-rowB">
                      <label htmlFor="selectedTokenB">Select Token B:</label>
                      <select
                        id="selectedTokenB"
                        value={selectedTokenB}
                        onChange={handleSelectedTokenBChange}
                      >
                        {allNativeTokens.map((token) => (
                          <option key={token.address} value={token.symbol}>
                            {token.symbol}
                          </option>
                        ))}
                      </select>
                      <div>
                        {selectedTokenB && tokenPrices["4002"]?.[selectedTokenB]
                          ? `$${tokenPrices["4002"][selectedTokenB].toFixed(4)}`
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="input-section">
                  <div className="input-row-container">
                    {stageTokenBAmounts.map((amount, index) => (
                      <div key={index} className="input-row threshold-section">
                        <label htmlFor={`amount${index}`}>
                          Phase {index + 1} {selectedTokenB} Amount:
                        </label>
                        <input
                          type="number"
                          id={`amount${index}`}
                          value={amount}
                          onChange={(e) =>
                            handleStageTokenBAmountChange(index, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <div className="total-section">
                    <label htmlFor="totalAmount">
                      DEX {selectedTokenB} Amount:
                    </label>
                    <input
                      type="number"
                      id="totalAmount"
                      value={getTotalTokenB()}
                      readOnly
                    />
                    <label htmlFor="unlockedSupply">50% SafeMeme Supply:</label>
                    <input
                      type="number"
                      id="unlockedSupply"
                      value={(initialSupply * 0.5).toFixed(0)}
                      readOnly
                    />
                    <label htmlFor="launchPrice">Price at Launch (USD):</label>
                    <input
                      type="number"
                      id="launchPrice"
                      value={stage6Price.toFixed(4)}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default SafeMeme
