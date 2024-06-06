"use client"

import React, { useEffect, useState } from "react"
import Web3 from "web3"

const CurrentBTCPriceWeb3: React.FC = () => {
  const [btcPrice, setBtcPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBTCPrice = async () => {
      // Create web3 instance and set provider
      const web3 = new Web3(
        Web3.givenProvider || "https://rpc.ankr.com/eth_sepolia"
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
      const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr)
      const roundData = await priceFeed.methods.latestRoundData().call()
      const price = parseFloat(roundData.answer) / 1e8 // Chainlink price feeds usually have 8 decimals
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

export default CurrentBTCPriceWeb3
