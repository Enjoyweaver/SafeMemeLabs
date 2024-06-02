"use client"

import { useEffect, useState } from "react"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import { tokenDeployerDetails } from "@/Constants/config"
import { ethers } from "ethers"
import { useAccount, useNetwork } from "wagmi"

import { Navbar } from "@/components/walletconnect/walletconnect"

import { addLiquidity, createPair, swapTokens } from "./dex"
import "./swap.css"

const Swap = () => {
  const [isClient, setIsClient] = useState(false)
  const [tokenFrom, setTokenFrom] = useState("")
  const [tokenTo, setTokenTo] = useState("")
  const [amount, setAmount] = useState("")
  const [balance, setBalance] = useState(1000) // Mock balance
  const [exchangeRate, setExchangeRate] = useState() // Mock exchange rate
  const [estimatedOutput, setEstimatedOutput] = useState()
  const [tokens, setTokens] = useState([]) // State to store fetched tokens

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const fetchTokens = async () => {
    if (chain && isConnected && address) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const factoryAddress = tokenDeployerDetails[chain.id] // Get the factory contract address based on the chain ID

        if (!factoryAddress) {
          console.error("Factory address not found for chain ID:", chain.id)
          return
        }

        console.log("Factory address:", factoryAddress)
        const factoryContract = new ethers.Contract(
          factoryAddress,
          tokenDeployerABI,
          provider.getSigner()
        )

        // Fetch tokens created by the user
        const tokensDeployedByUser =
          await factoryContract.getTokensDeployedByUser(address)
        console.log("Tokens deployed by user:", tokensDeployedByUser)
        setTokens(
          tokensDeployedByUser.filter(
            (token) => token !== ethers.constants.AddressZero
          )
        )
      } catch (error) {
        console.error("Error fetching tokens:", error)
      }
    }
  }

  useEffect(() => {
    fetchTokens()
  }, [chain, isConnected, address])

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined" &&
      chain &&
      isConnected
    ) {
      const initializeProvider = async () => {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum)
          const factoryAddress = tokenDeployerDetails[chain.id]

          if (!factoryAddress) {
            console.error("Factory address not found for chain ID:", chain.id)
            return
          }

          console.log("Factory address:", factoryAddress)
          const factoryContract = new ethers.Contract(
            factoryAddress,
            tokenDeployerABI,
            provider.getSigner()
          )

          factoryContract.on(
            "TokenDeployed",
            async (tokenAddress, symbol, name) => {
              console.log("Token deployed:", tokenAddress, symbol, name)
              await createPair(provider, tokenAddress)
              const tokenAmount = 1000
              const wFTMAmount = 1
              await addLiquidity(
                provider,
                tokenAddress,
                tokenAmount,
                wFTMAmount
              )
              fetchTokens() // Fetch tokens again to update the list
            }
          )

          return () => {
            factoryContract.removeAllListeners("TokenDeployed")
          }
        } catch (error) {
          console.error("Error initializing provider:", error)
        }
      }

      initializeProvider()
    }
  }, [chain, isConnected])

  const handleSwap = async () => {
    if (isConnected && amount > 0 && tokenFrom && tokenTo) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await swapTokens(provider, tokenFrom, tokenTo, amount)
      } catch (error) {
        console.error("Swap failed:", error)
      }
    }
  }

  useEffect(() => {
    if (amount && exchangeRate) {
      setEstimatedOutput(parseFloat(amount) * exchangeRate)
    }
  }, [amount, exchangeRate])

  const handleQuickSelect = (percentage) => {
    const calculatedAmount = (balance * percentage) / 100
    setAmount(calculatedAmount.toString())
  }

  const handleReverse = () => {
    const temp = tokenFrom
    setTokenFrom(tokenTo)
    setTokenTo(temp)
  }

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
                    value={tokenFrom}
                    onChange={(e) => setTokenFrom(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select Token</option>
                    {tokens.map((token, index) => (
                      <option key={index} value={token}>
                        {token}
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
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount"
                      className="input-field"
                    />
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
                <select
                  id="tokenTo"
                  value={tokenTo}
                  onChange={(e) => setTokenTo(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Token</option>
                  {tokens.map((token, index) => (
                    <option key={index} value={token}>
                      {token}
                    </option>
                  ))}
                </select>
              </div>
              <div className="swap-summary">
                <p>Exchange Rate: {exchangeRate}</p>
                <p>Estimated Output: {estimatedOutput}</p>
                <p>Slippage:</p>
                <p>Price Impact:</p>
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

export default Swap
