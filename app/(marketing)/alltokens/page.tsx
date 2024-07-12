"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ExchangeABI } from "@/ABIs/SafeLaunch/Exchange"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"
import {
  blockExplorerUrls,
  chains,
  rpcUrls,
  safeLaunchFactory,
} from "@/Constants/config"
import { ethers } from "ethers"
import Modal from "react-modal"

import { Navbar } from "@/components/walletconnect/walletconnect"

import "./swap.css"
import "@/styles/allTokens.css"

interface StageInfo {
  safeMemeForSale: string
  requiredTokenB: string
  price: string
  soldSafeMeme: string
  tokenBReceived: string
  availableSafeMeme: string
  totalSupply: string
}

interface SwapModalProps {
  isOpen: boolean
  totalSupply: ethers.BigNumber
  onRequestClose: () => void
  dexAddress: string
  provider: ethers.providers.Web3Provider | null
  currentStage: number
  tokenBName: string
  safeMemeSymbol: string
  tokenBAddress: string
  fetchStageInfo: (
    exchangeContract: any,
    currentStage: number,
    totalSupply: any
  ) => Promise<void>
}

export default function AllTokens(): JSX.Element {
  const [contracts, setContracts] = useState<string[]>([])
  const [deployedTokenData, setDeployedTokenData] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>("")
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
  const [selectedDexAddress, setSelectedDexAddress] = useState("")
  const [safeMemeSymbol, setSafeMemeSymbol] = useState("")
  const [selectedTokenB, setSelectedTokenB] = useState("")
  const [currentStage, setCurrentStage] = useState(0)
  const [selectedTokenBName, setSelectedTokenBName] = useState("")
  const [stageInfo, setStageInfo] = useState<StageInfo | null>(null)
  const [tokenBAmount, setTokenBAmount] = useState<string>("1")
  const [safeMemeAmount, setSafeMemeAmount] = useState<string>("0")
  const [exchangeRate, setExchangeRate] = useState<number>(0)
  const [web3Provider, setWeb3Provider] =
    useState<ethers.providers.Web3Provider | null>(null)

  const [userAddress, setUserAddress] = useState<string>("")
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      setWeb3Provider(new ethers.providers.Web3Provider(window.ethereum))
    }
  }, [])
  const provider = new ethers.providers.JsonRpcProvider(rpcUrls["4002"])

  const tokenFactoryContract = new ethers.Contract(
    safeLaunchFactory["4002"],
    TokenFactoryABI,
    provider
  )

  const getProvider = (chainId) => {
    return new ethers.providers.JsonRpcProvider(rpcUrls[chainId])
  }

  useEffect(() => {
    async function fetchDeployedTokens() {
      try {
        const totalTokens =
          await tokenFactoryContract.getDeployedSafeMemeCount()
        const tokenAddresses: string[] = []
        for (let i = 0; i < totalTokens.toNumber(); i++) {
          const tokenAddress: string =
            await tokenFactoryContract.safeMemesDeployed(i)
          tokenAddresses.push(tokenAddress)
        }
        setContracts(tokenAddresses)
        fetchTokenDetails(tokenAddresses)
      } catch (error) {
        console.error("Error fetching deployed tokens:", error)
      }
    }

    fetchDeployedTokens()
  }, [])

  async function fetchTokenDetails(tokenAddresses: string[]) {
    try {
      const tokenData = await Promise.all(
        tokenAddresses.map(async (address) => {
          const tokenContract = new ethers.Contract(
            address,
            SafeMemeABI,
            provider
          )
          const [name, symbol, totalSupply, decimals, antiWhalePercentage] =
            await Promise.all([
              tokenContract.name(),
              tokenContract.symbol(),
              tokenContract.totalSupply(),
              tokenContract.decimals(),
              tokenContract.antiWhalePercentage(),
            ])

          return {
            address,
            name,
            symbol,
            supply: totalSupply.toString(),
            decimals: decimals.toString(),
            antiWhalePercentage: antiWhalePercentage.toString(),
            chainId: 4002,
          }
        })
      )
      setDeployedTokenData(tokenData)
      setFilteredData(tokenData)
    } catch (error) {
      console.error("Error fetching token details:", error)
    }
  }

  const formatNumber = (number: number, decimals: number) => {
    return (number / 10 ** decimals).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })
  }

  const fetchStageInfo = async (exchangeContract) => {
    try {
      const currentStage = await exchangeContract.getCurrentStage()
      const [tokenBRequired, safeMemePrice] =
        await exchangeContract.getStageInfo(currentStage)
      const [tokenBReceived, soldSafeMeme] =
        await exchangeContract.getStageLiquidity(currentStage)
      const totalSupply = await exchangeContract.totalSupply()

      const availableSafeMeme = ethers.utils
        .parseEther(totalSupply)
        .sub(soldSafeMeme)

      setStageInfo({
        currentStage: currentStage.toNumber(),
        tokenBRequired: ethers.utils.formatEther(tokenBRequired),
        safeMemePrice: ethers.utils.formatEther(safeMemePrice),
        soldSafeMeme: ethers.utils.formatEther(soldSafeMeme),
        tokenBReceived: ethers.utils.formatEther(tokenBReceived),
        availableSafeMeme: ethers.utils.formatEther(availableSafeMeme),
        totalSupply: ethers.utils.formatEther(totalSupply),
      })

      setExchangeRate(parseFloat(ethers.utils.formatEther(safeMemePrice)))
    } catch (error) {
      console.error("Error fetching stage info:", error)
    }
  }

  const openSwapModal = async (dexAddress: string | undefined) => {
    if (!dexAddress) return
    setSelectedDexAddress(dexAddress)
    const selectedToken = deployedTokenData.find(
      (t) => t.address === dexAddress
    )
    if (selectedToken) {
      const provider = getProvider(selectedToken.chainId)
      const tokenContract = new ethers.Contract(
        selectedToken.address,
        SafeMemeABI,
        provider
      )
      const dexAddress = await tokenContract.dexAddress()
      const exchangeContract = new ethers.Contract(
        dexAddress,
        ExchangeABI,
        provider
      )
      const currentStage = await exchangeContract.getCurrentStage()
      const tokenBAddress = await exchangeContract.tokenBAddress()
      let tokenBName = "ETH"
      if (tokenBAddress !== ethers.constants.AddressZero) {
        const tokenBContract = new ethers.Contract(
          tokenBAddress,
          SafeMemeABI,
          provider
        )
        tokenBName = await tokenBContract.symbol()
      }
      setCurrentStage(currentStage.toNumber())
      setSelectedTokenBName(tokenBName)
      setSafeMemeSymbol(selectedToken.symbol)
      setSelectedTokenB(tokenBAddress)
      await fetchStageInfo(exchangeContract, currentStage)
    }
    setIsSwapModalOpen(true)
  }

  const closeSwapModal = () => {
    setIsSwapModalOpen(false)
  }

  const getBlockExplorerLink = (address: string) => {
    return `${blockExplorerUrls["4002"] || ""}${address}`
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const getBlockchainName = (chainId) => {
    const chain = chains.find((chain) => chain.id === Number(chainId))
    return chain ? chain.name : "Unknown Blockchain"
  }

  useEffect(() => {
    filterTokensByBlockchain()
  }, [selectedBlockchain, deployedTokenData])

  const filterTokensByBlockchain = () => {
    if (selectedBlockchain === "") {
      setFilteredData(deployedTokenData)
    } else {
      const filteredTokens = deployedTokenData.filter(
        (token) => getBlockchainName(token.chainId) === selectedBlockchain
      )
      setFilteredData(filteredTokens)
    }
  }

  const handleFilterChange = (e) => {
    setSelectedBlockchain(e.target.value)
  }

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "100%",
      maxWidth: "360px",
      height: "auto",
      maxHeight: "90vh",
      padding: "5px",
      borderRadius: "12px",
      background: "#fff",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
      overflow: "auto",
      boxSizing: "border-box",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
    },
  }

  const SwapModal: React.FC<SwapModalProps> = ({
    isOpen,
    onRequestClose,
    dexAddress,
    provider,
    currentStage,
    tokenBName,
    safeMemeSymbol,
    tokenBAddress,
  }) => {
    const [tokenBAmount, setTokenBAmount] = useState<string>("1")
    const [safeMemeAmount, setSafeMemeAmount] = useState<string>("0")
    const [exchangeRate, setExchangeRate] = useState<number>(0)
    const [stageInfo, setStageInfo] = useState<any>(null)
    const [userAddress, setUserAddress] = useState<string>("")

    useEffect(() => {
      if (isOpen && provider && dexAddress) {
        const exchangeContract = new ethers.Contract(
          dexAddress,
          ExchangeABI,
          provider
        )
        fetchStageInfo(exchangeContract)
        fetchUserAddress()
      }
    }, [isOpen, dexAddress, provider])

    const fetchUserAddress = async () => {
      if (provider) {
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        setUserAddress(address)
      }
    }

    const calculateSafeMemeAmount = (tokenBAmount: string) => {
      console.log("calculateSafeMemeAmount called with:", tokenBAmount)
      console.log("Current stageInfo:", stageInfo)

      if (!stageInfo || !tokenBAmount || tokenBAmount === "") {
        console.log("Setting safeMemeAmount to 0")
        setSafeMemeAmount("0")
        return
      }

      try {
        const tokenBAmountBN = ethers.utils.parseEther(tokenBAmount)
        const safeMemeAmountBN = tokenBAmountBN
          .mul(ethers.utils.parseEther(stageInfo.safeMemeForSale))
          .div(ethers.utils.parseEther(stageInfo.requiredTokenB))
        const availableSafeMeme = ethers.utils.parseEther(
          stageInfo.availableSafeMeme
        )

        const finalSafeMemeAmount = safeMemeAmountBN.gt(availableSafeMeme)
          ? availableSafeMeme
          : safeMemeAmountBN
        const formattedAmount = ethers.utils.formatEther(finalSafeMemeAmount)
        console.log("Calculated safeMemeAmount:", formattedAmount)
        setSafeMemeAmount(formattedAmount)
      } catch (error) {
        console.error("Error calculating SafeMeme amount:", error)
        setSafeMemeAmount("0")
      }
    }

    const handleBuyTokens = async () => {
      if (!provider || !dexAddress) {
        console.error("Provider or DEX address is missing")
        return
      }

      try {
        const signer = provider.getSigner()
        const exchangeContract = new ethers.Contract(
          dexAddress,
          ExchangeABI,
          signer
        )
        const tokenBContract = new ethers.Contract(
          tokenBAddress,
          SafeMemeABI,
          signer
        )
        const tokenBAmountWei = ethers.utils.parseEther(tokenBAmount)

        // Check the allowance
        const allowance = await tokenBContract.allowance(
          userAddress,
          dexAddress
        )
        if (allowance.lt(tokenBAmountWei)) {
          const approveTx = await tokenBContract.approve(
            dexAddress,
            tokenBAmountWei
          )
          await approveTx.wait()
        }

        const tx = await exchangeContract.buyTokens(tokenBAmountWei)
        await tx.wait()

        alert(`${safeMemeSymbol} purchased successfully!`)
        onRequestClose()
      } catch (error) {
        console.error(`Error purchasing ${safeMemeSymbol}:`, error)
        alert(
          `Failed to purchase ${safeMemeSymbol}. Error: ${
            (error as Error).message
          }`
        )
      }
    }

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Token Swap Modal"
        style={customStyles}
      >
        <div className="swap-container">
          <h1 className="page-title">Token Swap</h1>
          <div className="swap-card">
            <div className="token-section">
              <label htmlFor="tokenFrom">From</label>
              <div className="token-amount-container">
                <div className="amount-container">
                  <input
                    type="number"
                    id="amount"
                    value={tokenBAmount}
                    onChange={(e) => {
                      const value = e.target.value
                      console.log("From input changed to:", value)
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setTokenBAmount(value)
                        if (value !== "") {
                          calculateSafeMemeAmount(value)
                        } else {
                          setSafeMemeAmount("0")
                        }
                      }
                    }}
                    placeholder="Amount"
                    className="input-field-with-price"
                  />
                </div>
                <div className="token-name">{tokenBName}</div>
              </div>
            </div>

            <div className="reverse-button-container">
              <button className="reverse-button">&#x21C5;</button>
            </div>

            <div className="token-section">
              <label htmlFor="tokenTo">To</label>
              <div className="token-amount-container">
                <div className="amount-containerTo">
                  <input
                    type="number"
                    id="estimatedOutput"
                    value={safeMemeAmount}
                    disabled
                    className="input-field-with-price"
                    inputMode="numeric"
                  />
                </div>
                <div className="token-name">{safeMemeSymbol}</div>
              </div>
            </div>
            {stageInfo && (
              <div className="swap-summary">
                <p>Current Stage: {stageInfo.currentStage}</p>
                <p>
                  SafeMeme Price: {stageInfo.safeMemePrice} {tokenBName} per{" "}
                  {safeMemeSymbol}
                </p>
                <p>
                  Available {safeMemeSymbol}: {stageInfo.availableSafeMeme}
                </p>
                <p>
                  Sold {safeMemeSymbol}: {stageInfo.soldSafeMeme}
                </p>
                <p>
                  {tokenBName} Required: {stageInfo.tokenBRequired}
                </p>
                <p>
                  {tokenBName} Received: {stageInfo.tokenBReceived}
                </p>
              </div>
            )}

            <button className="swap-button" onClick={handleBuyTokens}>
              Swap
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="dashboard">
            <div className="myTokensHeading">
              <h1 className="pagetitle">All Tokens Created</h1>
              <p className="subheading">
                See all the tokens created on SafeMeme Labs
              </p>
              <select
                className="filter-dropdown"
                value={selectedBlockchain}
                onChange={handleFilterChange}
              >
                <option value="">All Blockchains</option>
                {chains.map((chain) => (
                  <option key={chain.id} value={chain.name}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="token-container">
              {filteredData.length > 0 && (
                <div className="meme-container">
                  {filteredData.map((token, index: number) => (
                    <div className="meme" key={index}>
                      <div className="meme-header">
                        <h3>
                          {token.name} ({token.symbol})
                        </h3>
                        <Image
                          src="/images/logo.png"
                          alt={`${token.name} logo`}
                          width={50}
                          height={50}
                          className="token-logo"
                        />
                      </div>
                      <div className="meme-details">
                        <p>
                          <strong>Blockchain:</strong>{" "}
                          {getBlockchainName(token.chainId)}
                        </p>
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
                          {formatNumber(Number(token.supply), token.decimals)}
                        </p>
                        <p>
                          <strong>Decimals:</strong> {token.decimals}
                        </p>
                        <p>
                          <strong>Anti-Whale Percentage:</strong>{" "}
                          {token.antiWhalePercentage}%
                        </p>
                        <p>
                          <strong>Max Tokens per Holder:</strong>{" "}
                          {formatNumber(
                            (Number(token.supply) * token.antiWhalePercentage) /
                              100,
                            token.decimals
                          )}
                        </p>
                      </div>
                      <button
                        className="buy-token-button"
                        onClick={() => openSwapModal(token.address)}
                      >
                        Buy {token.symbol}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <SwapModal
        isOpen={isSwapModalOpen}
        onRequestClose={closeSwapModal}
        dexAddress={selectedDexAddress}
        provider={web3Provider}
        currentStage={currentStage}
        tokenBName={selectedTokenBName}
        safeMemeSymbol={safeMemeSymbol}
        tokenBAddress={selectedTokenB}
        fetchStageInfo={fetchStageInfo}
      />
    </div>
  )
}
