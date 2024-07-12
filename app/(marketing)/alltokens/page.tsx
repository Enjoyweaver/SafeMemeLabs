"use client"

import { useEffect, useState } from "react"
import { ExchangeABI } from "@/ABIs/SafeLaunch/Exchange"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"
import { chains, rpcUrls, safeLaunchFactory } from "@/Constants/config"
import { ethers } from "ethers"
import Modal from "react-modal"
import { useAccount, useConnect, useNetwork, useWalletClient } from "wagmi"

import { Navbar } from "@/components/walletconnect/walletconnect"

import "./swap.css"
import "@/styles/allTokens.css"

interface TokenInfo {
  address: string
  name: string
  symbol: string
  decimals: string
  totalSupply: string
  owner: string
  chainId: string
  dexInfo: {
    address: string
    currentStage: number
    tokenBAddress: string
    tokenBName: string
    tokenBSymbol: string
    stageTokenBAmount: string
    safeMemePrices: string
    safeMemeAvailable: string
    tokenBReceived: string
    soldSafeMeme: string
    stageRemainingSafeMeme: string
    safeLaunchActivated: boolean
    tokenBSet: boolean
    stageAmountSet: boolean
  } | null
}

const Dashboard = () => {
  const [selectedChain, setSelectedChain] = useState("all")
  const [selectedTokenType, setSelectedTokenType] = useState("all")
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null)
  const [swapAmount, setSwapAmount] = useState("1")
  const [estimatedOutput, setEstimatedOutput] = useState("0")
  const { chain } = useNetwork()
  const [isSwapping, setIsSwapping] = useState(false)
  const [swapError, setSwapError] = useState(null)
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
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

  useEffect(() => {
    const init = async () => {
      if (provider) {
        const network = await provider.getNetwork()
        setChainId(network.chainId)
        setIsConnected(true)
      } else {
        setIsConnected(false)
      }
    }
    init()
  }, [provider])

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

      const [stage, stagetokenBAmount, safeMemePrice, safeMemeRemaining] =
        await dexContract.getCurrentStage()

      const [
        tokenBReceived,
        soldSafeMeme,
        stageRemainingSafeMeme,
        currentStageFromLiquidity,
      ] = await dexContract.getStageLiquidity(stage)

      const stageSet = await dexContract.stageSet(stage)
      const tokenBSet = tokenBAddress !== ethers.constants.AddressZero
      const stageAmountSet = stageSet && !stagetokenBAmount.isZero()
      const safeLaunchActivated = tokenBSet && stageAmountSet

      return {
        address: dexAddress,
        currentStage: stage.toNumber(),
        tokenBAddress,
        tokenBName,
        tokenBSymbol,
        stageTokenBAmount: ethers.utils.formatEther(stagetokenBAmount),
        safeMemePrices: ethers.utils.formatEther(safeMemePrice),
        safeMemeAvailable: ethers.utils.formatEther(safeMemeRemaining),
        tokenBReceived: ethers.utils.formatEther(tokenBReceived),
        soldSafeMeme: ethers.utils.formatEther(soldSafeMeme),
        stageRemainingSafeMeme: ethers.utils.formatEther(
          stageRemainingSafeMeme
        ),
        safeLaunchActivated,
        tokenBSet,
        stageAmountSet,
      }
    } catch (error) {
      console.error("Error fetching DEX info:", error)
      return null
    }
  }

  useEffect(() => {
    if (walletClient) {
      const newProvider = new ethers.providers.Web3Provider(walletClient)
      setProvider(newProvider)
    }
  }, [walletClient])

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
      dexInfo: dexInfo ? { ...dexInfo, address: dexAddress } : null,
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

  const openModal = (token) => {
    setSelectedToken(token)
    setModalIsOpen(true)
    setSwapAmount("1")
    calculateEstimatedOutput("1")
  }

  const closeModal = () => {
    setModalIsOpen(false)
    setSelectedToken(null)
    setSwapAmount("1")
    setEstimatedOutput("0")
  }

  const calculateEstimatedOutput = (amount) => {
    if (!selectedToken || !selectedToken.dexInfo || !amount || isNaN(amount)) {
      setEstimatedOutput("0.00")
      return
    }

    try {
      const tokenBAmount = ethers.utils.parseEther(amount)
      const safeMemePrice = ethers.utils.parseEther(
        selectedToken.dexInfo.safeMemePrices
      )
      const safeMemeToReceive = tokenBAmount
        .mul(ethers.constants.WeiPerEther)
        .div(safeMemePrice)

      setEstimatedOutput(
        Number(ethers.utils.formatEther(safeMemeToReceive)).toFixed(2)
      )
    } catch (error) {
      console.error("Error calculating estimated output:", error)
      setEstimatedOutput("0.00")
    }
  }

  useEffect(() => {
    if (selectedToken && modalIsOpen) {
      calculateEstimatedOutput(swapAmount)
    }
  }, [selectedToken, modalIsOpen])

  const handleAmountChange = (e) => {
    const value = e.target.value
    const numericValue = value.replace(/,/g, "").match(/^\d*\.?\d{0,2}/)[0]
    setSwapAmount(numericValue)
    calculateEstimatedOutput(numericValue)
  }

  const handleSwap = async () => {
    if (
      !selectedToken ||
      !selectedToken.dexInfo ||
      !walletClient ||
      !selectedToken.dexInfo.address ||
      !provider
    ) {
      console.error("Missing required data for swap")
      return
    }

    try {
      setIsSwapping(true)
      setSwapError(null)
      const signer = provider.getSigner()

      const dexContract = new ethers.Contract(
        selectedToken.dexInfo.address,
        ExchangeABI,
        signer
      )
      const tokenBContract = new ethers.Contract(
        selectedToken.dexInfo.tokenBAddress,
        SafeMemeABI,
        signer
      )

      const tokenBAmount = ethers.utils.parseEther(swapAmount)
      const allowance = await tokenBContract.allowance(
        address,
        selectedToken.dexInfo.address
      )
      if (allowance.lt(tokenBAmount)) {
        const approveTx = await tokenBContract.approve(
          selectedToken.dexInfo.address,
          tokenBAmount
        )
        await approveTx.wait()
      }
      const buyTokensTx = await dexContract.buyTokens(tokenBAmount)
      await buyTokensTx.wait()

      console.log("Swap successful!")

      fetchAllTokens()
      closeModal()
    } catch (error) {
      console.error("Error during swap:", error)
      setSwapError(error.message)
    } finally {
      setIsSwapping(false)
    }
  }

  function formatAmount(amount) {
    if (amount === null || amount === undefined) return ""

    const numAmount = Number(amount)

    if (isNaN(numAmount)) return amount

    return numAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
                <strong>Address:</strong>{" "}
                {`${token.address.slice(0, 6)}...${token.address.slice(-6)}`}
              </p>
              <p>
                <strong>Decimals:</strong> {token.decimals}
              </p>
              <p>
                <strong>Total Supply:</strong> {token.totalSupply}
              </p>
              <p>
                <strong>Owner:</strong>{" "}
                {`${token.owner.slice(0, 6)}...${token.owner.slice(-6)}`}
              </p>
              {token.dexInfo && (
                <>
                  <div className="meme-header">
                    <h4>SafeLaunch Information</h4>
                  </div>
                  <p>
                    <strong>Current Stage:</strong> {token.dexInfo.currentStage}
                  </p>
                  <p>
                    <strong>Token B:</strong> {token.dexInfo.tokenBName}
                  </p>
                  <p>
                    <strong>Token B Address:</strong>{" "}
                    {`${token.dexInfo.tokenBAddress.slice(
                      0,
                      6
                    )}...${token.dexInfo.tokenBAddress.slice(-6)}`}
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
            {token.dexInfo &&
              token.dexInfo.safeLaunchActivated &&
              token.dexInfo.tokenBSet && (
                <button
                  className="buy-token-button"
                  onClick={() => openModal(token)}
                >
                  Buy {token.name}
                </button>
              )}
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
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Swap Modal"
        className="swap-modal"
        overlayClassName="swap-modal-overlay"
      >
        <div className="swap-container">
          <h1 className="page-title">Token Swap</h1>
          <div className="swap-card">
            <div className="token-section">
              <label htmlFor="tokenFrom">From (Token B)</label>
              <div className="token-amount-container">
                <input
                  type="text"
                  id="tokenFrom"
                  value={selectedToken?.dexInfo?.tokenBSymbol || ""}
                  disabled
                  className="input-field"
                />
                <div>
                  <div>
                    <input
                      type="text"
                      id="amount"
                      value={swapAmount}
                      onChange={handleAmountChange}
                      placeholder="Amount"
                      className="input-field-with-price"
                      inputMode="decimal"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="token-section">
              <label htmlFor="tokenTo">To (SafeMeme)</label>
              <div className="token-amount-container">
                <input
                  type="text"
                  id="tokenTo"
                  value={selectedToken?.symbol || ""}
                  disabled
                  className="input-field"
                />
                <div>
                  <div>
                    <input
                      type="text"
                      id="estimatedOutput"
                      value={formatAmount(estimatedOutput)}
                      disabled
                      className="input-field-with-price"
                      inputMode="decimal"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="swap-summary">
              <p>
                Exchange Rate: 1 {selectedToken?.dexInfo?.tokenBSymbol} ={" "}
                {formatAmount(estimatedOutput)} {selectedToken?.symbol}
              </p>
              <p>Current Stage: {selectedToken?.dexInfo?.currentStage}</p>
              <p>
                SafeMeme Remaining:{" "}
                {formatAmount(selectedToken?.dexInfo?.safeMemeAvailable)}
              </p>
            </div>
            <button
              className="swap-button"
              onClick={handleSwap}
              disabled={isSwapping}
            >
              {isSwapping ? "Swapping..." : "Swap"}
            </button>
            {swapError && <p className="error-message">{swapError}</p>}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Dashboard
