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
  const [dexPercentage, setDexPercentage] = useState(25)
  const [tokenBPrices, setTokenBPrices] = useState([1, 1, 1, 1, 1])
  const [stageTokenBAmounts, setStageTokenBAmounts] = useState([
    1000, 1300, 1690, 2190, 2850,
  ])
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Price of your token (USD)",
        data: [],
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
    ],
  })

  const [selectedChainId, setSelectedChainId] = useState("250")
  const [selectedTokenB, setSelectedTokenB] = useState(
    NativeTokens[selectedChainId][0].symbol
  )
  const [tokenPrices, setTokenPrices] = useState({})
  const [provider, setProvider] = useState(null)
  const [dexPrice, setDexPrice] = useState(0)
  const [stagePercentages, setStagePercentages] = useState([13, 14, 15, 16, 17])
  const [loadingPrices, setLoadingPrices] = useState(true)

  const getFontColor = (token) => {
    switch (token) {
      case "FTM":
        return "blue"
      case "AVAX":
        return "red"
      case "MATIC":
        return "purple"
      case "BTC":
        return "gold"
      default:
        return "black"
    }
  }

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
    updateStagePercentages()
  }, [dexPercentage])

  useEffect(() => {
    updateCalculations()
  }, [
    initialSupply,
    dexPercentage,
    tokenBPrices,
    selectedTokenB,
    stageTokenBAmounts,
    stagePercentages,
  ])

  useEffect(() => {
    if (selectedTokenB && tokenPrices[selectedChainId]?.[selectedTokenB]) {
      const newTokenBPrices = stageTokenBAmounts.map(
        () => tokenPrices[selectedChainId][selectedTokenB]
      )
      setTokenBPrices(newTokenBPrices)
    }
  }, [selectedTokenB, selectedChainId, tokenPrices])

  const updateStagePercentages = () => {
    const dexSupply = (initialSupply * dexPercentage) / 100
    const remainingSupply = initialSupply - dexSupply
    const basePercentage = (100 - dexPercentage) / 5

    const newStagePercentages = [
      basePercentage - 2, // Stage 1: -2%
      basePercentage - 1, // Stage 2: -1%
      basePercentage, // Stage 3: Base percentage
      basePercentage + 1, // Stage 4: +1%
      basePercentage + 2, // Stage 5: +2%
    ]

    setStagePercentages(newStagePercentages)
  }

  const updateCalculations = () => {
    const selectedTokenBPrice =
      tokenPrices[selectedChainId]?.[selectedTokenB] || 0

    const labels = stageTokenBAmounts.map((_, index) => `Stage ${index + 1}`)
    const prices = stageTokenBAmounts.map((amount, index) => {
      const stageSupply = (stagePercentages[index] * initialSupply) / 100
      const price = (amount * tokenBPrices[index]) / stageSupply
      return price.toFixed(6)
    })

    const totalTokenBFromStages = stageTokenBAmounts.reduce(
      (sum, amount) => sum + amount,
      0
    )
    const dexSupply = (initialSupply * dexPercentage) / 100

    const dexPrice =
      dexSupply > 0
        ? ((totalTokenBFromStages * selectedTokenBPrice) / dexSupply).toFixed(6)
        : "0.000000"

    labels.push("SafeLaunched!")
    prices.push(dexPrice)

    setDexPrice(parseFloat(dexPrice)) // Ensure dexPrice is a number for further use

    setChartData({
      labels,
      datasets: [
        {
          label: "Price of your token (USD)",
          data: prices.map((price) => parseFloat(price)), // Ensure the data passed to the chart is numeric
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
        },
      ],
    })
  }

  const fetchTokenPrices = async () => {
    const allTokenPrices = {}
    setLoadingPrices(true) // Set loading to true before fetching prices

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
    setLoadingPrices(false) // Set loading to false after prices have been fetched
  }

  const handleDexPercentageChange = (e) => {
    const newPercentage = parseFloat(e.target.value)
    if (newPercentage >= 25 && newPercentage <= 40) {
      setDexPercentage(newPercentage)
    }
  }

  const handleStageTokenBAmountChange = (index, value) => {
    const newAmounts = [...stageTokenBAmounts]
    newAmounts[index] = parseFloat(value) || 0
    setStageTokenBAmounts(newAmounts)
    updateCalculations()
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
                  {loadingPrices ? (
                    <p>Loading chart...</p> // Show this message until prices are loaded
                  ) : (
                    <Line
                      data={chartData}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          tooltip: {
                            callbacks: {
                              label: function (tooltipItem) {
                                return `${
                                  tooltipItem.dataset.label
                                }: $${parseFloat(tooltipItem.raw).toFixed(6)}`
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            ticks: {
                              callback: function (value) {
                                return `$${parseFloat(value).toFixed(6)}`
                              },
                            },
                          },
                        },
                      }}
                    />
                  )}
                </div>

                <div className="input-section ">
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
                        min="25"
                        max="40"
                        step="1"
                      />
                    </div>
                    <div className="input-rowC styled-select">
                      <label htmlFor="selectedTokenB">Select Token B:</label>
                      <select
                        id="selectedChain"
                        value={selectedChainId}
                        onChange={(e) => {
                          const chainId = e.target.value
                          setSelectedChainId(chainId)
                          setSelectedTokenB(NativeTokens[chainId][0].symbol)
                        }}
                        style={{ color: getFontColor(selectedTokenB) }}
                      >
                        {Object.keys(NativeTokens).map((chainId) => (
                          <option key={chainId} value={chainId}>
                            {NativeTokens[chainId][0].symbol}{" "}
                          </option>
                        ))}
                      </select>
                      <div
                        className="token-price-display"
                        style={{ color: getFontColor(selectedTokenB) }}
                      >
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
                      <div key={index} className="stage-container">
                        <div className="stage-info">
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
                              handleStageTokenBAmountChange(
                                index,
                                e.target.value
                              )
                            }
                            step={
                              selectedTokenB === "BTC" ||
                              selectedTokenB === "rBTC"
                                ? "0.01"
                                : "1"
                            }
                            className="stage-input"
                          />
                        </div>
                        <div className="stage-info">
                          <label className="centered-label">SafeMeme:</label>
                          <div className="safememe-amount">
                            {((stagePercentages[index] * initialSupply) / 100)
                              .toFixed(0)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          </div>
                        </div>
                        <div className="stage-info">
                          <label className="centered-label">Price:</label>
                          <div className="stage-price">
                            $
                            {(
                              (amount * tokenBPrices[index]) /
                              ((stagePercentages[index] * initialSupply) / 100)
                            ).toFixed(6)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
        </main>
      </div>
    </div>
  )
}

export default SafeMeme
