"use client"

import { useCallback, useEffect, useState } from "react"
import { fiveFactoryABI } from "@/ABIs/SafeLaunch/fiveFactory"
import { fiveTemplateABI } from "@/ABIs/SafeLaunch/fiveTemplate"
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
  fiveLaunchFactory,
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
  const [tokenSelections, setTokenSelections] = useState<{
    [key: string]: { [stage: string]: string }
  }>({})
  const [tokenDetails, setTokenDetails] = useState<{
    [key: string]: { [stage: string]: { name: string; symbol: string } }
  }>({})
  const [tokenAmounts, setTokenAmounts] = useState<{
    [key: string]: { [stage: string]: number }
  }>({})
  const [walletTokens, setWalletTokens] = useState<any[]>([])
  const [deployedTokens, setDeployedTokens] = useState<any[]>([])
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const [selectedToken, setSelectedToken] = useState<{
    tokenAddress: string
    tokenStageAddress: string
    stage: string
  } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [amount, setAmount] = useState<string>("1")
  const [estimatedOutput, setEstimatedOutput] = useState<string>("0")
  const [tokenPrice, setTokenPrice] = useState<string>("0")
  const [currentStage, setCurrentStage] = useState<number>(0)
  const [stageInfo, setStageInfo] = useState<
    [ethers.BigNumber, ethers.BigNumber] | null
  >(null)
  const [isLoadingTokenDetails, setIsLoadingTokenDetails] =
    useState<boolean>(false)

  const chainId: string | number = chain ? chain.id : 250

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined" && window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(web3Provider)
      const chainId = chain ? chain.id : Object.keys(fiveLaunchFactory)[0]
      const contract = new ethers.Contract(
        fiveLaunchFactory[chainId] as `0x${string}`,
        fiveFactoryABI,
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

  const getTokenDetails = async (tokenAddress: string) => {
    try {
      if (!provider) return null
      const tokenContract = new ethers.Contract(
        tokenAddress,
        fiveTemplateABI,
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
      ] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.totalSupply(),
        tokenContract.owner(),
        tokenContract.decimals(),
        tokenContract.antiWhalePercentage(),
        tokenContract.getSaleStatus(),
        tokenContract.getCurrentStage(),
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
      }
    } catch (error) {
      console.error(`Error fetching details for token ${tokenAddress}:`, error)
      return null
    }
  }

  const getStageDetails = async (tokenAddress: string) => {
    try {
      if (!provider) return []
      const tokenContract = new ethers.Contract(
        tokenAddress,
        fiveTemplateABI,
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

  const fetchTokenDetails = async (tokenAddress: string, stage: string) => {
    try {
      setIsLoadingTokenDetails(true)
      if (!provider) return
      const tokenContract = new ethers.Contract(
        tokenAddress,
        fiveTemplateABI,
        provider
      )
      const [name, symbol] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
      ])
      setTokenDetails((prev) => ({
        ...prev,
        [tokenAddress]: {
          ...prev[tokenAddress],
          [stage]: { name, symbol },
        },
      }))
    } catch (error) {
      console.error(`Error fetching details for Token ${stage}:`, error)
    } finally {
      setIsLoadingTokenDetails(false)
    }
  }

  const startSafeLaunch = async (tokenAddress: string) => {
    try {
      if (!provider) return
      const signer = provider.getSigner()
      const tokenContract = new ethers.Contract(
        tokenAddress,
        fiveTemplateABI,
        signer
      )
      const gasLimit = await tokenContract.estimateGas.startSafeLaunch()
      const tx = await tokenContract.startSafeLaunch({
        gasLimit: gasLimit.add(100000),
      })
      await tx.wait()
      toast.success(`SafeLaunch started for token ${tokenAddress}`)

      fetchAllTokenData() // Refresh token data to get updated sale status
    } catch (error) {
      console.error(
        `Error starting SafeLaunch for token ${tokenAddress}:`,
        error
      )
      toast.error(`Failed to start SafeLaunch for token ${tokenAddress}`)
    }
  }

  const setStageTokenAmount = async (tokenAddress, stage, amount) => {
    try {
      if (!provider) return
      const signer = provider.getSigner()
      const tokenContract = new ethers.Contract(
        tokenAddress,
        fiveTemplateABI,
        signer
      )
      const amountInWei = ethers.utils.parseUnits(amount.toString(), 18) // Convert to 18 decimals

      // Ensure Token details are set only if not already set
      const tokenStageAddress = tokenSelections[tokenAddress]?.[stage]
      if (!tokenStageAddress) {
        throw new Error(`Token ${stage} address must be provided`)
      }

      const tokenStageName =
        tokenDetails[tokenStageAddress]?.[stage]?.name || ""
      const tokenStageSymbol =
        tokenDetails[tokenStageAddress]?.[stage]?.symbol || ""

      // Check if Token details are already set
      const currentTokenStageAddress = await tokenContract[
        `token${stage}Address`
      ]()
      if (currentTokenStageAddress === ethers.constants.AddressZero) {
        const tx = await tokenContract[`setToken${stage}Details`](
          tokenStageAddress,
          tokenStageName,
          tokenStageSymbol
        )
        await tx.wait()
      }

      // Call the correct overloaded function
      const gasLimit = await tokenContract.estimateGas[
        `setStageToken${stage}Amount(uint256,uint256)`
      ](0, amountInWei)
      const tx = await tokenContract[
        `setStageToken${stage}Amount(uint256,uint256)`
      ](0, amountInWei, {
        gasLimit: gasLimit.add(100000),
      })
      await tx.wait()
      toast.success(`Token ${stage} amount set for token ${tokenStageAddress}`)
      fetchAllTokenData() // Refresh token data to get updated stage info
    } catch (error) {
      console.error(`Error setting Token ${stage} amount:`, error)
    }
  }

  const debouncedSetStageTokenAmount = useCallback(
    debounce((tokenAddress, stage, amount) => {
      setStageTokenAmount(tokenAddress, stage, amount)
    }, 1000),
    []
  )

  const handleTokenAmountChange = (tokenAddress, stage, amount) => {
    setTokenAmounts((prev) => ({
      ...prev,
      [tokenAddress]: {
        ...prev[tokenAddress],
        [stage]: amount,
      },
    }))
    debouncedSetStageTokenAmount(tokenAddress, stage, amount)
  }

  const handleTokenSelection = (
    tokenAddress: string,
    stage: string,
    tokenStageAddress: string
  ) => {
    setTokenSelections((prev) => ({
      ...prev,
      [tokenAddress]: {
        ...prev[tokenAddress],
        [stage]: tokenStageAddress,
      },
    }))
  }

  const handleSubmitTokenAmounts = (tokenAddress) => {
    if (tokenAmounts[tokenAddress]) {
      Object.entries(tokenAmounts[tokenAddress]).forEach(([stage, amount]) => {
        if (amount) {
          setStageTokenAmount(tokenAddress, stage, amount)
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

          // Fetch token addresses separately for each stage
          const tokenContract = new ethers.Contract(
            tokenAddress,
            fiveTemplateABI,
            provider
          )
          const tokenBAddress = await tokenContract.tokenBAddress()
          const tokenCAddress = await tokenContract.tokenCAddress()
          const tokenDAddress = await tokenContract.tokenDAddress()
          const tokenEAddress = await tokenContract.tokenEAddress()
          const tokenFAddress = await tokenContract.tokenFAddress()

          // Fetch Token details if set
          if (tokenBAddress && tokenBAddress !== ethers.constants.AddressZero) {
            await fetchTokenDetails(tokenBAddress, "B")
          }
          if (tokenCAddress && tokenCAddress !== ethers.constants.AddressZero) {
            await fetchTokenDetails(tokenCAddress, "C")
          }
          if (tokenDAddress && tokenDAddress !== ethers.constants.AddressZero) {
            await fetchTokenDetails(tokenDAddress, "D")
          }
          if (tokenEAddress && tokenEAddress !== ethers.constants.AddressZero) {
            await fetchTokenDetails(tokenEAddress, "E")
          }
          if (tokenFAddress && tokenFAddress !== ethers.constants.AddressZero) {
            await fetchTokenDetails(tokenFAddress, "F")
          }

          return {
            ...details,
            stages,
            tokenBAddress,
            tokenCAddress,
            tokenDAddress,
            tokenEAddress,
            tokenFAddress,
          }
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
      setDeployedTokens(deployedTokenData) // Add this line to set deployedTokens

      console.log("Deployed Tokens:", deployedTokenData)
    } catch (error) {
      console.error("Error fetching token data: ", error)
    }
  }

  const fetchWalletTokens = async () => {
    if (!isConnected || !address) return

    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const tokenBalances = await Promise.all(
      deployedTokens.map(async (token) => {
        const contract = new ethers.Contract(
          token.address,
          fiveTemplateABI,
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
          return { ...token, balance: "0" } // Handle the error case
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

  const fetchStageInfo = async (tokenAddress: string) => {
    if (!provider || !tokenAddress) return

    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        fiveTemplateABI,
        provider
      )
      const currentStage = await tokenContract.getCurrentStage()
      const stageInfo = await tokenContract.getStageInfo(currentStage)
      const tokenStageAddress = await tokenContract[
        `token${String.fromCharCode(66 + currentStage.toNumber())}Address`
      ]()

      setCurrentStage(currentStage.toNumber())
      setStageInfo(stageInfo)
      setTokenPrice(ethers.utils.formatUnits(stageInfo[1], 18))
      setSelectedToken({
        tokenAddress,
        tokenStageAddress,
        stage: String.fromCharCode(66 + currentStage.toNumber()),
      })

      // Fetch Token details and store in state
      await fetchTokenDetails(
        tokenStageAddress,
        String.fromCharCode(66 + currentStage.toNumber())
      )
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

    const { tokenAddress, tokenStageAddress, stage } = selectedToken

    if (!tokenAddress || !tokenStageAddress) {
      toast.error("Invalid token addresses")
      console.error("Swap failed due to invalid token addresses", {
        tokenAddress,
        tokenStageAddress,
      })
      return
    }

    try {
      console.log(
        `Attempting to swap with tokenAddress: ${tokenAddress} and tokenStageAddress: ${tokenStageAddress}`
      )
      const signer = provider.getSigner()
      const tokenStageContract = new ethers.Contract(
        tokenStageAddress,
        fiveTemplateABI,
        signer
      )
      const safeMemeContract = new ethers.Contract(
        tokenAddress,
        fiveTemplateABI,
        signer
      )

      // Convert the amount to the correct units
      const amountInWei = ethers.utils.parseUnits(amount, 18)

      // Approve the SafeMeme contract to spend Token Stage
      const approveTx = await tokenStageContract.approve(
        tokenAddress,
        amountInWei
      )
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

  const displayTokenRequired = (amount: ethers.BigNumber) => {
    return formatNumber(amount, 18)
  }

  const getBlockExplorerLink = (address: string) => {
    return `${blockExplorerAddress[chainId] || ""}${address}`
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const calculateStageProgress = (stage, totalSupply) => {
    const [tokenRequired, tokenPrice] = stage
    const tokensForSale = totalSupply.mul(5).div(100)
    const remainingTokens = tokensForSale.sub(
      tokenRequired.mul(tokenPrice).div(ethers.utils.parseUnits("1", 18))
    )
    return remainingTokens.mul(100).div(tokensForSale).toNumber()
  }

  const getTokensForCurrentChain = () => {
    const currentChainId = chain ? chain.id : Object.keys(fiveLaunchFactory)[0]
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
    const currentStage = deployedTokenData.find(
      (token) => token.address === tokenAddress
    )?.currentStage
    const stageChar = String.fromCharCode(66 + currentStage)
    const tokenStageAddress = tokenSelections[tokenAddress]?.[stageChar] || ""
    setSelectedToken({ tokenAddress, tokenStageAddress, stage: stageChar })
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

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="dashboard">
            {isClient && chainId && !fiveLaunchFactory[chainId] && (
              <ChangeNetwork
                changeNetworkToChainId={250}
                dappName={"SafeLaunch"}
                networks={"Fantom and Degen"}
              />
            )}
            <div className="myTokensHeading">
              <h1 className="pagetitle">SafeLaunch</h1>
              <p className="subheading">See all the tokens created!</p>
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
                    {deployedTokenData.map((token, index: number) => (
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
                            <strong>Contract Address:</strong>{" "}
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
                          <button
                            onClick={() => startSafeLaunch(token.address)}
                            className="start-launch-button"
                          >
                            Start SafeLaunch
                          </button>

                          <div className="stages-container">
                            {token.stages.map((stage, stageIndex) => (
                              <div className="stage" key={stageIndex}>
                                <h4>Stage {stageIndex + 1}</h4>

                                <label>
                                  <strong>
                                    Select Token{" "}
                                    {String.fromCharCode(66 + stageIndex)}:
                                  </strong>
                                  <select
                                    value={
                                      tokenSelections[token.address]?.[
                                        String.fromCharCode(66 + stageIndex)
                                      ] || ""
                                    }
                                    onChange={(e) =>
                                      handleTokenSelection(
                                        token.address,
                                        String.fromCharCode(66 + stageIndex),
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="">Select Token</option>
                                    {combinedTokens.map((option, idx) => (
                                      <option key={idx} value={option.address}>
                                        {option.symbol}
                                      </option>
                                    ))}
                                  </select>
                                </label>

                                <label>
                                  <strong>
                                    Token {String.fromCharCode(66 + stageIndex)}{" "}
                                    Amount:
                                  </strong>
                                  <input
                                    type="number"
                                    value={
                                      tokenAmounts[token.address]?.[
                                        String.fromCharCode(66 + stageIndex)
                                      ] || ""
                                    }
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value)
                                      if (!isNaN(value)) {
                                        handleTokenAmountChange(
                                          token.address,
                                          String.fromCharCode(66 + stageIndex),
                                          value
                                        )
                                      }
                                    }}
                                  />
                                </label>

                                {token.saleActive &&
                                stageIndex >= token.currentStage ? (
                                  <>
                                    <p className="stagetext">
                                      <strong>{token.name} Price:</strong>{" "}
                                      {ethers.utils.formatUnits(
                                        stage[1],
                                        token.decimals
                                      )}{" "}
                                    </p>
                                    <p>
                                      <strong>Tokens for Sale:</strong>{" "}
                                      {formatNumber(
                                        ethers.BigNumber.from(token.totalSupply)
                                          .mul(5)
                                          .div(100),
                                        token.decimals
                                      )}
                                    </p>
                                    <p>
                                      <strong>Token Required:</strong>{" "}
                                      {displayTokenRequired(stage[0])}
                                    </p>
                                    <p>
                                      <strong>Token:</strong>{" "}
                                      {isLoadingTokenDetails
                                        ? "Loading..."
                                        : tokenDetails[token.address]?.[
                                            String.fromCharCode(66 + stageIndex)
                                          ]?.symbol || "Token"}
                                    </p>

                                    <div className="progress-bar">
                                      <div
                                        className="progress-bar-fill"
                                        style={{
                                          width: `${
                                            100 -
                                            calculateStageProgress(
                                              stage,
                                              token.totalSupply
                                            )
                                          }%`,
                                        }}
                                      ></div>
                                    </div>

                                    <button
                                      className="buy-token-button"
                                      onClick={() => openModal(token.address)}
                                    >
                                      Buy Tokens
                                    </button>
                                  </>
                                ) : (
                                  <p>Stage not active yet</p>
                                )}
                                <button
                                  className="submit-token-amounts-button"
                                  onClick={() =>
                                    handleSubmitTokenAmounts(token.address)
                                  }
                                >
                                  Submit Token Info
                                </button>
                              </div>
                            ))}
                          </div>
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
                    Amount to swap
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
                      (token) =>
                        token.address === selectedToken?.tokenStageAddress
                    )?.symbol || "Token"}
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
                    Token:{" "}
                    {combinedTokens.find(
                      (token) =>
                        token.address === selectedToken?.tokenStageAddress
                    )?.symbol || "Token"}
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
