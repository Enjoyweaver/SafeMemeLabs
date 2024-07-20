"use client"

import { useEffect, useState } from "react"
import { ExchangeABI } from "@/ABIs/SafeLaunch/Exchange"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"
import {
  blockExplorerAddress,
  blockExplorerToken,
  chains,
  rpcUrls,
  safeLaunchFactory,
} from "@/Constants/config"
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
  antiWhalePercentage: string
  maxWalletAmount: string
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
    soldsafeMeme: string
    safeMemesSold: string
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
  const [exchangeRate, setExchangeRate] = useState("0")
  const tokenTypes = [
    { value: "all", label: "All Tokens" },
    { value: "safeLaunchStarted", label: "SafeLaunch Started" },
    { value: "firstStage", label: "First Stage" },
    { value: "otherStages", label: "Stages 2-5" },
    { value: "withDex", label: "SafeLaunched" },
  ]

  useEffect(() => {
    fetchAllTokens()
  }, [selectedChain, selectedTokenType])

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

      for (const chainId of Object.keys(safeLaunchFactory)) {
        try {
          const rpcUrl = rpcUrls[chainId]
          const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

          const factoryContract = new ethers.Contract(
            safeLaunchFactory[chainId],
            TokenFactoryABI,
            provider
          )

          const tokenCount = await factoryContract.getDeployedSafeMemeCount()
          for (let i = 0; i < tokenCount.toNumber(); i++) {
            const tokenAddress = await factoryContract.safeMemesDeployed(i)
            const tokenInfo = await getTokenInfo(
              tokenAddress,
              provider,
              chainId
            )
            allTokens.push(tokenInfo)
          }
        } catch (networkError) {
          console.error(
            `Error fetching tokens for chain ID ${chainId}:`,
            networkError
          )
          // Continue with the next chain ID
        }
      }

      setTokens(allTokens)
    } catch (error) {
      console.error("Error fetching tokens:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (provider && selectedToken && selectedToken.dexInfo) {
      const dexContract = new ethers.Contract(
        selectedToken.dexInfo.address,
        ExchangeABI,
        provider
      )

      const handleSafeMemePurchased = async (
        buyer,
        safeMeme,
        safeMemeAmount,
        tokenBAmount,
        stage
      ) => {
        console.log(
          `SafeMeme purchased: ${safeMemeAmount} SafeMeme, ${tokenBAmount} TokenB`
        )
        await fetchAllTokens() // Re-fetch all tokens to update the frontend
      }

      dexContract.on("SafeMemePurchased", handleSafeMemePurchased)

      // Clean up the event listener on component unmount
      return () => {
        dexContract.off("SafeMemePurchased", handleSafeMemePurchased)
      }
    }
  }, [provider, selectedToken])

  const getDexInfo = async (dexAddress, provider) => {
    if (dexAddress === ethers.constants.AddressZero) return null

    const dexContract = new ethers.Contract(dexAddress, ExchangeABI, provider)

    try {
      const currentStageInfo = await dexContract.getCurrentStageInfo()
      console.log(
        "Raw currentStageInfo:",
        currentStageInfo.map((i) => i.toString())
      )

      const [
        currentStage,
        stageStatus,
        tokenBRequired,
        safeMemePrice,
        safeMemeAvailable,
        tokenBReceived,
        safeMemesSold,
        tokenBSet,
        safeLaunchComplete,
      ] = currentStageInfo

      const tokenBAddress = await dexContract.tokenBAddress()
      const tokenBName = await dexContract.tokenBName()
      const tokenBSymbol = await dexContract.tokenBSymbol()

      const lastTransactionAmount =
        await dexContract.getCurrentStageLastTransaction()

      return {
        address: dexAddress,
        currentStage: currentStage.toNumber(),
        tokenBAddress,
        tokenBName,
        tokenBSymbol,
        stageTokenBAmount: ethers.utils.formatEther(tokenBRequired),
        safeMemePrices: ethers.utils.formatEther(safeMemePrice),
        safeMemeAvailable: ethers.utils.formatEther(safeMemeAvailable),
        tokenBReceived: ethers.utils.formatEther(tokenBReceived),
        safeMemesSold: ethers.utils.formatEther(safeMemesSold),
        lastTransactionAmount: ethers.utils.formatEther(lastTransactionAmount),
        safeLaunchActivated: tokenBSet,
        tokenBSet,
        stageAmountSet: stageStatus.toNumber() === 2,
        safeLaunchComplete,
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

    const [
      name,
      symbol,
      decimals,
      totalSupply,
      owner,
      dexAddress,
      antiWhalePercentage,
      maxWalletAmount,
    ] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
      tokenContract.totalSupply(),
      tokenContract.owner(),
      tokenContract.dexAddress(),
      tokenContract.getAntiWhalePercentage(),
      tokenContract.getMaxWalletAmount(),
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
      antiWhalePercentage: antiWhalePercentage.toString(),
      maxWalletAmount: ethers.utils.formatUnits(maxWalletAmount, decimals),
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
    if (!isConnected) {
      alert("Please connect your wallet first.")
      return
    }

    if (chain?.id.toString() !== token.chainId) {
      alert(
        `Please switch to the ${
          chains.find((c) => c.id.toString() === token.chainId)?.name
        } network to buy this token.`
      )
      return
    }

    setSelectedToken(token)
    setModalIsOpen(true)
    setSwapAmount("1")
    calculateEstimatedOutput("1")
    setSwapError(null)
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
      setExchangeRate("0")
      return
    }

    try {
      const tokenBAmount = ethers.utils.parseEther(amount)
      const safeMemePrice = ethers.BigNumber.from(
        ethers.utils.parseUnits(selectedToken.dexInfo.safeMemePrices, 18)
      )

      const safeMemeToReceive = tokenBAmount
        .mul(safeMemePrice)
        .div(ethers.constants.WeiPerEther)

      setEstimatedOutput(
        Number(ethers.utils.formatEther(safeMemeToReceive)).toFixed(2)
      )

      const exchangeRateValue = ethers.constants.WeiPerEther.mul(
        safeMemePrice
      ).div(ethers.constants.WeiPerEther)

      setExchangeRate(
        Number(ethers.utils.formatEther(exchangeRateValue)).toFixed(2)
      )
    } catch (error) {
      console.error("Error calculating estimated output:", error)
      setEstimatedOutput("0.00")
      setExchangeRate("0")
    }
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (modalIsOpen && selectedToken && provider) {
      const updateTokenInfo = async () => {
        const updatedTokenInfo = await getTokenInfo(
          selectedToken.address,
          provider,
          selectedToken.chainId
        )
        setSelectedToken(updatedTokenInfo)
      }

      updateTokenInfo() // Update immediately
      intervalId = setInterval(updateTokenInfo, 15000) // Update every 15 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [modalIsOpen, selectedToken, provider])

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

    if (chain?.id.toString() !== selectedToken.chainId) {
      alert(
        `Please switch to the ${
          chains.find((c) => c.id.toString() === selectedToken.chainId)?.name
        } network to complete this swap.`
      )
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
        console.log("Allowance insufficient, requesting approval...")
        const approveTx = await tokenBContract.approve(
          selectedToken.dexInfo.address,
          tokenBAmount
        )
        await approveTx.wait()
      }

      const buyTokensTx = await dexContract.buyTokens(tokenBAmount)
      await buyTokensTx.wait()

      alert("Swap successful!") // Display success message

      const updatedTokenInfo = await getTokenInfo(
        selectedToken.address,
        provider,
        selectedToken.chainId
      )
      setSelectedToken(updatedTokenInfo)

      await fetchAllTokens() // Re-fetch all tokens to update the frontend
      closeModal() // Close the modal after a successful swap
    } catch (error) {
      console.error("Error during swap:", error)
      setSwapError(error.message)
    } finally {
      setIsSwapping(false)
    }
  }

  useEffect(() => {
    if (provider && selectedToken && selectedToken.dexInfo) {
      const dexContract = new ethers.Contract(
        selectedToken.dexInfo.address,
        ExchangeABI,
        provider
      )

      const handleSafeMemePurchased = async (
        buyer,
        safeMeme,
        safeMemeAmount,
        tokenBAmount,
        stage
      ) => {
        console.log(
          `SafeMeme purchased: ${safeMemeAmount} SafeMeme, ${tokenBAmount} TokenB`
        )
        await fetchAllTokens() // Re-fetch all tokens to update the frontend
      }

      dexContract.on("SafeMemePurchased", handleSafeMemePurchased)

      // Clean up the event listener on component unmount
      return () => {
        dexContract.off("SafeMemePurchased", handleSafeMemePurchased)
      }
    }
  }, [provider, selectedToken])

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

  function formatAmount(amount, isPercentage = false) {
    if (amount === null || amount === undefined) return ""

    const numAmount = Number(amount)

    if (isNaN(numAmount)) return amount

    if (isPercentage) {
      return numAmount.toFixed(2)
    }

    const formattedAmount = numAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    return formattedAmount
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
                <a
                  href={`${blockExplorerToken[token.chainId || ""]}${
                    token.address
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {`${token.address.slice(0, 6)}...${token.address.slice(-6)}`}{" "}
                </a>
              </p>
              <p>
                <strong>Total Supply:</strong> {formatAmount(token.totalSupply)}
              </p>
              <p>
                <strong>Owner:</strong>{" "}
                <a
                  href={`${blockExplorerAddress[token.chainId || ""]}${
                    token.owner
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {`${token.owner.slice(0, 6)}...${token.owner.slice(-6)}`}
                </a>
              </p>

              <p>
                <strong>Anti-Whale Percentage:</strong>{" "}
                {(token.antiWhalePercentage / 100).toFixed(2)}%
              </p>
              <p>
                <strong>Max Wallet Amount:</strong>{" "}
                {formatAmount(token.maxWalletAmount)}
              </p>
              {token.dexInfo ? (
                <>
                  <p>
                    <strong>SafeLaunch Activated:</strong>{" "}
                    {token.dexInfo.safeLaunchActivated ? "Yes" : "No"}
                  </p>
                </>
              ) : (
                <p>
                  <strong>SafeLaunch Activated:</strong> No
                </p>
              )}
              {token.dexInfo && (
                <>
                  <div className="meme-header">
                    <h4>SafeLaunch Information</h4>
                  </div>
                  <p>
                    <strong>DEX Address:</strong>{" "}
                    <a
                      href={`${blockExplorerAddress[token.chainId || ""]}${
                        token.dexInfo.address
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {`${token.dexInfo.address.slice(
                        0,
                        6
                      )}...${token.dexInfo.address.slice(-6)}`}
                    </a>
                  </p>
                  <p>
                    <strong>Current Stage:</strong>{" "}
                    {token.dexInfo.currentStage + 1}
                  </p>
                  <p>
                    <strong>Token B:</strong>{" "}
                    <a
                      href={`${blockExplorerToken[token.chainId || ""]}${
                        token.dexInfo.tokenBAddress
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {token.dexInfo.tokenBName}
                    </a>
                  </p>
                  <p>
                    <strong>Token B Address:</strong>{" "}
                    <a
                      href={`${blockExplorerToken[token.chainId || ""]}${
                        token.dexInfo.tokenBAddress
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {`${token.dexInfo.tokenBAddress.slice(
                        0,
                        6
                      )}...${token.dexInfo.tokenBAddress.slice(-6)}`}
                    </a>
                  </p>

                  <p>
                    <strong>Stage Token B Amount:</strong>{" "}
                    {token.dexInfo.stageTokenBAmount}
                  </p>
                  <p>
                    <strong>Token B Set:</strong>{" "}
                    {token.dexInfo.tokenBSet ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Stage Amount Set:</strong>{" "}
                    {token.dexInfo.stageAmountSet ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>SafeMemes Sold (Cumulative):</strong>{" "}
                    {formatAmount(token.dexInfo.safeMemesSold || "0")}
                  </p>
                  <p>
                    <strong>SafeMemes Sold (Last Transaction):</strong>{" "}
                    {formatAmount(token.dexInfo.lastTransactionAmount || "0")}
                  </p>
                  <p>
                    <strong>SafeMemes Available:</strong>{" "}
                    {formatAmount(
                      parseFloat(token.dexInfo.safeMemeAvailable || "0") -
                        parseFloat(token.dexInfo.safeMemesSold || "0")
                    )}
                  </p>
                </>
              )}
            </div>
            {token.dexInfo &&
              token.dexInfo.safeLaunchActivated &&
              token.dexInfo.stageAmountSet && (
                <button
                  className="buy-token-button"
                  onClick={() => openModal(token)}
                >
                  {isConnected && chain?.id.toString() === token.chainId
                    ? `Buy ${token.name}`
                    : `Connect to ${
                        chains.find((c) => c.id.toString() === token.chainId)
                          ?.name
                      }`}
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
      <div className="dashboard-header">
        <h1 className="pagetitle">SafeMeme Token Dashboard</h1>
        <div className="filter-section">
          <div className="filter-row">
            <div className="blockchain-selection">
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
                      value={estimatedOutput}
                      disabled
                      className="input-field-with-price"
                      inputMode="decimal"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="swap-summary">
              <p>Current Stage: {selectedToken?.dexInfo?.currentStage + 1}</p>
              <p>
                {selectedToken?.symbol || ""} Remaining:{" "}
                {selectedToken?.dexInfo
                  ? formatAmount(
                      parseFloat(selectedToken.dexInfo.safeMemeAvailable) -
                        parseFloat(selectedToken.dexInfo.soldsafeMeme)
                    )
                  : "0"}
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
