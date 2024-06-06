"use client"

import React, { useEffect, useState } from "react"
import { ethers } from "ethers"

const CurrentBTCPriceEthers: React.FC = () => {
  const [btcPrice, setBtcPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBTCPrice = async () => {
      const provider = new ethers.providers.JsonRpcProvider(
        "https://rpc.ankr.com/eth_sepolia"
      )
      const aggregatorV3InterfaceABI = [
        {
          inputs: [],
          name: "decimals",
          outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "description",
          outputs: [{ internalType: "string", name: "", type: "string" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            { internalType: "uint80", name: "_roundId", type: "uint80" },
          ],
          name: "getRoundData",
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
        {
          inputs: [],
          name: "version",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
      ]
      const addr = "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43"
      const priceFeed = new ethers.Contract(
        addr,
        aggregatorV3InterfaceABI,
        provider
      )
      const roundData = await priceFeed.latestRoundData()
      const price = parseFloat(ethers.utils.formatUnits(roundData.answer, 8)) // Chainlink price feeds usually have 8 decimals
      setBtcPrice(price)
      setLoading(false)
    }

    fetchBTCPrice()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return <div>Current BTC Price: ${btcPrice} USD</div>
}

export default CurrentBTCPriceEthers
