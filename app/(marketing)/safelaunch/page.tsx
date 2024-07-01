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

import { ChangeNetwork } from "@/components/changeNetwork/changeNetwork"
import { Navbar } from "@/components/walletconnect/walletconnect"

import {
  NativeTokens,
  blockExplorerAddress,
  safeLaunchFactory,
} from "../../../Constants/config"
import "@/styles/allTokens.css"

export default function SafeLaunch(): JSX.Element {
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
        `Error fetching stage details for token ${tokenAddress}:`,
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

  const startSafeLaunch = async (tokenAddress: string) => {
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

      // Debug: Log the token address and signer address
      console.log("Token Address:", tokenAddress)
      console.log("Signer Address:", await signer.getAddress())

      // Check if the contract is in a valid state to start SafeLaunch
      const saleActive = await tokenContract.getSaleStatus()
      if (saleActive) {
        toast.error("SafeLaunch has already been started.")
        return
      }

      // Estimate gas limit
      const gasLimit = await tokenContract.estimateGas.startSafeLaunch()
      console.log("Estimated Gas Limit:", gasLimit.toString())

      // Start SafeLaunch with estimated gas limit
      const tx = await tokenContract.startSafeLaunch({
        gasLimit: gasLimit.add(100000),
      })
      await tx.wait()
      toast.success(`SafeLaunch started for token ${tokenAddress}`)

      // Refresh token data to get updated sale status
      fetchAllTokenData()
    } catch (error) {
      console.error(
        `Error starting SafeLaunch for token ${tokenAddress}:`,
        error
      )

      // Detailed error handling and logging
      if (error.code === ethers.errors.UNPREDICTABLE_GAS_LIMIT) {
        toast.error(
          "Cannot estimate gas. Transaction may fail or require manual gas limit."
        )
      } else if (error.code === ethers.errors.INVALID_ARGUMENT) {
        toast.error("Invalid address or ENS name.")
      } else {
        toast.error(`Error starting SafeLaunch: ${error.message}`)
      }
    }
  }

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

      // Ensure Token B details are set only if not already set
      const tokenBAddress = tokenBSelection[tokenAddress]
      if (!tokenBAddress) {
        throw new Error("Token B address must be provided")
      }

      const tokenBName = tokenBDetails[tokenBAddress]?.name || ""
      const tokenBSymbol = tokenBDetails[tokenBAddress]?.symbol || ""

      // Check if Token B details are already set
      const currentTokenBAddress = await tokenContract.tokenBAddress()
      if (currentTokenBAddress === ethers.constants.AddressZero) {
        const tx = await tokenContract.setTokenBDetails(
          tokenBAddress,
          tokenBName,
          tokenBSymbol
        )
        await tx.wait()
      }

      // Call the correct overloaded function
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
        `Token B amount set for stage ${stage} of token ${tokenBAddress}`
      )
      fetchAllTokenData() // Refresh token data to get updated stage info
    } catch (error) {}
  }

  const debouncedSetStageTokenBAmount = useCallback(
    debounce((tokenAddress, stage, amount) => {
      setStageTokenBAmount(tokenAddress, stage, amount)
    }, 1000),
    []
  )

  const handleTokenBAmountChange = (tokenAddress, stage, amount) => {
    setTokenBAmounts((prev) => {
      const currentAmounts = prev[tokenAddress] || []
      currentAmounts[stage] = amount
      return { ...prev, [tokenAddress]: currentAmounts }
    })
    debouncedSetStageTokenBAmount(tokenAddress, stage, amount)
  }

  const handleTokenBSelection = (
    tokenAddress: string,
    tokenBAddress: string
  ) => {
    console.log("Setting Token B for:", tokenAddress, "to:", tokenBAddress)
    setTokenBSelection((prev) => ({ ...prev, [tokenAddress]: tokenBAddress }))
  }

  const handleSubmitTokenBAmounts = (tokenAddress) => {
    if (tokenBAmounts[tokenAddress]) {
      tokenBAmounts[tokenAddress].forEach((amount, stage) => {
        if (amount) {
          setStageTokenBAmount(tokenAddress, stage, amount)
        }
      })
    }
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
        userTokens.map((token: string) => token?.toLowerCase())
      )
      const deployedTokenData = tokenData
        .filter((token): token is NonNullable<typeof token> => token !== null)
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

  // Fetch wallet tokens
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

  const fetchStageInfo = async (tokenAddress) => {
    if (!provider || !tokenAddress) return
    try {
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
    return token.saleActive ? (
      <>
        <p>
          <strong>Locked Tokens:</strong>{" "}
          {formatNumber(token.lockedTokens, token.decimals)}
        </p>
        <p>
          <strong>Total Token B Received:</strong>{" "}
          {formatNumber(token.receivedTokenB, 18)}
        </p>
      </>
    ) : null
  }

  // Render stage details
  const renderStageDetails = (stage, token, index) => {
    const [tokenBRequired, tokenPrice] = stage
    const tokensForSale = ethers.BigNumber.from(token.totalSupply)
      .mul(5)
      .div(100)
    const soldTokens = token.soldTokens
      ? ethers.BigNumber.from(token.soldTokens)
      : ethers.BigNumber.from(0)
    const remainingTokensInStage = tokensForSale.sub(soldTokens)
    return (
      <div className="stage" key={index}>
        <h4>Stage {index + 1}</h4>
        <label>
          <strong>Token B Amount:</strong>
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
        {token.saleActive && index >= token.currentStage ? (
          <>
            <p className="stagetext">
              <strong>{token.name} Price:</strong>{" "}
              {ethers.utils.formatUnits(tokenPrice, token.decimals)}{" "}
            </p>
            <p>
              <strong>Tokens for Sale:</strong>{" "}
              {formatNumber(tokensForSale, token.decimals)}
            </p>
            <p>
              <strong>Token B Required:</strong>{" "}
              {displayTokenBRequired(tokenBRequired)}
            </p>
            <p>
              <strong>Token B:</strong>{" "}
              {isLoadingTokenBDetails
                ? "Loading..."
                : tokenBDetails[token.tokenBAddress]?.symbol || "Token B"}
            </p>
            <p>
              <strong>Tokens Remaining in Stage:</strong>{" "}
              {formatNumber(remainingTokensInStage, token.decimals)}
            </p>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${
                    100 - calculateStageProgress(stage, token.totalSupply)
                  }%`,
                }}
              ></div>
            </div>
            <button
              className="buy-token-button"
              onClick={() => openModal(token.address)}
            >
              Buy {token.name}
            </button>
          </>
        ) : (
          <p>Stage not active yet</p>
        )}
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
                            <strong>Max Token Allowance:</strong>{" "}
                            {formatNumber(
                              token.totalSupply
                                .mul(token.antiWhalePercentage)
                                .div(100),
                              token.decimals
                            )}
                          </p>
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
                          <button
                            onClick={() => startSafeLaunch(token.address)}
                            className="start-launch-button"
                          >
                            Start SafeLaunch
                          </button>
                          <button
                            className="submit-token-b-amounts-button"
                            onClick={() =>
                              handleSubmitTokenBAmounts(token.address)
                            }
                          >
                            Submit Token B Info
                          </button>
                          {renderAdditionalTokenDetails(token)}
                          {token.saleActive && (
                            <div className="stages-container">
                              {token.stages.map((stage, stageIndex) =>
                                renderStageDetails(stage, token, stageIndex)
                              )}
                            </div>
                          )}
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
                    {
                      deployedTokens.find(
                        (token) => token.address === selectedToken?.tokenAddress
                      )?.name
                    }{" "}
                    = {tokenPrice}{" "}
                    {combinedTokens.find(
                      (token) => token.address === selectedToken?.tokenBAddress
                    )?.symbol || "Token B"}
                  </p>
                  <p className="swap-summary-item">
                    Estimated{" "}
                    {
                      deployedTokens.find(
                        (token) => token.address === selectedToken?.tokenAddress
                      )?.name
                    }{" "}
                    Output: {estimatedOutput}
                  </p>
                  <p className="swap-summary-item">
                    Current Stage: {currentStage}
                  </p>
                  <p className="swap-summary-item">
                    Token A:{" "}
                    {
                      deployedTokens.find(
                        (token) => token.address === selectedToken?.tokenAddress
                      )?.name
                    }
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
