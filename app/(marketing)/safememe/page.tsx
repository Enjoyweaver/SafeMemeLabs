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
  const [tokenBReceived, setTokenBReceived] = useState(0)
  const [tokenBPrices, setTokenBPrices] = useState([1, 1, 1, 1, 1])
  const [stageTokenBAmounts, setStageTokenBAmounts] = useState([
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
  }, [initialSupply, tokenBReceived, stageTokenBAmounts, tokenBPrices])

  const updateChart = () => {
    const labels = []
    const tokenBData = []
    const tokenAData = []

    stageTokenBAmounts.forEach((amount, index) => {
      if (tokenBReceived >= amount) {
        labels.push(`Phase ${index + 1}`)
        tokenBData.push(amount)
        tokenAData.push((initialSupply * 5) / 100)
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

    stageTokenBAmounts.forEach((amount, index) => {
      if (tokenBReceived >= amount) {
        labels.push(`Phase ${index + 1}`)
        prices.push(
          (tokenBPrices[index] * amount) / ((initialSupply * 5) / 100)
        )
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

  const handleStageTokenBAmountChange = (index, value) => {
    const newAmounts = [...stageTokenBAmounts]
    newAmounts[index] = parseInt(value)
    setStageTokenBAmounts(newAmounts)
  }

  const handleTokenBPriceChange = (index, value) => {
    const newValue = value.replace(/[^0-9\.]/g, "")
    const newPrices = [...tokenBPrices]
    newPrices[index] = parseFloat(newValue)
    setTokenBPrices(newPrices)
  }

  const handleTokenBReceivedChange = (value) => {
    setTokenBReceived(parseFloat(value))
  }

  return (
    <div>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="blog-container">
            <h1 className="page-title">What is the SafeMeme Token Standard?</h1>
            <p className="blog-content">
              The SafeMeme token standard is designed to provide a structured
              and secure token launch by including an anti-whale mechanism and
              progressive unlocking of your token supply based on specific
              liquidity thresholds. The SafeMeme smart contract is suitable for
              any token aiming to build a strong and stable liquidity pool from
              the start.
            </p>
            <h2 className="section-title">Tokenomics and Mechanisms</h2>
            <p className="blog-content">
              Upon creation, 5% of the total supply is released for sale and the
              remaining 75% is locked until certain levels of liquidity are
              received. As each liquidity threshold is reached, an additional 5%
              of the total supply is unlocked and made available for sale.
              However, the price of your SafeMeme is dependent on the thresholds
              you set and the price of the token you are providing liquidity
              with.
            </p>
            <h2 className="section-title">Interactive Pricing Bond Curve</h2>
            <p className="blog-content">
              The charts below illustrate the pricing, liquidity, and unlocking
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
                          handleTokenBReceivedChange(e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="input-section">
                  {stageTokenBAmounts.map((amount, index) => (
                    <div key={index} className="input-row threshold-section">
                      <label htmlFor={`amount${index}`}>
                        Phase {index + 1} Token B Amount:
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
              </div>

              <div className="chart-section">
                <h3 className="chart-title">Your Tokens Price</h3>
                <Line data={priceChartData} />
                <div className="input-section">
                  <div className="input-row blank-filler" />
                  {stageTokenBAmounts.map((_, index) => (
                    <div key={index} className="input-row threshold-section">
                      <label htmlFor={`tokenBPrice${index}`}>
                        Token B Price (USD) for Phase {index + 1}:
                      </label>
                      <input
                        type="text"
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
