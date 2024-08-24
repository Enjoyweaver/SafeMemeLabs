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
  const [dexPercentage, setDexPercentage] = useState(45)
  const [tokenBPrices, setTokenBPrices] = useState([1, 1, 1, 1, 1])
  const [stageTokenBAmounts, setStageTokenBAmounts] = useState([
    10000, 11000, 12000, 13000, 14000,
  ])
  const [chartData, setChartData] = useState({ labels: [], datasets: [] })
  const [selectedChainId, setSelectedChainId] = useState("250")
  const [selectedTokenB, setSelectedTokenB] = useState(
    NativeTokens[selectedChainId][0].symbol
  )
  const [tokenPrices, setTokenPrices] = useState({})
  const [provider, setProvider] = useState(null)
  const [dexPrice, setDexPrice] = useState(0)
  const [safeMemePerStage, setSafeMemePerStage] = useState(0)

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
    updateCalculations()
  }, [
    initialSupply,
    dexPercentage,
    stageTokenBAmounts,
    tokenBPrices,
    selectedTokenB,
  ])

  useEffect(() => {
    if (selectedTokenB && tokenPrices[selectedChainId]?.[selectedTokenB]) {
      const newTokenBPrices = stageTokenBAmounts.map(
        () => tokenPrices[selectedChainId][selectedTokenB]
      )
      setTokenBPrices(newTokenBPrices)
    }
  }, [selectedTokenB, selectedChainId, tokenPrices])

  useEffect(() => {
    updateStageTokenBAmounts(selectedTokenB)
  }, [selectedTokenB])

  const updateCalculations = () => {
    const dexSupply = initialSupply * (dexPercentage / 100)
    const stageSupply = initialSupply - dexSupply
    const newSafeMemePerStage = stageSupply / 5

    setSafeMemePerStage(newSafeMemePerStage)

    const labels = []
    const prices = []
    let cumulativeTokenB = 0

    stageTokenBAmounts.forEach((amount, index) => {
      labels.push(`Stage ${index + 1}`)

      const currentPriceRequired = tokenBPrices[index] * amount
      const safeMemePrice = currentPriceRequired / newSafeMemePerStage

      cumulativeTokenB += currentPriceRequired
      prices.push(safeMemePrice)
    })

    const newDexPrice = cumulativeTokenB / dexSupply
    setDexPrice(newDexPrice)

    labels.push("SafeLaunched!")
    prices.push(newDexPrice)

    setChartData({
      labels,
      datasets: [
        {
          label: "Price of your token (USD)",
          data: prices,
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
        },
      ],
    })
  }

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

  const updateStageTokenBAmounts = (token) => {
    let newAmounts
    switch (token) {
      case "BTC":
      case "rBTC":
        newAmounts = [0.1, 0.11, 0.12, 0.13, 0.14]
        break
      case "FTM":
      case "MATIC":
        newAmounts = [1000, 1100, 1200, 1300, 1400]
        break
      case "AVAX":
        newAmounts = [100, 110, 120, 130, 140]
        break
      default:
        newAmounts = [1000, 1100, 1200, 1300, 1400]
    }
    setStageTokenBAmounts(newAmounts)
  }

  const handleDexPercentageChange = (e) => {
    const newPercentage = parseFloat(e.target.value)
    if (newPercentage >= 0 && newPercentage <= 100) {
      setDexPercentage(newPercentage)
    }
  }

  const handleStageTokenBAmountChange = (index, value) => {
    const newAmounts = [...stageTokenBAmounts]
    newAmounts[index] = parseFloat(value) || 0
    setStageTokenBAmounts(newAmounts)
  }

  const getTotalTokenB = () => {
    return stageTokenBAmounts.reduce((acc, amount) => acc + amount, 0)
  }

  const getAllNativeTokens = () => {
    return Object.values(NativeTokens).flat()
  }

  const allNativeTokens = getAllNativeTokens()

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
              a SafeLaunch, the total supply is divided between the stages and
              the DEX. In each stage, you set the amount of Token B required to
              purchase tokens in the stage. The purpose of this staged approach
              is to build liquidity as you build your community. At the end of
              your SafeLaunch, the DEX portion is paired with the Token B
              liquidity used to buy the stage portions. This process provides a
              safe and stable launch for your token.
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
              token supply of your Token A, the DEX percentage, and the amount
              of Token B you would like to receive in each phase.
            </p>
            <p className="blog-content">
              To use the charts, update the Total Supply, the DEX percentage,
              the Token B on the blockchain of your choice, and the Token B
              Amounts inputs to see the charts come alive. The chart shows the
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
                        type="text"
                        id="initialSupply"
                        value={initialSupply.toLocaleString()}
                        onChange={(e) =>
                          setInitialSupply(
                            parseInt(e.target.value.replace(/,/g, "")) || 0
                          )
                        }
                      />
                    </div>
                    <div className="input-rowB">
                      <label htmlFor="dexPercentage">
                        DEX Supply Percentage:
                      </label>
                      <input
                        type="number"
                        id="dexPercentage"
                        value={dexPercentage}
                        onChange={handleDexPercentageChange}
                        min="0"
                        max="100"
                        step="1"
                      />
                    </div>
                    <div className="input-rowC">
                      <label htmlFor="selectedTokenB">
                        Select Native Token:
                      </label>
                      <select
                        id="selectedChain"
                        value={selectedChainId}
                        onChange={(e) => {
                          const chainId = e.target.value
                          setSelectedChainId(chainId)
                          setSelectedTokenB(NativeTokens[chainId][0].symbol)
                        }}
                      >
                        {Object.keys(NativeTokens).map((chainId) => (
                          <option key={chainId} value={chainId}>
                            {NativeTokens[chainId][0].symbol}{" "}
                          </option>
                        ))}
                      </select>
                      <div>
                        {selectedTokenB &&
                        tokenPrices[selectedChainId]?.[selectedTokenB]
                          ? `$${tokenPrices[selectedChainId][selectedTokenB]
                              .toFixed(4)
                              .toLocaleString()}`
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="input-section">
                  <div className="input-row-container">
                    {stageTokenBAmounts.map((amount, index) => (
                      <div key={index} className="input-row threshold-section">
                        <label
                          htmlFor={`amount${index}`}
                          className="centered-label"
                        >
                          Stage {index + 1} {selectedTokenB} Amount:
                        </label>
                        <input
                          type="number"
                          id={`amount${index}`}
                          value={amount}
                          onChange={(e) =>
                            handleStageTokenBAmountChange(index, e.target.value)
                          }
                          step={
                            selectedTokenB === "BTC" ||
                            selectedTokenB === "rBTC"
                              ? "0.01"
                              : "1"
                          }
                        />
                        <div className="safememe-amount">
                          SafeMeme:{" "}
                          {safeMemePerStage
                            .toFixed(0)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </div>
                        <div className="stage-price">
                          Price: $
                          {(
                            (amount * tokenBPrices[index]) /
                            safeMemePerStage
                          ).toFixed(6)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="total-section">
                    <div className="total-section-row">
                      <div className="total-section-item">
                        <label htmlFor="totalAmount">
                          DEX {selectedTokenB} Amount:
                        </label>
                        <input
                          type="text"
                          id="totalAmount"
                          value={getTotalTokenB().toLocaleString()}
                          readOnly
                        />
                      </div>
                      <div className="total-section-item">
                        <label htmlFor="dexSupply">DEX SafeMeme Supply:</label>
                        <input
                          type="text"
                          id="dexSupply"
                          value={(initialSupply * (dexPercentage / 100))
                            .toFixed(0)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="total-section-row">
                      <div className="total-section-item">
                        <label htmlFor="launchPrice">
                          Price at Launch (USD):
                        </label>
                        <div className="input-container">
                          <input
                            type="text"
                            id="launchPrice"
                            value={`$${dexPrice.toFixed(6)}`}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="total-section-item">
                        <label htmlFor="dexCashValue">
                          DEX Cash Value (USD):
                        </label>
                        <div className="input-container">
                          <input
                            type="text"
                            id="dexCashValue"
                            value={`$${(
                              getTotalTokenB() *
                              (selectedTokenB &&
                              tokenPrices[selectedChainId]?.[selectedTokenB]
                                ? tokenPrices[selectedChainId][selectedTokenB]
                                : 0)
                            )
                              .toFixed(2)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
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
