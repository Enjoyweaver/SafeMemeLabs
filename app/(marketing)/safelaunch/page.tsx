"use client"

import { useEffect, useState } from "react"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"
import { ethers } from "ethers"
import Modal from "react-modal"
import { toast } from "react-toastify"

import TokenSwap from "../swap/page"
import "react-toastify/dist/ReactToastify.css"
import {
  useAccount,
  useContractRead,
  useContractReads,
  useNetwork,
} from "wagmi"

import { ChangeNetwork } from "@/components/changeNetwork/changeNetwork"
import { Navbar } from "@/components/walletconnect/walletconnect"

import {
  blockExplorerAddress,
  safeLaunchFactory,
  tokenBOptions,
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
  const [tokenBAmounts, setTokenBAmounts] = useState<{
    [key: string]: number[]
  }>({})
  const [walletTokens, setWalletTokens] = useState<any[]>([]) // State to store wallet tokens
  const [deployedTokens, setDeployedTokens] = useState<any[]>([]) // Define deployedTokens state
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<string | null>(null)

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

  const getTokenDetails = async (tokenAddress: string) => {
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

  const startSafeLaunch = async (tokenAddress: string) => {
    try {
      if (!provider) return
      const signer = provider.getSigner()
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
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
      toast.error(
        `Error starting SafeLaunch for token ${tokenAddress}: ${error.message}`
      )
    }
  }

  const setStageTokenBAmount = async (
    tokenAddress: string,
    stage: number,
    amount: number
  ) => {
    try {
      if (!provider) return
      const signer = provider.getSigner()
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        signer
      )
      const amountInWei = BigInt(amount) * BigInt(10 ** 18) // Convert to 18 decimals
      const gasLimit = await tokenContract.estimateGas.setStageTokenBAmount(
        stage,
        amountInWei
      )
      const tx = await tokenContract.setStageTokenBAmount(stage, amountInWei, {
        gasLimit: gasLimit.add(100000),
      })
      await tx.wait()
      toast.success(
        `Token B amount set for stage ${stage} of token ${tokenAddress}`
      )
      fetchAllTokenData() // Refresh token data to get updated stage info
    } catch (error) {
      console.error(
        `Error setting Token B amount for token ${tokenAddress}:`,
        error
      )
      toast.error(
        `Error setting Token B amount for token ${tokenAddress}: ${error.message}`
      )
    }
  }

  const handleTokenBAmountChange = (
    tokenAddress: string,
    stage: number,
    amount: number
  ) => {
    setTokenBAmounts((prev) => {
      const currentAmounts = prev[tokenAddress] || []
      currentAmounts[stage] = amount
      setStageTokenBAmount(tokenAddress, stage, amount)
      return { ...prev, [tokenAddress]: currentAmounts }
    })
  }

  const handleTokenBSelection = (
    tokenAddress: string,
    tokenBAddress: string
  ) => {
    setTokenBSelection((prev) => ({ ...prev, [tokenAddress]: tokenBAddress }))
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
          return { ...details, stages }
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
          return { ...token, balance: "0" } // Handle the error case
        }
      })
    )

    setWalletTokens(
      tokenBalances.filter((token) => parseFloat(token.balance) > 0)
    )
  }

  useEffect(() => {
    if (isClient && isConnected) {
      fetchAllTokenData()
    }
  }, [isClient, isConnected, chain, address, tokenFactoryContract])

  useEffect(() => {
    fetchWalletTokens()
  }, [address, deployedTokens])

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
    return tokenBOptions[currentChainId] || []
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
    setSelectedToken(tokenAddress)
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
            {isClient && chainId && !safeLaunchFactory[chainId] && (
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

                          <div className="stages-container">
                            {Array.isArray(token.stages) &&
                            token.stages.length > 0 ? (
                              token.stages.map((stage, stageIndex) => (
                                <div className="stage" key={stageIndex}>
                                  <h4>Stage {stageIndex + 1}</h4>
                                  <label>
                                    <strong>Token B Amount:</strong>
                                    <input
                                      type="number"
                                      value={
                                        tokenBAmounts[token.address]?.[
                                          stageIndex
                                        ] || ""
                                      }
                                      onChange={(e) =>
                                        handleTokenBAmountChange(
                                          token.address,
                                          stageIndex,
                                          parseFloat(e.target.value)
                                        )
                                      }
                                    />
                                  </label>
                                  {token.saleActive &&
                                  stageIndex >= token.currentStage ? (
                                    <>
                                      <p>
                                        <strong className="stagetext">
                                          Price:
                                        </strong>{" "}
                                        {ethers.utils.formatUnits(
                                          stage[1],
                                          token.decimals
                                        )}{" "}
                                        Token B
                                      </p>
                                      <p>
                                        <strong>Tokens for Sale:</strong>{" "}
                                        {formatNumber(
                                          ethers.BigNumber.from(
                                            token.totalSupply
                                          )
                                            .mul(5)
                                            .div(100),
                                          token.decimals
                                        )}
                                      </p>
                                      <p>
                                        <strong>Token B Required:</strong>{" "}
                                        {displayTokenBRequired(stage[0])}
                                      </p>
                                      <div className="progress-bar">
                                        <div
                                          className="progress-bar-fill"
                                          style={{
                                            width: `${calculateStageProgress(
                                              stage,
                                              token.totalSupply
                                            )}%`,
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
                                </div>
                              ))
                            ) : (
                              <p>No stage information available</p>
                            )}
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
          <div className="token-swap-container">
            <div className="token-swap-inner">
              <TokenSwap tokenAddress={selectedToken} hideNavbar={true} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
