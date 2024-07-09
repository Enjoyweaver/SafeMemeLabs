"use client"

import React, { useEffect, useState } from "react"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"
import {
  blockExplorerAddress,
  blockExplorerToken,
  safeLaunchFactory,
} from "@/Constants/config"
import { ethers } from "ethers"

import "@/styles/safeLaunch.css"
import { Navbar } from "@/components/walletconnect/walletconnect"

interface Token {
  address: string
  name: string
  symbol: string
  antiWhalePercentage: number
  maxTokens: string
  totalSupply: string
  safeLaunchInitialized: boolean
  safeLaunchStarted: boolean
  lockedTokens?: string
  dexAddress?: string
}

const SafeLaunch: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([])
  const [userAddress, setUserAddress] = useState<string>("")
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== "undefined") {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(web3Provider)

        const network = await web3Provider.getNetwork()
        setChainId(network.chainId)

        const signer = web3Provider.getSigner()
        const address = await signer.getAddress()
        setUserAddress(address)

        await fetchTokens(web3Provider, address, network.chainId)
      }
    }
    init()
  }, [])

  const fetchTokens = async (
    provider: ethers.providers.Web3Provider,
    address: string,
    currentChainId: number
  ) => {
    if (!safeLaunchFactory[currentChainId]) {
      console.error(`No factory address for chain ID ${currentChainId}`)
      return
    }

    const factoryContract = new ethers.Contract(
      safeLaunchFactory[currentChainId],
      TokenFactoryABI,
      provider
    )

    const tokenAddresses = await factoryContract.getSafeMemesDeployedByUser(
      address
    )

    const tokenPromises = tokenAddresses.map(async (tokenAddress: string) => {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        provider
      )
      const name = await tokenContract.name()
      const symbol = await tokenContract.symbol()
      const antiWhalePercentage = await tokenContract.antiWhalePercentage()
      const totalSupply = await tokenContract.totalSupply()
      const decimals = await tokenContract.decimals()
      const maxTokens = totalSupply.mul(antiWhalePercentage).div(100)
      const dexAddress = await tokenContract.dexAddress()
      const safeLaunchInitialized = dexAddress !== ethers.constants.AddressZero
      const safeLaunchStarted =
        safeLaunchInitialized && (await tokenContract.balanceOf(dexAddress)) > 0
      const lockedTokens = safeLaunchStarted
        ? await tokenContract.balanceOf(dexAddress)
        : ethers.BigNumber.from(0)

      return {
        address: tokenAddress,
        name,
        symbol,
        antiWhalePercentage: antiWhalePercentage.toNumber(),
        maxTokens: ethers.utils.formatUnits(maxTokens, decimals),
        totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
        safeLaunchInitialized,
        safeLaunchStarted,
        lockedTokens: ethers.utils.formatUnits(lockedTokens, decimals),
        dexAddress: safeLaunchStarted ? dexAddress : undefined,
      }
    })

    const fetchedTokens = await Promise.all(tokenPromises)
    setTokens(fetchedTokens)
  }

  const initializeSafeLaunch = async (tokenAddress: string) => {
    if (!provider || !chainId) return
    const signer = provider.getSigner()
    const tokenContract = new ethers.Contract(tokenAddress, SafeMemeABI, signer)

    try {
      const tx = await tokenContract.initializeSafeLaunch()
      await tx.wait()
      await fetchTokens(provider, userAddress, chainId)
      alert("SafeLaunch initialized successfully!")
    } catch (error) {
      console.error("Error initializing SafeLaunch:", error)
      alert("Failed to initialize SafeLaunch. Please try again.")
    }
  }

  const startSafeLaunch = async (tokenAddress: string) => {
    if (!provider || !chainId) return
    const signer = provider.getSigner()
    const tokenContract = new ethers.Contract(tokenAddress, SafeMemeABI, signer)

    try {
      const tx = await tokenContract.startSafeLaunch()
      await tx.wait()
      await fetchTokens(provider, userAddress, chainId)
      alert("Congratulations! 🎉 Your SafeLaunch has started successfully!")
    } catch (error) {
      console.error("Error starting SafeLaunch:", error)
      alert("Failed to start SafeLaunch. Please try again.")
    }
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <h1 className="pagetitle">SafeLaunch Dashboard</h1>
        <div className="token-container">
          <div className="meme-container">
            {tokens.map((token) => (
              <div key={token.address} className="meme">
                <div className="meme-header">
                  <h3>
                    {token.name} ({token.symbol})
                  </h3>
                </div>
                <div className="meme-details">
                  <p>
                    <strong>Total Supply:</strong>{" "}
                    {parseFloat(token.totalSupply).toLocaleString()}{" "}
                    {token.symbol}
                  </p>
                  <p>
                    <strong>Contract:</strong>{" "}
                    <a
                      href={`${blockExplorerToken[chainId || ""]}${
                        token.address
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {" "}
                      {truncateAddress(token.address)}
                    </a>
                  </p>
                  <p>
                    <strong>Anti-Whale %:</strong> {token.antiWhalePercentage}%
                  </p>
                  <p>
                    <strong>Max Tokens/Wallet:</strong>{" "}
                    {parseFloat(token.maxTokens).toLocaleString()}{" "}
                    {token.symbol}
                  </p>
                  {!token.safeLaunchInitialized && (
                    <p>
                      <strong>Status:</strong> SafeLaunch not started yet
                    </p>
                  )}
                  {token.safeLaunchInitialized && !token.safeLaunchStarted && (
                    <p>
                      <strong>Status:</strong> SafeLaunch initialized
                    </p>
                  )}
                  {token.safeLaunchStarted && (
                    <>
                      <p>
                        <strong>Status:</strong> SafeLaunch active
                      </p>
                      <p>
                        <strong>Locked Tokens:</strong>{" "}
                        {parseFloat(token.lockedTokens || "0").toLocaleString()}{" "}
                        {token.symbol}
                      </p>
                      <p>
                        <strong>DEX Address:</strong>{" "}
                        <a
                          href={`${blockExplorerAddress[chainId || ""]}${
                            token.dexAddress
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {truncateAddress(token.dexAddress || "")}
                        </a>
                      </p>
                    </>
                  )}
                </div>
                {!token.safeLaunchInitialized && (
                  <button
                    className="buy-token-button"
                    onClick={() => initializeSafeLaunch(token.address)}
                  >
                    Initialize SafeLaunch
                  </button>
                )}
                {token.safeLaunchInitialized && !token.safeLaunchStarted && (
                  <button
                    className="buy-token-button"
                    onClick={() => startSafeLaunch(token.address)}
                  >
                    Start SafeLaunch
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default SafeLaunch
