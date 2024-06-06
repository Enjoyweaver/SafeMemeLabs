"use client"

import React, { useEffect, useState } from "react"
import { ethers } from "ethers"

const EthPrice = () => {
  const [price, setPrice] = useState(null)

  useEffect(() => {
    const getEthPrice = async () => {
      try {
        // Replace with your Sepolia provider URL
        const provider = new ethers.providers.JsonRpcProvider(
          "https://eth-sepolia.g.alchemy.com/v2/demo"
        )

        // Aggregator V3 interface ABI (unchanged)
        const aggregatorV3InterfaceABI = [
          // ... (same ABI definition)
        ]

        // Address of the ETH price feed contract on Sepolia (replace if needed)
        const addr = "0x7FbCdBf8C6a056E3D5fbA2B6cDbCFa5aF7C9760E"

        // Create a contract instance
        const priceFeed = new ethers.Contract(
          addr,
          aggregatorV3InterfaceABI,
          provider
        )

        // Get latest round data and decimals
        const [roundData, decimals] = await Promise.all([
          priceFeed.latestRoundData(),
          priceFeed.decimals(),
        ])

        // Convert price to a number and format
        const formattedPrice = Number(
          roundData.answer.toString() / Math.pow(10, decimals)
        ).toFixed(2)
        setPrice(formattedPrice)
      } catch (error) {
        console.error("Error fetching ETH price:", error)
      }
    }

    getEthPrice()
  }, [])

  return (
    <div>
      <h1>Current ETH Price in USD</h1>
      <p>$ {price ? (1 * price).toFixed(2) : "Loading..."} USD</p>
    </div>
  )
}

export default EthPrice
