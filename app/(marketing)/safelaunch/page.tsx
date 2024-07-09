"use client"

import React, { useEffect, useState } from "react"
import { ExchangeABI } from "@/ABIs/SafeLaunch/Exchange"
import { ExchangeFactoryABI } from "@/ABIs/SafeLaunch/ExchangeFactory"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"
import {
  NativeTokens,
  blockExplorerAddress,
  exchangeFactory,
  safeLaunchFactory,
} from "@/Constants/config"
import { ethers } from "ethers"
import Modal from "react-modal"

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
  tokenB?: string
  currentStage?: number
  stageInfo?: StageInfo[]
}

interface StageInfo {
  safeMemeForSale: string
  requiredTokenB: string
  price: string
  soldSafeMeme: string
  tokenBReceived: string
  availableSafeMeme: string
}

const SafeLaunch: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([])
  const [userAddress, setUserAddress] = useState<string>("")
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [tokenBOptions, setTokenBOptions] = useState<
    { address: string; symbol: string }[]
  >([])
  const [selectedTokenB, setSelectedTokenB] = useState<string>("")
  const [selectedTokenBName, setSelectedTokenBName] = useState<string>("")
  const [tokenBAmountInput, setTokenBAmountInput] = useState<number>(0)
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
  const [selectedDexAddress, setSelectedDexAddress] = useState("")
  const [safeMemeAmount, setSafeMemeAmount] = useState<string>("0")
  const [exchangeRate, setExchangeRate] = useState<number>(0)
  let dexAddress: string
  let currentStage: number

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
        await fetchTokenBOptions(web3Provider, address, network.chainId)
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

      let tokenB, currentStage, stageInfo, lockedTokens, safeMemeForSale
      if (safeLaunchStarted) {
        const exchangeContract = new ethers.Contract(
          dexAddress,
          ExchangeABI,
          provider
        )
        tokenB = await exchangeContract.tokenBAddress()
        currentStage = await exchangeContract.currentStage()
        lockedTokens = await exchangeContract.getsafeMemesAvailable()
        safeMemeForSale = await exchangeContract.getsafeMemesSold()
        stageInfo = await fetchStageInfo(
          exchangeContract,
          currentStage,
          totalSupply
        )
      }

      return {
        address: tokenAddress,
        name,
        symbol,
        antiWhalePercentage: antiWhalePercentage.toNumber(),
        maxTokens: ethers.utils.formatUnits(maxTokens, decimals),
        totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
        safeLaunchInitialized,
        safeLaunchStarted,
        lockedTokens: ethers.utils.formatUnits(lockedTokens || 0, decimals),
        safeMemeForSale: ethers.utils.formatUnits(
          safeMemeForSale || 0,
          decimals
        ),
        dexAddress: safeLaunchStarted ? dexAddress : undefined,
        tokenB,
        currentStage,
        stageInfo,
      }
    })

    const fetchedTokens = await Promise.all(tokenPromises)
    setTokens(fetchedTokens)
  }

  const fetchStageInfo = async (
    exchangeContract: ethers.Contract,
    currentStage: number,
    totalSupply: ethers.BigNumber
  ) => {
    const stageInfo: StageInfo[] = []
    const MAX_PERCENTAGE_PER_STAGE = ethers.BigNumber.from(5) // 5% per stage

    for (let i = 0; i <= currentStage; i++) {
      const [tokenBRequired, safeMemePrice] =
        await exchangeContract.getStageInfo(i)
      const [tokenBReceived, soldSafeMeme] =
        await exchangeContract.getStageLiquidity(i)
      const safeMemeForSale = totalSupply.mul(MAX_PERCENTAGE_PER_STAGE).div(100)
      const availableSafeMeme = safeMemeForSale.sub(soldSafeMeme)

      stageInfo.push({
        safeMemeForSale: ethers.utils.formatEther(safeMemeForSale),
        requiredTokenB: ethers.utils.formatEther(tokenBRequired),
        price: ethers.utils.formatEther(safeMemePrice),
        soldSafeMeme: ethers.utils.formatEther(soldSafeMeme),
        tokenBReceived: ethers.utils.formatEther(tokenBReceived),
        availableSafeMeme: ethers.utils.formatEther(availableSafeMeme),
      })
    }
    return stageInfo
  }

  const fetchTokenBOptions = async (
    provider: ethers.providers.Web3Provider,
    address: string,
    currentChainId: number
  ) => {
    const factoryContract = new ethers.Contract(
      safeLaunchFactory[currentChainId],
      TokenFactoryABI,
      provider
    )

    const tokenAddresses = await factoryContract.getSafeMemesDeployedByUser(
      address
    )
    const userTokens = await Promise.all(
      tokenAddresses.map(async (address: string) => {
        const contract = new ethers.Contract(address, SafeMemeABI, provider)
        const symbol = await contract.symbol()
        return { address, symbol }
      })
    )

    const nativeTokens = NativeTokens[currentChainId] || []
    setTokenBOptions([...userTokens, ...nativeTokens])
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

  const submitTokenB = async (tokenAddress: string, tokenBAddress: string) => {
    if (!provider || !chainId) return
    const signer = provider.getSigner()
    const exchangeFactoryContract = new ethers.Contract(
      exchangeFactory[chainId],
      ExchangeFactoryABI,
      signer
    )
    const dexAddress = await exchangeFactoryContract.getDEX(tokenAddress)
    const exchangeContract = new ethers.Contract(
      dexAddress,
      ExchangeABI,
      signer
    )

    try {
      const selectedTokenB = tokenBOptions.find(
        (option) => option.address === tokenBAddress
      )
      if (!selectedTokenB) {
        throw new Error("No Token B selected")
      }

      const tx = await exchangeContract.settokenBDetails(
        selectedTokenB.address,
        selectedTokenB.symbol,
        selectedTokenB.symbol
      )
      await tx.wait()
      await fetchTokens(provider, userAddress, chainId)
      setSelectedTokenBName(selectedTokenB.symbol)
      alert("Token B information submitted successfully!")
    } catch (error) {
      console.error("Error submitting Token B information:", error)
      alert("Failed to submit Token B information. Please try again.")
    }
  }

  const setTokenBAmount = async (tokenAddress: string, amount: number) => {
    if (!provider || !chainId) return
    const signer = provider.getSigner()
    const exchangeFactoryContract = new ethers.Contract(
      exchangeFactory[chainId],
      ExchangeFactoryABI,
      signer
    )
    const dexAddress = await exchangeFactoryContract.getDEX(tokenAddress)
    const exchangeContract = new ethers.Contract(
      dexAddress,
      ExchangeABI,
      signer
    )

    try {
      const tx = await exchangeContract.setStagetokenBAmount(
        0,
        ethers.utils.parseUnits(amount.toString(), 18)
      )
      await tx.wait()
      await fetchTokens(provider, userAddress, chainId)
      alert("Token B amount for stage 1 set successfully!")
    } catch (error) {
      console.error("Error setting Token B amount:", error)
      alert("Failed to set Token B amount. Please try again.")
    }
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const closeSwapModal = () => {
    setIsSwapModalOpen(false)
  }

  const openSwapModal = (dexAddress: string | undefined) => {
    if (!dexAddress) {
      console.error("DEX address is undefined")
      return
    }
    setSelectedDexAddress(dexAddress)
    const selectedToken = tokens.find((t) => t.dexAddress === dexAddress)
    if (selectedToken) {
      currentStage = selectedToken.currentStage || 0
    }
    setIsSwapModalOpen(true)
    console.log("Opening swap modal with DEX address:", dexAddress)
  }

  const SwapModal: React.FC<{
    isOpen: boolean
    onRequestClose: () => void
    dexAddress: string
    provider: ethers.providers.Web3Provider | null
    currentStage: number
    tokenBName: string
    safeMemeSymbol: string
  }> = ({
    isOpen,
    onRequestClose,
    dexAddress,
    provider,
    currentStage,
    tokenBName,
    safeMemeSymbol,
  }) => {
    const [tokenBAmount, setTokenBAmount] = useState<number>(1)
    const [safeMemeAmount, setSafeMemeAmount] = useState<string>("0")
    const [exchangeRate, setExchangeRate] = useState<number>(0)

    useEffect(() => {
      if (isOpen) {
        calculateSafeMemeAmount(1)
      }
    }, [isOpen, dexAddress, provider, currentStage])

    const calculateSafeMemeAmount = async (tokenBAmount: number) => {
      if (!provider || !dexAddress) return

      try {
        const exchangeContract = new ethers.Contract(
          dexAddress,
          ExchangeABI,
          provider
        )
        const [tokenBRequired, safeMemePrice] =
          await exchangeContract.getStageInfo(currentStage)
        const [, safeMemeAvailable] = await exchangeContract.getStageLiquidity(
          currentStage
        )

        const tokenBAmountBN = ethers.utils.parseEther(tokenBAmount.toString())
        let safeMemeToBuy = tokenBAmountBN
          .mul(safeMemeAvailable)
          .div(tokenBRequired)

        if (safeMemeToBuy.gt(safeMemeAvailable)) {
          safeMemeToBuy = safeMemeAvailable
        }

        setSafeMemeAmount(ethers.utils.formatEther(safeMemeToBuy))
        setExchangeRate(
          parseFloat(ethers.utils.formatEther(safeMemeToBuy)) / tokenBAmount
        )
      } catch (error) {
        console.error("Error calculating SafeMeme amount:", error)
      }
    }

    const handleBuyTokens = async () => {
      if (!provider || !dexAddress) {
        console.error("Provider or DEX address is missing")
        return
      }
      const signer = provider.getSigner()
      const exchangeContract = new ethers.Contract(
        dexAddress,
        ExchangeABI,
        signer
      )

      try {
        console.log("Buying tokens with parameters:", {
          dexAddress,
          tokenBAmount: tokenBAmount.toString(),
          currentStage,
        })
        const tx = await exchangeContract.buyTokens(
          ethers.utils.parseUnits(tokenBAmount.toString(), 18)
        )
        await tx.wait()
        alert(`${safeMemeSymbol} purchased successfully!`)
        onRequestClose()
      } catch (error) {
        console.error(`Error purchasing ${safeMemeSymbol}:`, error)
        alert(`Failed to purchase ${safeMemeSymbol}. Please try again.`)
      }
    }

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Token Swap Modal"
        className="swap-modal"
      >
        <div className="mini-swap-container">
          <div className="token-swap-inner">
            <h2 className="pagetitle">Token Swap</h2>
            <div className="swap-card">
              <div className="token-section">
                <label htmlFor="amount" className="subheading">
                  Amount of {tokenBName} to swap
                </label>
                <input
                  type="number"
                  id="amount"
                  value={tokenBAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    setTokenBAmount(value)
                    calculateSafeMemeAmount(value)
                  }}
                  placeholder="Amount"
                  className="input-field"
                />
              </div>
              <div className="swap-summary">
                <p className="swap-summary-item">
                  Exchange Rate: {exchangeRate.toFixed(6)} {safeMemeSymbol}s per{" "}
                  {tokenBName}
                </p>
                <p className="swap-summary-item">
                  Estimated {safeMemeSymbol} Output:{" "}
                  {parseFloat(safeMemeAmount).toFixed(6)}
                </p>
              </div>
              <button className="buy-token-button" onClick={handleBuyTokens}>
                Swap
              </button>
            </div>
          </div>
        </div>
      </Modal>
    )
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
                    <strong>Contract:</strong> {truncateAddress(token.address)}
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
                      {token.tokenB &&
                      token.tokenB !==
                        "0x0000000000000000000000000000000000000000" ? (
                        <p>
                          <strong>Token B:</strong>{" "}
                          <a
                            href={`${blockExplorerAddress[chainId || ""]}${
                              token.tokenB
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {truncateAddress(token.tokenB)}
                          </a>
                        </p>
                      ) : (
                        <div>
                          <p>
                            <strong>Select Token B:</strong>
                          </p>
                          <select
                            onChange={(e) => setSelectedTokenB(e.target.value)}
                          >
                            <option value="">Select Token B</option>
                            {tokenBOptions.map((option) => (
                              <option
                                key={option.address}
                                value={option.address}
                              >
                                {option.symbol}
                              </option>
                            ))}
                          </select>
                          <button
                            className="buy-token-button"
                            onClick={() =>
                              setTokenBAmount(token.address, selectedTokenB)
                            }
                          >
                            Submit Token B
                          </button>
                        </div>
                      )}
                      {token.currentStage !== undefined && token.stageInfo && (
                        <div>
                          <p>
                            <strong>Current Stage:</strong>{" "}
                            {token.currentStage + 1}
                          </p>
                          {token.stageInfo.map((stage, index) => (
                            <div key={index}>
                              <h4>Stage {index + 1}</h4>
                              <p>
                                {token.symbol} for sale:{" "}
                                {parseFloat(
                                  stage.safeMemeForSale
                                ).toLocaleString()}{" "}
                                {token.symbol}
                              </p>
                              <p>
                                Available {token.symbol}:{" "}
                                {parseFloat(
                                  stage.availableSafeMeme
                                ).toLocaleString()}{" "}
                                {token.symbol}
                              </p>
                              <p>
                                Required {selectedTokenBName}:{" "}
                                {parseFloat(
                                  stage.requiredTokenB
                                ).toLocaleString()}{" "}
                                {selectedTokenBName}
                              </p>
                              <p>
                                Price:{" "}
                                {(
                                  parseFloat(stage.requiredTokenB) /
                                  parseFloat(stage.safeMemeForSale)
                                ).toFixed(6)}{" "}
                                {selectedTokenBName} per {token.symbol}
                              </p>
                              <p>
                                Sold {token.symbol}:{" "}
                                {parseFloat(
                                  stage.soldSafeMeme
                                ).toLocaleString()}{" "}
                                {token.symbol}
                              </p>
                              <p>
                                Received {selectedTokenBName}:{" "}
                                {parseFloat(
                                  stage.tokenBReceived
                                ).toLocaleString()}{" "}
                                {selectedTokenBName}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        className="buy-token-button"
                        onClick={() =>
                          token.dexAddress && openSwapModal(token.dexAddress)
                        }
                      >
                        Buy {token.symbol}
                      </button>
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
      <SwapModal
        isOpen={isSwapModalOpen}
        onRequestClose={closeSwapModal}
        dexAddress={selectedDexAddress}
        provider={provider}
        currentStage={parseInt(
          tokens
            .find((t) => t.dexAddress === selectedDexAddress)
            ?.currentStage?.toString() || "0"
        )}
        tokenBName={
          tokens.find((t) => t.dexAddress === selectedDexAddress)?.tokenB ||
          selectedTokenBName
        }
        safeMemeSymbol={
          tokens.find((t) => t.dexAddress === selectedDexAddress)?.symbol ||
          "SafeMeme"
        }
      />
    </>
  )
}

export default SafeLaunch
