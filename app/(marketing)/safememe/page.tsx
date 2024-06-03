"use client"

import React, { useEffect, useState } from "react"
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
import { Line } from "react-chartjs-2"

import { Navbar } from "@/components/walletconnect/walletconnect"

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

const SafeMemeBlogPost = () => {
  const [initialSupply, setInitialSupply] = useState(1000000)
  const [tokenBReceived, settokenBReceived] = useState(0)
  const [tokenBPrices, settokenBPrices] = useState([1, 1, 1, 1, 1])
  const [unlockThresholds, setUnlockThresholds] = useState([
    1000, 2000, 3000, 4000, 5000,
  ])
  const [chartData, setChartData] = useState({ labels: [], datasets: [] })
  const [priceChartData, setPriceChartData] = useState({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    updateChart()
    updatePriceChart()
  }, [initialSupply, tokenBReceived, unlockThresholds, tokenBPrices])

  const updateChart = () => {
    const labels = []
    const tokenBData = []
    const tokenAData = []

    unlockThresholds.forEach((threshold, index) => {
      if (tokenBReceived >= threshold) {
        labels.push(`Phase ${index + 1}`)
        tokenBData.push(threshold)
        tokenAData.push(initialSupply * 0.05)
      }
    })

    setChartData({
      labels,
      datasets: [
        {
          label: "Token B Received",
          data: tokenBData,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
        },
        {
          label: "Token A Unlocked",
          data: tokenAData,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
        },
      ],
    })
  }

  const updatePriceChart = () => {
    const labels = []
    const prices = []

    unlockThresholds.forEach((threshold, index) => {
      if (tokenBReceived >= threshold) {
        labels.push(`Phase ${index + 1}`)
        prices.push((tokenBPrices[index] * threshold) / (initialSupply * 0.05))
      }
    })

    setPriceChartData({
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

  const handleUnlockThresholdChange = (index, value) => {
    const newThresholds = [...unlockThresholds]
    newThresholds[index] = parseInt(value)
    setUnlockThresholds(newThresholds)
  }

  const handletokenBPriceChange = (index, value) => {
    const newPrices = [...tokenBPrices]
    newPrices[index] = parseFloat(value)
    settokenBPrices(newPrices)
  }

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="blog-container">
            <h1 className="page-title">What is the SafeMeme Contract?</h1>
            <p className="blog-content">
              SafeMeme is a smart contract designed to provide a structured and
              secure token launch experience. It includes built-in anti-whale
              mechanisms and progressive unlocking of token supply based on
              specific thresholds. The SafeMeme contract is particularly
              suitable for meme tokens aiming to build a strong and stable
              liquidity pool from the start.
            </p>
            <h2 className="section-title">Tokenomics and Mechanisms</h2>
            <p className="blog-content">
              Upon creation, 5% of the total supply is released for sale and the
              remaining 95% is locked until certain levels of liquidity are
              received. As each liquidity threshold is reached, an additional 5%
              of the total supply is unlocked and made available for sale.
              However, the price of your SafeMeme is dependent on the thresholds
              you set and the price of the token you are providing liquidity
              with.
            </p>
            <h2 className="section-title">Interactive Pricing Bond Curve</h2>
            <p className="blog-content">
              The charts below illustrate the pricing bond curve and unlocking
              phases for SafeMeme tokens. Token A is the created SafeMeme token,
              while Token B is the paired token used to purchase Token A. Adjust
              the initial token supply of Token A and the amount of Token B
              received to see how the unlocking and liquidity creation process
              evolves. Each unlock phase releases 5% of the total supply.
            </p>
            <p className="blog-content">
              To use the charts, update the "Initial Supply" and "Token B
              Received" inputs to see the charts come alive. The first chart
              shows the unlocking phases based on Token B received, while the
              second chart displays the price of your SafeMeme token (Token A)
              in USD.
            </p>

            <div className="charts-container">
              <div className="chart-section">
                <h3 className="chart-title">Tokenomics</h3>
                <Line data={chartData} />
                <div className="input-section input-section-main">
                  <div className="input-row-container">
                    <div className="input-row">
                      <label htmlFor="initialSupply">Initial Supply:</label>
                      <input
                        type="number"
                        id="initialSupply"
                        value={initialSupply}
                        onChange={(e) =>
                          setInitialSupply(parseInt(e.target.value))
                        }
                      />
                    </div>
                    <div className="input-row">
                      <label htmlFor="tokenBReceived">Token B Received:</label>
                      <input
                        type="number"
                        id="tokenBReceived"
                        value={tokenBReceived}
                        onChange={(e) =>
                          setTokenBReceived(parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="input-section">
                  {unlockThresholds.map((threshold, index) => (
                    <div key={index} className="input-row threshold-section">
                      <label htmlFor={`threshold${index}`}>
                        Phase {index + 1} Unlock Threshold:
                      </label>
                      <input
                        type="number"
                        id={`threshold${index}`}
                        value={threshold}
                        onChange={(e) =>
                          handleUnlockThresholdChange(index, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-section">
                <h3 className="chart-title">Your Tokens Price</h3>
                <Line data={priceChartData} />
                <div className="input-section">
                  <div className="input-row blank-filler" />
                  {unlockThresholds.map((_, index) => (
                    <div key={index} className="input-row threshold-section">
                      <label htmlFor={`tokenBPrice${index}`}>
                        Token B Price (USD) for Phase {index + 1}:
                      </label>
                      <input
                        type="number"
                        id={`tokenBPrice${index}`}
                        value={tokenBPrices[index]}
                        onChange={(e) =>
                          handleTokenBPriceChange(index, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default SafeMemeBlogPost
