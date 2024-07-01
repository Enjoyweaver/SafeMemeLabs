"use client"

import { useCallback, useEffect, useState } from "react"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"
import { ethers } from "ethers"
import debounce from "lodash.debounce"
import Modal from "react-modal"
import { toast } from "react-toastify"

import "react-toastify/dist/ReactToastify.css"
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi"

import { Navbar } from "@/components/walletconnect/walletconnect"

import {
  NativeTokens,
  blockExplorerAddress,
  safeLaunchFactory,
} from "../../../Constants/config"
import "@/styles/safeLaunch.css"

export default function SafeLaunch(token): JSX.Element {
  const [isClient, setIsClient] = useState(false)
  const [deployedTokenData, setDeployedTokenData] = useState<any[]>([])
  const [fetchingError, setFetchingError] = useState<string | null>(null)
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null)
  const [tokenFactoryContract, setTokenFactoryContract] =
    useState<ethers.Contract | null>(null)
  const [tokenBSelection, setTokenBSelection] = useState<{
    [key: string]: string
  }>({})
  const [tokenBDetails, setTokenBDetails] = useState<{
    [key: string]: { name: string; symbol: string }
  }>({})
  const [tokenBAmounts, setTokenBAmounts] = useState<{
    [key: string]: number[]
  }>({})
  const [walletTokens, setWalletTokens] = useState<any[]>([])
  const [deployedTokens, setDeployedTokens] = useState<any[]>([])
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const [selectedToken, setSelectedToken] = useState<{
    tokenAddress: string
    tokenBAddress: string
  } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [amount, setAmount] = useState<string>("1")
  const [estimatedOutput, setEstimatedOutput] = useState<string>("0")
  const [tokenPrice, setTokenPrice] = useState<string>("0")
  const [currentStage, setCurrentStage] = useState<number>(0)
  const [stageInfo, setStageInfo] = useState<
    [ethers.BigNumber, ethers.BigNumber] | null
  >(null)
  const [isLoadingTokenBDetails, setIsLoadingTokenBDetails] =
    useState<boolean>(false)

  const chainId: string | number = chain ? chain.id : 250

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined" && window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(web3Provider)
      const chainId = chain ? chain.id : Object.keys(safeLaunchFactory)[0]
      const contract = new ethers.Contract(
        safeLaunchFactory[chainId] as `0x${string}`,
        TokenFactoryABI,
        web3Provider
      )
      setTokenFactoryContract(contract)
    }
  }, [chain])

  const getAllTokens = async () => {
    try {
      if (!tokenFactoryContract) return []
      const tokenCount = await tokenFactoryContract.getDeployedTokenCount({
        gasLimit: ethers.utils.hexlify(1000000),
      })
      const allTokens: string[] = []
      for (let i = 0; i < tokenCount; i++) {
        const tokenAddress: string = await tokenFactoryContract.tokensDeployed(
          i,
          {
            gasLimit: ethers.utils.hexlify(1000000),
          }
        )
        allTokens.push(tokenAddress)
      }
      return allTokens
    } catch (error) {
      console.error("Error fetching all tokens: ", error)
      return []
    }
  }

  const getUserTokens = async (userAddress: string) => {
    try {
      if (!tokenFactoryContract) return []
      const userTokens = await tokenFactoryContract.getTokensDeployedByUser(
        userAddress,
        {
          gasLimit: ethers.utils.hexlify(1000000),
        }
      )
      return userTokens
    } catch (error) {
      console.error("Error fetching user tokens: ", error)
      return []
    }
  }

  const getLockedTokens = async (tokenAddress) => {
    try {
      if (!provider) return ethers.BigNumber.from(0)
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        provider
      )
      const lockedTokens = await tokenContract.lockedTokens()
      return lockedTokens
    } catch (error) {
      console.error(`Error fetching locked tokens for ${tokenAddress}:`, error)
      return ethers.BigNumber.from(0)
    }
  }

  const getTokenDetails = async (tokenAddress) => {
    try {
      if (!provider) return null
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        provider
      )
      const [
        name,
        symbol,
        totalSupply,
        owner,
        decimals,
        antiWhalePercentage,
        saleActive,
        currentStage,
        receivedTokenB,
        lockedTokens,
      ] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.totalSupply(),
        tokenContract.owner(),
        tokenContract.decimals(),
        tokenContract.antiWhalePercentage(),
        tokenContract.getSaleStatus(),
        tokenContract.getCurrentStage(),
        tokenContract.getReceivedTokenB(),
        getLockedTokens(tokenAddress), // Fetch locked tokens
      ])
      return {
        address: tokenAddress,
        name,
        symbol,
        totalSupply,
        owner,
        decimals,
        antiWhalePercentage,
        saleActive,
        currentStage,
        lockedTokens,
        receivedTokenB,
      }
    } catch (error) {
      console.error(`Error fetching details for token ${tokenAddress}:`, error)
      return null
    }
  }

  const fetchWalletTokens = async () => {
    if (!isConnected || !address) return
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const tokenBalances = await Promise.all(
      deployedTokens.map(async (token) => {
        const contract = new ethers.Contract(
          token.address,
          SafeMemeABI,
          provider
        )
        try {
          const balance = await contract.balanceOf(address)
          return {
            ...token,
            balance: ethers.utils.formatUnits(balance, token.decimals),
          }
        } catch (error) {
          console.error(
            `Failed to fetch balance for token ${token.address}:`,
            error
          )
          return { ...token, balance: "0" }
        }
      })
    )
    setWalletTokens(
      tokenBalances.filter((token) => parseFloat(token.balance) > 0)
    )
    console.log(
      "Wallet Tokens:",
      tokenBalances.filter((token) => parseFloat(token.balance) > 0)
    )
  }

  // Fetch stage details
  const getStageDetails = async (tokenAddress) => {
    try {
      if (!provider) return []
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        provider
      )
      const stageDetails = await Promise.all(
        Array.from({ length: 5 }, (_, i) => tokenContract.getStageInfo(i))
      )
      return stageDetails
    } catch (error) {
      console.error(
        `Failed to fetch balance for token ${token.address}:`,
        error
      )

      return []
    }
  }

  const fetchTokenBDetails = async (tokenBAddress: string) => {
    try {
      setIsLoadingTokenBDetails(true)
      if (!provider) return
      const tokenBContract = new ethers.Contract(
        tokenBAddress,
        SafeMemeABI,
        provider
      )
      const [name, symbol] = await Promise.all([
        tokenBContract.name(),
        tokenBContract.symbol(),
      ])
      setTokenBDetails((prev) => ({
        ...prev,
        [tokenBAddress]: { name, symbol },
      }))
    } catch (error) {
      console.error("Error fetching Token B details:", error)
    } finally {
      setIsLoadingTokenBDetails(false)
    }
  }

  // Start SafeLaunch
  const startSafeLaunch = async (tokenAddress) => {
    try {
      if (!provider) {
        toast.error("Provider not available. Please connect your wallet.")
        return
      }

      const signer = provider.getSigner()
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        signer
      )

      // Check if the contract is in a valid state to start SafeLaunch
      const saleActive = await tokenContract.getSaleStatus()
      if (saleActive) {
        toast.error("SafeLaunch has already been started.")
        return
      }

      // Estimate gas limit
      const gasLimit = await tokenContract.estimateGas.startSafeLaunch()
      const tx = await tokenContract.startSafeLaunch({
        gasLimit: gasLimit.add(100000),
      })
      await tx.wait()

      toast.success(
        `🚀 SafeLaunch started for token ${tokenAddress}! 🚀 Get ready for the next big thing!`
      )
      fetchAllTokenData() // Refresh token data to get updated sale status
    } catch (error) {
      console.error(
        `Error starting SafeLaunch for token ${tokenAddress}:`,
        error
      )
      toast.error(`Error starting SafeLaunch: ${error.message}`)
    }
  }

  // Set Token B Details
  const setTokenBDetailsOnly = async (tokenAddress, tokenBAddress) => {
    try {
      if (!provider) {
        toast.error("Provider not available. Please connect your wallet.")
        return
      }

      const signer = provider.getSigner()
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        signer
      )

      // Check if Token B details are already set
      const currentTokenBAddress = await tokenContract.tokenBAddress()
      if (currentTokenBAddress === ethers.constants.AddressZero) {
        const tokenBName = tokenBDetails[tokenBAddress].name
        const tokenBSymbol = tokenBDetails[tokenBAddress].symbol
        const tx = await tokenContract.setTokenBDetails(
          tokenBAddress,
          tokenBName,
          tokenBSymbol
        )
        await tx.wait()
        toast.success(`Token B details set for token ${tokenAddress}`)
      } else {
        toast.info("Token B details are already set.")
      }
    } catch (error) {
      console.error(`Error setting Token B details for ${tokenAddress}:`, error)
      toast.error(`Error setting Token B details: ${error.message}`)
    }
  }

  // Set Stage Token B Amount
  const setStageTokenBAmount = async (tokenAddress, stage, amount) => {
    try {
      if (!provider) return
      const signer = provider.getSigner()
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        signer
      )
      const amountInWei = ethers.utils.parseUnits(amount.toString(), 18) // Convert to 18 decimals

      // Call the function to set the stage amount
      const gasLimit = await tokenContract.estimateGas[
        "setStageTokenBAmount(uint256,uint256)"
      ](stage, amountInWei)
      const tx = await tokenContract["setStageTokenBAmount(uint256,uint256)"](
        stage,
        amountInWei,
        {
          gasLimit: gasLimit.add(100000),
        }
      )
      await tx.wait()
      toast.success(
        `Token B amount set for stage ${stage} of token ${tokenAddress}`
      )
      fetchAllTokenData() // Refresh token data to get updated stage info
    } catch (error) {
      console.error(`Error setting Token B amount for ${tokenAddress}:`, error)
      toast.error(`Error setting Token B amount: ${error.message}`)
    }
  }

  // Modify handleSubmitTokenBAmounts to call the updated function
  const handleSubmitTokenBAmounts = (tokenAddress) => {
    const tokenBAddress = tokenBSelection[tokenAddress]
    if (tokenBAddress) {
      setTokenBDetailsOnly(tokenAddress, tokenBAddress)
    }
  }

  const handleTokenBAmountChange = (tokenAddress, stage, amount) => {
    const validAmount = Math.floor(parseFloat(amount))
    if (isNaN(validAmount) || validAmount <= 0) {
      return // Exit if the amount is invalid
    }

    setTokenBAmounts((prev) => {
      const currentAmounts = prev[tokenAddress] || []
      currentAmounts[stage] = validAmount // Store the valid amount
      return { ...prev, [tokenAddress]: currentAmounts }
    })

    debouncedSetStageTokenBAmount(tokenAddress, stage, validAmount.toString()) // Convert to string to ensure correct input format
  }

  const debouncedSetStageTokenBAmount = useCallback(
    debounce((tokenAddress, stage, amount) => {
      setStageTokenBAmount(tokenAddress, stage, amount.toString()) // Convert to string to ensure correct input format
    }, 1000),
    []
  )

  const handleTokenBSelection = (
    tokenAddress: string,
    tokenBAddress: string
  ) => {
    console.log("Setting Token B for:", tokenAddress, "to:", tokenBAddress)
    setTokenBSelection((prev) => ({ ...prev, [tokenAddress]: tokenBAddress }))
    // Fetch Token B details only
    fetchTokenBDetails(tokenBAddress)
  }

  const fetchAllTokenData = async () => {
    try {
      const allTokens = await getAllTokens()
      if (!allTokens || allTokens.length === 0) return
      const userTokens = await getUserTokens(address!)
      if (!userTokens) return
      const tokenData = await Promise.all(
        allTokens.map(async (tokenAddress) => {
          const details = await getTokenDetails(tokenAddress)
          const stages = await getStageDetails(tokenAddress)
          const tokenContract = new ethers.Contract(
            tokenAddress,
            SafeMemeABI,
            provider
          )
          const tokenBAddress = await tokenContract.tokenBAddress()
          if (tokenBAddress && tokenBAddress !== ethers.constants.AddressZero) {
            await fetchTokenBDetails(tokenBAddress)
          }
          return { ...details, stages, tokenBAddress }
        })
      )
      const userTokenAddresses = new Set(
        userTokens.map((token) => token?.toLowerCase())
      )
      const deployedTokenData = tokenData
        .filter((token) => token !== null)
        .map((token) => ({
          ...token,
          isUserToken: userTokenAddresses.has(
            token.address?.toLowerCase() || ""
          ),
        }))
      setDeployedTokenData(deployedTokenData)
      setDeployedTokens(deployedTokenData)
      console.log("Deployed Tokens:", deployedTokenData)
    } catch (error) {
      console.error("Error fetching token data: ", error)
    }
  }

  const fetchStageInfo = async (tokenAddress) => {
    if (!provider || !tokenAddress) return
    try {
      const token = findTokenByAddress(tokenAddress)
      if (!token) throw new Error("Token not found")
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        provider
      )
      const currentStage = await tokenContract.getCurrentStage()
      const stageInfo = await tokenContract.getStageInfo(currentStage)
      const tokenBAddress = await tokenContract.tokenBAddress()
      setCurrentStage(currentStage.toNumber())
      setStageInfo(stageInfo)
      setTokenPrice(ethers.utils.formatUnits(stageInfo[1], 18))
      setSelectedToken({ tokenAddress, tokenBAddress })
      await fetchTokenBDetails(tokenBAddress)
    } catch (error) {
      console.error("Error fetching stage info:", error)
      toast.error("Failed to fetch stage information")
    }
  }

  useEffect(() => {
    if (isClient && isConnected) {
      fetchAllTokenData()
    }
  }, [isClient, isConnected, chain, address, tokenFactoryContract])

  useEffect(() => {
    fetchWalletTokens()
  }, [address, deployedTokens])

  useEffect(() => {
    if (selectedToken?.tokenAddress) {
      fetchStageInfo(selectedToken.tokenAddress)
    }
  }, [selectedToken?.tokenAddress, provider])

  useEffect(() => {
    if (amount && tokenPrice) {
      const amountNumber = parseFloat(amount)
      const priceNumber = parseFloat(tokenPrice)
      if (!isNaN(amountNumber) && !isNaN(priceNumber) && priceNumber !== 0) {
        setEstimatedOutput((amountNumber / priceNumber).toFixed(6))
      } else {
        setEstimatedOutput("0")
      }
    }
  }, [amount, tokenPrice])

  const formatNumber = (number: ethers.BigNumber, decimals: number) => {
    return ethers.utils.formatUnits(number, decimals)
  }

  const displayTokenBRequired = (amount: ethers.BigNumber) => {
    return formatNumber(amount, 18)
  }

  const getBlockExplorerLink = (address: string) => {
    return `${blockExplorerAddress[chainId] || ""}${address}`
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const calculateStageProgress = (stage, totalSupply) => {
    const [tokenBRequired, tokenPrice] = stage
    const tokensForSale = totalSupply.mul(5).div(100)
    const remainingTokens = tokensForSale.sub(
      tokenBRequired.mul(tokenPrice).div(ethers.utils.parseUnits("1", 18))
    )
    return remainingTokens.mul(100).div(tokensForSale).toNumber()
  }

  const getTokensForCurrentChain = () => {
    const currentChainId = chain ? chain.id : Object.keys(safeLaunchFactory)[0]
    return NativeTokens[currentChainId] || []
  }

  const combinedTokens = [
    ...getTokensForCurrentChain(),
    ...walletTokens
      .filter((token) => parseFloat(token.balance) > 0)
      .map((token) => ({
        chainId,
        ...token,
      })),
  ]

  const openModal = (tokenAddress: string) => {
    const tokenBAddress = tokenBSelection[tokenAddress]
    setSelectedToken({ tokenAddress, tokenBAddress })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedToken(null)
    setIsModalOpen(false)
  }

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      height: "85%",
      width: "90%", // Set width to 90% for better mobile responsiveness
      maxWidth: "600px",
      padding: "0px",
      borderRadius: "8px",
      background: "#fff",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      boxSizing: "border-box",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
    },
  }

  const renderAdditionalTokenDetails = (token) => {
    return token.saleActive ? <></> : null
  }

  // Add a function to find token data by address
  const findTokenByAddress = (address) => {
    return deployedTokenData.find((token) => token.address === address) || null
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value)
  }

  const handleSwap = async () => {
    if (!amount || !selectedToken || !provider) {
      toast.error("Please enter an amount and ensure wallet is connected")
      console.error("Swap failed due to missing parameters", {
        amount,
        selectedToken,
        provider,
      })
      return
    }

    const { tokenAddress, tokenBAddress } = selectedToken

    if (!tokenAddress || !tokenBAddress) {
      toast.error("Invalid token addresses")
      console.error("Swap failed due to invalid token addresses", {
        tokenAddress,
        tokenBAddress,
      })
      return
    }

    try {
      console.log(
        `Attempting to swap with tokenAddress: ${tokenAddress} and tokenBAddress: ${tokenBAddress}`
      )
      const signer = provider.getSigner()
      const tokenBContract = new ethers.Contract(
        tokenBAddress,
        SafeMemeABI,
        signer
      )
      const safeMemeContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        signer
      )

      // Convert the amount to the correct units
      const amountInWei = ethers.utils.parseUnits(amount, 18)

      // Approve the SafeMeme contract to spend Token B
      const approveTx = await tokenBContract.approve(tokenAddress, amountInWei)
      await approveTx.wait()
      toast.info("Approval successful. Proceeding with swap...")

      // Call buyTokens on the SafeMeme contract
      const buyTx = await safeMemeContract.buyTokens(amountInWei)
      await buyTx.wait()

      toast.success("Swap successful!")
      fetchStageInfo(tokenAddress)
    } catch (error) {
      console.error("Error during swap:", error)
      toast.error(`Swap failed: ${error.message}`)
    }
  }

  const renderStageDetails = (stage, token, index) => {
    const [tokenBRequired, tokenPrice] = stage
    const tokensForSale = ethers.BigNumber.from(token.totalSupply)
      .mul(5)
      .div(100)
    const soldTokens = token.soldTokens
      ? ethers.BigNumber.from(token.soldTokens[index])
      : ethers.BigNumber.from(0)
    const remainingTokensInStage = tokensForSale.sub(soldTokens)
    const stageClosed = remainingTokensInStage.isZero()
    const tokenBAddress = token.tokenBAddress
    const tokenBDetail = tokenBDetails[tokenBAddress]

    return (
      <div className="stage" key={index}>
        <div className="stage-header">
          <h4>Stage {index + 1}</h4>
          <p>
            <strong>Token B:</strong> {tokenBDetail?.symbol || "N/A"}
          </p>
        </div>
        <div className="stage-info">
          <p>
            <strong>{token.name} Sold:</strong>{" "}
            {formatNumber(soldTokens, token.decimals)}
          </p>
          <p>
            <strong>{tokenBDetail?.symbol || "N/A"} Required:</strong>{" "}
            {displayTokenBRequired(tokenBRequired)}
          </p>
          <p>
            <strong>{tokenBDetail?.symbol || "N/A"} Received:</strong>{" "}
            {formatNumber(token.receivedTokenB, 18)}
          </p>
          <p>
            <strong>{token.name}s Available:</strong>{" "}
            {formatNumber(remainingTokensInStage, token.decimals)}
          </p>
          <p>
            <strong>Conversion Rate:</strong> {formatNumber(tokenPrice, 18)}{" "}
            Token B per {token.name}
          </p>
          {stageClosed ? (
            <p>
              <strong>Stage Closed</strong>
            </p>
          ) : (
            <div className="stage-actions">
              <label>
                <strong>Update {tokenBDetail?.symbol || "N/A"} Amount:</strong>
                <input
                  type="number"
                  value={tokenBAmounts[token.address]?.[index] || ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    if (!isNaN(value)) {
                      handleTokenBAmountChange(token.address, index, value)
                    }
                  }}
                />
              </label>
              <button
                onClick={() =>
                  setStageTokenBAmount(
                    token.address,
                    index,
                    tokenBAmounts[token.address]?.[index]
                  )
                }
              >
                Submit
              </button>

              <button
                className="buy-token-button"
                onClick={() => openModal(token.address)}
              >
                Buy {token.name}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="dashboard">
            <div className="myTokensHeading">
              <h1 className="pagetitle">SafeLaunch</h1>
            </div>
            {!isClient && <p className="myTokensError">Loading...</p>}
            {isClient && isConnected && (
              <>
                <h2 className="sectionTitle">All SafeMemes</h2>
                {deployedTokenData.length === 0 && (
                  <p className="myTokensError">No tokens available.</p>
                )}
                {deployedTokenData.length > 0 && (
                  <div className="meme-container">
                    {deployedTokenData.map((token, index) => (
                      <div
                        className={`meme ${
                          token.isUserToken ? "user-token" : ""
                        }`}
                        key={index}
                      >
                        <div className="meme-header">
                          <h3>
                            {token.name
                              ? `${token.name} (${token.symbol})`
                              : "Token"}
                          </h3>
                          {token.isUserToken && (
                            <span className="user-token-badge">Your Token</span>
                          )}
                        </div>
                        <div className="meme-details">
                          <p>
                            <strong>Contract Address:</strong>
                            <a
                              href={getBlockExplorerLink(token.address)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {shortenAddress(token.address)}
                            </a>
                          </p>
                          <p>
                            <strong>Supply:</strong>{" "}
                            {token.totalSupply
                              ? formatNumber(token.totalSupply, token.decimals)
                              : "N/A"}
                          </p>
                          <p>
                            <strong>Anti-Whale Percentage:</strong>{" "}
                            {token.antiWhalePercentage
                              ? `${token.antiWhalePercentage}%`
                              : "N/A"}
                          </p>
                          <p>
                            <strong>Max Wallet Amount:</strong>{" "}
                            {formatNumber(
                              token.totalSupply
                                .mul(token.antiWhalePercentage)
                                .div(100),
                              token.decimals
                            )}
                          </p>
                          <p>
                            <strong>Locked Tokens:</strong>{" "}
                            {formatNumber(token.lockedTokens, token.decimals)}
                          </p>
                          {!token.saleActive && (
                            <button
                              onClick={() => startSafeLaunch(token.address)}
                              className="start-launch-button"
                            >
                              Start SafeLaunch
                            </button>
                          )}
                          {token.saleActive && (
                            <>
                              <label>
                                <strong>Select Token B:</strong>
                                <select
                                  value={tokenBSelection[token.address] || ""}
                                  onChange={(e) =>
                                    handleTokenBSelection(
                                      token.address,
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">Select Token B</option>
                                  {combinedTokens.map((option, idx) => (
                                    <option key={idx} value={option.address}>
                                      {option.symbol}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              {tokenBSelection[token.address] && (
                                <p>
                                  <strong>Token B:</strong>{" "}
                                  {combinedTokens.find(
                                    (token) =>
                                      token.address ===
                                      selectedToken?.tokenBAddress
                                  )?.symbol || "Token B"}
                                </p>
                              )}

                              <button
                                onClick={() =>
                                  handleSubmitTokenBAmounts(token.address)
                                }
                              >
                                Submit Token B Info
                              </button>

                              <div className="stages-container">
                                {token.stages.map((stage, stageIndex) =>
                                  renderStageDetails(stage, token, stageIndex)
                                )}
                              </div>
                            </>
                          )}
                          {renderAdditionalTokenDetails(token)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {isClient && !isConnected && (
              <p className="myTokensError">No Account Connected</p>
            )}
          </div>
        </main>
      </div>
      {isClient && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Token Swap Modal"
          style={customStyles}
        >
          <div className="mini-swap-container">
            <div className="token-swap-inner">
              <h2 className="pagetitle">Token Swap</h2>
              <div className="swap-card">
                <div className="token-section">
                  <label htmlFor="amount" className="subheading">
                    Amount of Token B to swap
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Amount"
                    className="input-field"
                  />
                </div>
                <div className="swap-summary">
                  <p className="swap-summary-item">
                    Exchange Rate: 1{" "}
                    {findTokenByAddress(selectedToken?.tokenAddress)?.name} ={" "}
                    {tokenPrice}{" "}
                    {combinedTokens.find(
                      (token) => token.address === selectedToken?.tokenBAddress
                    )?.symbol || "Token B"}
                  </p>
                  <p className="swap-summary-item">
                    Estimated{" "}
                    {findTokenByAddress(selectedToken?.tokenAddress)?.name}{" "}
                    Output: {estimatedOutput}
                  </p>
                  <p className="swap-summary-item">
                    SafeMemes Available:{" "}
                    {selectedToken &&
                      formatNumber(
                        ethers.BigNumber.from(
                          findTokenByAddress(selectedToken.tokenAddress)
                            ?.stages[currentStage]?.[0] || 0
                        ),
                        findTokenByAddress(selectedToken.tokenAddress)
                          ?.decimals || 18
                      )}
                  </p>
                  <p className="swap-summary-item">
                    Conversion Rate: {tokenPrice} Token B per SafeMeme
                  </p>
                  <p className="swap-summary-item">
                    Current Stage: {currentStage}
                  </p>
                  <p className="swap-summary-item">
                    Token A:{" "}
                    {findTokenByAddress(selectedToken?.tokenAddress)?.name}
                  </p>
                  <p className="swap-summary-item">
                    Token B:{" "}
                    {combinedTokens.find(
                      (token) => token.address === selectedToken?.tokenBAddress
                    )?.symbol || "Token B"}
                  </p>
                </div>
                <button className="buy-token-button" onClick={handleSwap}>
                  Swap
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
