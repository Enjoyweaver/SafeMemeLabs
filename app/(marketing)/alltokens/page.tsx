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

interface TransactionDetails {
  safeMemeAmount: string
  tokenBAmount: string
  gasUsed: string
  swapFee: string
  ownerFee: string
  houseFee: string
  buyer: string
  txtimestamp: string
}

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
    safeMemesSoldThisStage: string
    safeMemeRemaining: string
    pastTransactions: TransactionDetails[]
  } | null
}

const AllTokens = () => {
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
    { value: "safeLaunchStarted", label: "SafeLaunch In Progress" },
    {
      value: "stageSelection",
      label: "Stages",
      subOptions: [
        { value: "stage1", label: "Stage 1" },
        { value: "stage2", label: "Stage 2" },
        { value: "stage3", label: "Stage 3" },
        { value: "stage4", label: "Stage 4" },
        { value: "stage5", label: "Stage 5" },
        { value: "dexStage", label: "DEX Stage" },
      ],
    },
    { value: "withDex", label: "SafeLaunched" },
  ]

  useEffect(() => {
    if (modalIsOpen && selectedToken) {
      calculateEstimatedOutput(swapAmount) // Recalculate the output when modal opens or token is selected
    }
  }, [modalIsOpen, selectedToken, swapAmount])

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
      let allTokens: TokenInfo[] = []

      for (const chainId of Object.keys(safeLaunchFactory)) {
        try {
          const rpcUrl = rpcUrls[chainId]

          // Check if the RPC URL is valid
          if (!rpcUrl) {
            console.error(`No RPC URL for chain ID ${chainId}`)
            continue
          }

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
            allTokens.push(tokenInfo as TokenInfo)
          }
        } catch (networkError) {
          console.error(
            `Error fetching tokens for chain ID ${chainId}:`,
            networkError
          )
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

    let dexInfo: null | {
      address: string
      safeLaunchComplete: boolean
      isInDEXMode: boolean
      currentStage: number
      safeLaunchActivated: boolean
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
      tokenBSet: boolean
      stageAmountSet: boolean
      stageStatus: number
      pastTransactions: TransactionDetails[]
    } = null

    // Check if dexAddress exists and is not the zero address
    if (dexAddress && dexAddress !== ethers.constants.AddressZero) {
      try {
        const exchangeContract = new ethers.Contract(
          dexAddress,
          ExchangeABI,
          provider
        )
        const [
          safeLaunchComplete,
          isInDEXMode,
          currentStage,
          safeLaunchActive,
          stageDetails,
        ] = await Promise.all([
          exchangeContract.safeLaunchComplete(),
          exchangeContract.isInDEXMode(),
          exchangeContract.currentStage(),
          exchangeContract.safeLaunchActive(),
          exchangeContract.getStageDetails(),
        ])

        const [
          stageStatuses,
          tokenBRequired,
          safeMemePrices,
          safeMemeRemaining,
          tokenBReceived,
          safeMemesSoldThisStage,
          soldsafeMemeThisTX,
          is_open,
          tokenBRequired_set,
          tokenBReceived_met,
          stage_completed,
        ] = stageDetails

        const currentStageIndex = currentStage.toNumber()
        const pastTransactions = await getPastTransactions(dexAddress, provider)

        dexInfo = {
          address: dexAddress,
          safeLaunchComplete,
          isInDEXMode,
          currentStage: currentStageIndex,
          safeLaunchActivated: safeLaunchActive,
          tokenBAddress: await exchangeContract.tokenBAddress(),
          tokenBName: await exchangeContract.tokenBName(),
          tokenBSymbol: await exchangeContract.tokenBSymbol(),
          stageTokenBAmount: ethers.utils.formatEther(
            tokenBRequired[currentStageIndex]
          ),
          safeMemePrices: ethers.utils.formatEther(
            safeMemePrices[currentStageIndex]
          ),
          safeMemeAvailable: ethers.utils.formatEther(
            safeMemeRemaining[currentStageIndex]
          ),
          tokenBReceived: ethers.utils.formatEther(
            tokenBReceived[currentStageIndex]
          ),
          soldsafeMeme: ethers.utils.formatEther(
            soldsafeMemeThisTX[currentStageIndex]
          ),
          safeMemesSold: ethers.utils.formatEther(
            safeMemesSoldThisStage[currentStageIndex]
          ),
          stageRemainingSafeMeme: ethers.utils.formatEther(
            safeMemeRemaining[currentStageIndex]
          ),
          tokenBSet: tokenBRequired_set[currentStageIndex],
          stageAmountSet: tokenBRequired_set[currentStageIndex],
          stageStatus: stageStatuses[currentStageIndex].toNumber(),
          pastTransactions,
        }
      } catch (error) {
        console.error(
          `Error fetching dex info for token: ${tokenAddress}`,
          error
        )
      }
    }

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
      dexInfo: dexInfo,
    }
  }

  async function getPastTransactions(
    dexContractAddress: string,
    provider: ethers.providers.Web3Provider
  ): Promise<TransactionDetails[]> {
    const dex = new ethers.Contract(dexContractAddress, ExchangeABI, provider)

    const transactions: TransactionDetails[] = []

    for (let i = 0; i < 5; i++) {
      try {
        const transaction = await dex.getPastTransactions(i)
        transactions.push({
          safeMemeAmount: ethers.utils.formatUnits(transaction[0], 18),
          tokenBAmount: ethers.utils.formatUnits(transaction[1], 18),
          gasUsed: transaction[2].toString(),
          swapFee: ethers.utils.formatUnits(transaction[3], 18),
          ownerFee: ethers.utils.formatUnits(transaction[4], 18),
          houseFee: ethers.utils.formatUnits(transaction[5], 18),
          buyer: transaction[6],
          txtimestamp: new Date(transaction[7] * 1000).toLocaleString(),
        })
      } catch (error) {
        console.error(`Error retrieving transaction at index ${i}:`, error)
        break
      }
    }

    return transactions
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

  const calculateEstimatedOutput = (tokenBAmount) => {
    if (
      !selectedToken ||
      !selectedToken.dexInfo ||
      !tokenBAmount ||
      isNaN(tokenBAmount)
    ) {
      setEstimatedOutput("0.00")
      return
    }

    try {
      // Retrieve the safeMemePrice from the selected token's dexInfo
      const safeMemePrice = ethers.utils.parseUnits(
        selectedToken.dexInfo.safeMemePrices,
        18
      )

      // Convert tokenBAmount to BigNumber with 18 decimals
      const tokenBAmountBigNumber = ethers.utils.parseUnits(tokenBAmount, 18)

      // Calculate the estimated SafeMeme amount by dividing tokenBAmount by safeMemePrice
      const estimatedSafeMeme = tokenBAmountBigNumber.mul(safeMemePrice)

      // Set the estimated output in human-readable format
      setEstimatedOutput(ethers.utils.formatUnits(estimatedSafeMeme, 18))
    } catch (error) {
      console.error("Error calculating estimated output:", error)
      setEstimatedOutput("0.00")
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
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [modalIsOpen, selectedToken, provider])

  useEffect(() => {
    if (provider) {
      const handleSafeMemePurchased = async (
        buyer,
        safeMeme,
        safeMemeAmount,
        tokenBAmount,
        stage
      ) => {
        const updatedTokenInfo = await getTokenInfo(
          safeMeme,
          provider,
          chain?.id.toString()
        )
        setTokens((prevTokens) =>
          prevTokens.map((token) =>
            token.address === safeMeme ? updatedTokenInfo : token
          )
        )
      }

      const subscribeToEvents = async () => {
        for (const token of tokens) {
          if (token.dexInfo?.address) {
            const dexContract = new ethers.Contract(
              token.dexInfo.address,
              ExchangeABI,
              provider
            )
            dexContract.on("SafeMemePurchased", handleSafeMemePurchased)
          }
        }
      }

      subscribeToEvents()

      return () => {
        // Unsubscribe from events when component unmounts
        for (const token of tokens) {
          if (token.dexInfo?.address) {
            const dexContract = new ethers.Contract(
              token.dexInfo.address,
              ExchangeABI,
              provider
            )
            dexContract.off("SafeMemePurchased", handleSafeMemePurchased)
          }
        }
      }
    }
  }, [provider, tokens, chain])

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

      const buyTokensTx = await dexContract.buyTokens(tokenBAmount, {
        gasLimit: ethers.utils.parseUnits("9000000", "wei"),
      })
      await buyTokensTx.wait()

      // Update only the selected token's information
      const updatedTokenInfo = await getTokenInfo(
        selectedToken.address,
        provider,
        selectedToken.chainId
      )

      // Update the tokens state
      setTokens((prevTokens) =>
        prevTokens.map((token) =>
          token.address === updatedTokenInfo.address ? updatedTokenInfo : token
        )
      )

      // Close the modal
      closeModal()

      // Show a success message without reloading the page
      alert("Swap successful!")
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
    const numericValue = value.replace(/,/g, "").match(/^\d*\.?\d{0,18}/)[0] // Allows up to 18 decimals for crypto amounts
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

    // Adding the additional precision formatting
    const preciseAmount = parseFloat(amount).toFixed(2)

    return preciseAmount
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
        {filteredTokens.map((token, index) => {
          console.log("Stages Section Data:", token)

          return (
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
                  {chains.find((c) => c.id.toString() === token.chainId)
                    ?.name || token.chainId}
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
                    {`${token.address.slice(0, 6)}...${token.address.slice(
                      -6
                    )}`}{" "}
                  </a>
                </p>
                <p>
                  <strong>Total Supply:</strong>{" "}
                  {formatAmount(token.totalSupply)}
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
                      <strong>{token.symbol} Sold (Cumulative):</strong>{" "}
                      {formatAmount(parseFloat(token.dexInfo.safeMemesSold))}
                    </p>
                    <p>
                      <strong>{token.symbol} Remaining:</strong>{" "}
                      {token.dexInfo
                        ? formatAmount(token.dexInfo.stageRemainingSafeMeme)
                        : "0"}
                    </p>

                    {token.dexInfo.pastTransactions &&
                    token.dexInfo.pastTransactions.length > 0 ? (
                      <>
                        <div className="meme-header">
                          <h4>Latest Transaction</h4>
                        </div>
                        <p>
                          <strong>Buyer:</strong>{" "}
                          <a
                            href={`${
                              blockExplorerAddress[token.chainId || ""]
                            }${
                              token.dexInfo.pastTransactions[
                                token.dexInfo.pastTransactions.length - 1
                              ].buyer
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {`${token.dexInfo.pastTransactions[
                              token.dexInfo.pastTransactions.length - 1
                            ].buyer.slice(
                              0,
                              6
                            )}...${token.dexInfo.pastTransactions[
                              token.dexInfo.pastTransactions.length - 1
                            ].buyer.slice(-6)}`}
                          </a>
                        </p>

                        <p>
                          <strong>SafeMeme Amount:</strong>{" "}
                          {
                            token.dexInfo.pastTransactions[
                              token.dexInfo.pastTransactions.length - 1
                            ].safeMemeAmount
                          }
                        </p>
                        <p>
                          <strong>Token B Amount:</strong>{" "}
                          {
                            token.dexInfo.pastTransactions[
                              token.dexInfo.pastTransactions.length - 1
                            ].tokenBAmount
                          }
                        </p>
                      </>
                    ) : (
                      <p>No past transactions found.</p>
                    )}
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
          )
        })}
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
              {tokenTypes.map((type) => {
                if (type.subOptions) {
                  return (
                    <select
                      key={type.value}
                      className={`token-type-button ${
                        selectedTokenType.startsWith("stage") ||
                        selectedTokenType === "dexStage"
                          ? "active"
                          : ""
                      }`}
                      value={selectedTokenType}
                      onChange={(e) => setSelectedTokenType(e.target.value)}
                    >
                      <option value="" disabled>
                        {type.label}
                      </option>
                      {type.subOptions.map((subOption) => (
                        <option key={subOption.value} value={subOption.value}>
                          {subOption.label}
                        </option>
                      ))}
                    </select>
                  )
                } else {
                  return (
                    <button
                      key={type.value}
                      className={`token-type-button ${
                        selectedTokenType === type.value ? "active" : ""
                      }`}
                      onClick={() => setSelectedTokenType(type.value)}
                    >
                      {type.label}
                    </button>
                  )
                }
              })}
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
            <div className="token-sectionFrom">
              <label htmlFor="tokenFrom">From </label>
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

            <div className="token-sectionTo">
              <label htmlFor="tokenTo">To</label>
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
                      value={Number(estimatedOutput).toFixed(6)}
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
                Current Stage:{" "}
                {selectedToken?.dexInfo?.currentStage !== undefined
                  ? selectedToken.dexInfo.currentStage + 1
                  : "N/A"}
              </p>
              <p>
                {selectedToken?.symbol || ""} Remaining:{" "}
                {selectedToken?.dexInfo &&
                selectedToken.dexInfo.stageRemainingSafeMeme
                  ? formatAmount(
                      parseFloat(selectedToken.dexInfo.stageRemainingSafeMeme)
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

export default AllTokens
