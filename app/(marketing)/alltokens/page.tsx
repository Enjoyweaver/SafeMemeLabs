"use client"

import { useEffect, useState } from "react"
import { ExchangeABI } from "@/ABIs/SafeLaunch/Exchange"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"
import { chains, rpcUrls, safeLaunchFactory } from "@/Constants/config"
import { ethers } from "ethers"
import { useNetwork } from "wagmi"

import { Navbar } from "@/components/walletconnect/walletconnect"

import "./swap.css"
import "@/styles/allTokens.css"

const Dashboard = () => {
  const [selectedChain, setSelectedChain] = useState("all")
  const [selectedTokenType, setSelectedTokenType] = useState("all")
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { chain } = useNetwork()

  const tokenTypes = [
    { value: "all", label: "All Tokens" },
    { value: "withDex", label: "Tokens with DEX" },
    { value: "safeLaunchStarted", label: "SafeLaunch Started" },
    { value: "tokenBSet", label: "Token B Set" },
    { value: "tokenBAmountSet", label: "Token B Amount Set" },
    { value: "firstStage", label: "First Stage" },
    { value: "otherStages", label: "Stages 2-5" },
  ]

  useEffect(() => {
    fetchAllTokens()
  }, [chain, selectedChain, selectedTokenType])

  const fetchAllTokens = async () => {
    try {
      setLoading(true)
      setError(null)
      let allTokens = []

      const chainId = chain?.id.toString() || "4002" // Default to Fantom testnet if no chain selected
      const provider = new ethers.providers.JsonRpcProvider(rpcUrls[chainId])
      const factoryContract = new ethers.Contract(
        safeLaunchFactory[chainId],
        TokenFactoryABI,
        provider
      )

      const tokenCount = await factoryContract.getDeployedSafeMemeCount()
      for (let i = 0; i < tokenCount.toNumber(); i++) {
        const tokenAddress = await factoryContract.safeMemesDeployed(i)
        const tokenInfo = await getTokenInfo(tokenAddress, provider, chainId)
        allTokens.push(tokenInfo)
      }

      setTokens(allTokens)
    } catch (error) {
      console.error("Error fetching tokens:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDexInfo = async (dexAddress, provider) => {
    if (dexAddress === ethers.constants.AddressZero) return null

    const dexContract = new ethers.Contract(dexAddress, ExchangeABI, provider)

    try {
      const [currentStage, tokenBAddress, tokenBName, tokenBSymbol] =
        await Promise.all([
          dexContract.currentStage(),
          dexContract.tokenBAddress(),
          dexContract.tokenBName(),
          dexContract.tokenBSymbol(),
        ])

      const stageSet = await dexContract.stageSet(currentStage)
      const stageTokenBAmount = stageSet
        ? await dexContract.stagetokenBAmounts(currentStage)
        : ethers.BigNumber.from(0)

      return {
        currentStage: currentStage.toNumber(),
        tokenBAddress,
        tokenBName,
        tokenBSymbol,
        stageTokenBAmount: ethers.utils.formatEther(stageTokenBAmount),
        safeLaunchActivated: currentStage.gt(0),
        tokenBSet: tokenBAddress !== ethers.constants.AddressZero,
        stageAmountSet: stageSet,
      }
    } catch (error) {
      console.error("Error fetching DEX info:", error)
      return null
    }
  }

  const getTokenInfo = async (tokenAddress, provider, chainId) => {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      SafeMemeABI,
      provider
    )

    const [name, symbol, decimals, totalSupply, owner, dexAddress] =
      await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply(),
        tokenContract.owner(),
        tokenContract.dexAddress(),
      ])

    const dexInfo = await getDexInfo(dexAddress, provider)

    return {
      address: tokenAddress,
      name,
      symbol,
      decimals: decimals.toString(),
      totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
      owner,
      chainId,
      dexInfo,
    }
  }

  const filterTokens = (tokens) => {
    return tokens.filter((token) => {
      if (selectedTokenType === "all") return true
      if (selectedTokenType === "withDex" && token.dexInfo) return true
      if (
        selectedTokenType === "safeLaunchStarted" &&
        token.dexInfo?.safeLaunchActivated
      )
        return true
      if (selectedTokenType === "tokenBSet" && token.dexInfo?.tokenBSet)
        return true
      if (
        selectedTokenType === "tokenBAmountSet" &&
        token.dexInfo?.stageAmountSet
      )
        return true
      if (
        selectedTokenType === "firstStage" &&
        token.dexInfo?.currentStage === 1
      )
        return true
      if (
        selectedTokenType === "otherStages" &&
        token.dexInfo?.currentStage > 1
      )
        return true
      return false
    })
  }

  const renderTokens = () => {
    if (loading) {
      return <p className="loading">Loading tokens...</p>
    }

    if (error) {
      return <p className="error">{error}</p>
    }

    const filteredTokens = filterTokens(tokens)

    if (filteredTokens.length === 0) {
      return <p className="no-tokens">No tokens found.</p>
    }

    return (
      <div className="meme-container">
        {filteredTokens.map((token, index) => (
          <div
            key={`${token.chainId}-${token.address}-${index}`}
            className="meme"
          >
            <div className="meme-header">
              <h3>
                {token.name} ({token.symbol})
              </h3>
            </div>
            <div className="meme-details">
              <p>
                <strong>Chain:</strong>{" "}
                {chains.find((c) => c.id.toString() === token.chainId)?.name ||
                  token.chainId}
              </p>
              <p>
                <strong>Address:</strong> {token.address}
              </p>
              <p>
                <strong>Decimals:</strong> {token.decimals}
              </p>
              <p>
                <strong>Total Supply:</strong> {token.totalSupply}
              </p>
              <p>
                <strong>Owner:</strong> {token.owner}
              </p>
              {token.dexInfo && (
                <>
                  <h4>DEX Information</h4>
                  <p>
                    <strong>Current Stage:</strong> {token.dexInfo.currentStage}
                  </p>
                  <p>
                    <strong>Token B:</strong> {token.dexInfo.tokenBName} (
                    {token.dexInfo.tokenBSymbol})
                  </p>
                  <p>
                    <strong>Token B Address:</strong>{" "}
                    {token.dexInfo.tokenBAddress}
                  </p>
                  <p>
                    <strong>Stage Token B Amount:</strong>{" "}
                    {token.dexInfo.stageTokenBAmount}
                  </p>
                  <p>
                    <strong>SafeLaunch Activated:</strong>{" "}
                    {token.dexInfo.safeLaunchActivated ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Token B Set:</strong>{" "}
                    {token.dexInfo.tokenBSet ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Stage Amount Set:</strong>{" "}
                    {token.dexInfo.stageAmountSet ? "Yes" : "No"}
                  </p>
                </>
              )}
            </div>
            <button className="buy-token-button">Buy Token</button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="dashboard">
      <Navbar />
      <h1 className="pagetitle">SafeMeme Token Dashboard</h1>

      <div className="filter-section">
        <div className="blockchain-selection">
          <h2 className="filter-title">Select Blockchain</h2>
          <select
            className="blockchain-dropdown"
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
          >
            <option value="all">All Blockchains</option>
            {chains.map((chain) => (
              <option key={chain.id} value={chain.id.toString()}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>

        <div className="token-type-selection">
          <h2 className="filter-title">Token Types</h2>
          <div className="token-type-buttons">
            {tokenTypes.map((type) => (
              <button
                key={type.value}
                className={`token-type-button ${
                  selectedTokenType === type.value ? "active" : ""
                }`}
                onClick={() => setSelectedTokenType(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="token-container">{renderTokens()}</div>
    </div>
  )
}

export default Dashboard
