import React, { useEffect, useState } from "react"
import { ExchangeABI } from "@/ABIs/SafeLaunch/Exchange"
import { ExchangeFactoryABI } from "@/ABIs/SafeLaunch/ExchangeFactory"
import { exchangeFactory, rpcUrls, safeBaseToken } from "@/Constants/config"
import { ethers } from "ethers"

const SafeBasePriceComponent = ({ selectedChainId }) => {
  const [safeBasePrice, setSafeBasePrice] = useState(null)

  useEffect(() => {
    const fetchSafeBasePrice = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider(
          rpcUrls[selectedChainId]
        )
        const safeBaseAddress = safeBaseToken[selectedChainId]

        if (!safeBaseAddress) {
          console.error(
            "SafeBase token address not found for the selected chain"
          )
          return
        }

        const exchangeFactoryAddress = exchangeFactory[selectedChainId]
        const exchangeFactoryContract = new ethers.Contract(
          exchangeFactoryAddress,
          ExchangeFactoryABI,
          provider
        )

        const dexAddress = await exchangeFactoryContract.getDEX(safeBaseAddress)

        if (dexAddress === ethers.constants.AddressZero) {
          console.error("DEX not found for SafeBase token")
          return
        }

        const exchangeContract = new ethers.Contract(
          dexAddress,
          ExchangeABI,
          provider
        )

        // We'll get the price for 1 FTM worth of SafeBase
        const oneEther = ethers.utils.parseEther("1")
        const safeBaseAmount =
          await exchangeContract.gettokenBToSafeMemeInputPrice(oneEther)

        // Convert to a more readable format
        const formattedPrice = ethers.utils.formatEther(safeBaseAmount)
        setSafeBasePrice(formattedPrice)
      } catch (error) {
        console.error("Error fetching SafeBase price:", error)
      }
    }

    fetchSafeBasePrice()
  }, [selectedChainId])

  return (
    <div className="safebase-price-container">
      <h2>SafeBase Price</h2>
      {safeBasePrice ? (
        <p>{safeBasePrice} SafeBase per FTM</p>
      ) : (
        <p>Loading SafeBase price...</p>
      )}
    </div>
  )
}

export default SafeBasePriceComponent
