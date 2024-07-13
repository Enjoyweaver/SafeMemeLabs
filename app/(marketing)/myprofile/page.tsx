"use client"

import React, { useEffect, useState } from "react"
import { ExchangeABI } from "@/ABIs/SafeLaunch/Exchange"
import { ExchangeFactoryABI } from "@/ABIs/SafeLaunch/ExchangeFactory"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"
import {
  NativeTokens,
  blockExplorerAddress,
  blockExplorerToken,
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
  tokenBAmountSet?: boolean
}

interface StageInfo {
  safeMemeForSale: string
  requiredTokenB: string
  price: string
  soldSafeMeme: string
  tokenBReceived: string
  availableSafeMeme: string
}

interface SwapModalProps {
  isOpen: boolean
  onRequestClose: () => void
  dexAddress: string
  provider: ethers.providers.Web3Provider | null
  currentStage: number
  tokenBName: string
  safeMemeSymbol: string
  tokenBAddress: string // Add this line
}

interface NFT {
  id: string
  name: string
  image: string
}

interface Frame {
  id: string
  content: string
  likes: number
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
  const [tokenBAmountInputs, setTokenBAmountInputs] = useState<number[]>([])
  const [currentStage, setCurrentStage] = useState<number>(0)
  const [safeMemeSymbol, setSafeMemeSymbol] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [frames, setFrames] = useState<Frame[]>([])

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== "undefined") {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(web3Provider)

        const network = await web3Provider.getNetwork()
        setChainId(network.chainId)

        try {
          const signer = web3Provider.getSigner()
          const address = await signer.getAddress()
          setUserAddress(address)
          setIsConnected(true) // Set the connected state to true

          await fetchTokens(web3Provider, address, network.chainId)
          await fetchTokenBOptions(web3Provider, address, network.chainId)
          await fetchNFTs(address)
          await fetchFrames(address)
        } catch (error) {
          console.error("No account connected", error)
        }
      }
    }
    init()
  }, [])

  const fetchNFTs = async (address: string) => {
    // Placeholder: Replace with actual NFT fetching logic
    setNfts([
      { id: "1", name: "Cool NFT #1", image: "https://placeholder.com/150" },
      { id: "2", name: "Awesome NFT #2", image: "https://placeholder.com/150" },
    ])
  }

  const fetchFrames = async (address: string) => {
    // Placeholder: Replace with actual Frames fetching logic from Warpcast
    setFrames([
      { id: "1", content: "This is my first frame!", likes: 10 },
      { id: "2", content: "Check out my new project", likes: 25 },
    ])
  }

  const handleSectionClick = (section: string) => {
    setActiveSection(activeSection === section ? null : section)
  }

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
      const maxTokens = await tokenContract.getMaxWalletAmount()
      const dexAddress = await tokenContract.dexAddress()
      const safeLaunchInitialized = dexAddress !== ethers.constants.AddressZero
      const safeLaunchStarted =
        safeLaunchInitialized && (await tokenContract.balanceOf(dexAddress)) > 0

      let tokenB,
        currentStage,
        stageInfo,
        lockedTokens,
        safeMemeForSale,
        tokenBAmountSet = false
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
        tokenBAmountSet = await exchangeContract.stageSet(currentStage)
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
        tokenBAmountSet,
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
    const MAX_PERCENTAGE_PER_STAGE = ethers.BigNumber.from(10)

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
      setSelectedTokenBName(selectedTokenB.symbol) // Ensure this line correctly updates the state
      alert("Token B information submitted successfully!")
    } catch (error) {
      console.error("Error submitting Token B information:", error)
      alert("Failed to submit Token B information. Please try again.")
    }
  }

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setIsConnected(true)
        setUserAddress(accounts[0])
      } else {
        setIsConnected(false)
        setUserAddress("")
      }
    }

    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
    }

    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [])

  const setTokenBAmount = async (
    tokenAddress: string,
    tokenBAddress: string,
    stage: number
  ) => {
    if (!provider || !chainId) {
      console.error("Provider or chainId is missing")
      return
    }

    const signer = provider.getSigner()
    const exchangeFactoryContract = new ethers.Contract(
      exchangeFactory[chainId],
      ExchangeFactoryABI,
      signer
    )

    try {
      const dexAddress = await exchangeFactoryContract.getDEX(tokenAddress)
      console.log("DEX Address:", dexAddress)
      const exchangeContract = new ethers.Contract(
        dexAddress,
        ExchangeABI,
        signer
      )

      const amount = ethers.utils.parseUnits(
        tokenBAmountInputs[stage].toString(),
        18
      )
      console.log(
        `Token B Amount for stage ${stage} (in wei):`,
        amount.toString()
      )

      const tx = await exchangeContract.setStagetokenBAmount(stage, amount)
      await tx.wait()

      await fetchTokens(provider, userAddress, chainId)
      alert(`Token B amount for stage ${stage + 1} set successfully!`)
    } catch (error) {
      console.error(`Error setting Token B amount for stage ${stage}:`, error)
      alert(
        `Failed to set Token B amount for stage ${stage + 1}. Please try again.`
      )
    }
  }

  const handleTokenBAmountChange = (index: number, value: string) => {
    const newTokenBAmountInputs = [...tokenBAmountInputs]
    newTokenBAmountInputs[index] = parseFloat(value)
    setTokenBAmountInputs(newTokenBAmountInputs)
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const closeSwapModal = () => {
    setIsSwapModalOpen(false)
  }

  const openSwapModal = async (dexAddress: string | undefined) => {
    if (!dexAddress) {
      console.error("DEX address is undefined")
      return
    }
    setSelectedDexAddress(dexAddress)
    const selectedToken = tokens.find((t) => t.dexAddress === dexAddress)
    if (selectedToken && provider) {
      const exchangeContract = new ethers.Contract(
        dexAddress,
        ExchangeABI,
        provider
      )
      const currentStage = await exchangeContract.currentStage()
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
    }
    setIsSwapModalOpen(true)
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
    const [stageInfo, setStageInfo] = useState<StageInfo | null>(null)

    useEffect(() => {
      if (isOpen && provider && dexAddress) {
        fetchStageInfo()
      }
    }, [isOpen, dexAddress, provider, currentStage])

    const fetchStageInfo = async () => {
      if (!provider || !dexAddress) return

      try {
        const exchangeContract = new ethers.Contract(
          dexAddress,
          ExchangeABI,
          provider
        )
        const [tokenBRequired, safeMemePrice] =
          await exchangeContract.getStageInfo(currentStage)
        const [tokenBReceived, soldSafeMeme] =
          await exchangeContract.getStageLiquidity(currentStage)
        const totalSupply = await exchangeContract.totalSupply()
        const MAX_PERCENTAGE_PER_STAGE = ethers.BigNumber.from(10) // 10% per stage

        const safeMemeForSale = totalSupply
          .mul(MAX_PERCENTAGE_PER_STAGE)
          .div(100)
        const availableSafeMeme = safeMemeForSale.sub(soldSafeMeme)

        setStageInfo({
          safeMemeForSale: ethers.utils.formatEther(safeMemeForSale),
          requiredTokenB: ethers.utils.formatEther(tokenBRequired),
          price: ethers.utils.formatEther(safeMemePrice),
          soldSafeMeme: ethers.utils.formatEther(soldSafeMeme),
          tokenBReceived: ethers.utils.formatEther(tokenBReceived),
          availableSafeMeme: ethers.utils.formatEther(availableSafeMeme),
        })

        setExchangeRate(parseFloat(ethers.utils.formatEther(safeMemePrice)))
      } catch (error) {
        console.error("Error fetching stage info:", error)
      }
    }

    const calculateSafeMemeAmount = (tokenBAmount: string) => {
      if (!stageInfo || !tokenBAmount || tokenBAmount === "") return

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
      setSafeMemeAmount(ethers.utils.formatEther(finalSafeMemeAmount))
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
        ) // Assuming ERC20ABI is the ABI for Token B
        const tokenBAmountWei = ethers.utils.parseEther(tokenBAmount)

        // Check if SafeLaunch is complete
        const safeLaunchComplete = await exchangeContract.safeLaunchComplete()
        console.log("safeLaunchComplete:", safeLaunchComplete)
        if (safeLaunchComplete) {
          alert("SafeLaunch is already complete")
          return
        }

        // Check current stage
        const currentStage = await exchangeContract.currentStage()
        console.log("currentStage:", currentStage)
        const SAFE_LAUNCH_STAGES = 5 // This should match the contract's value
        if (currentStage > SAFE_LAUNCH_STAGES) {
          alert("Invalid stage")
          return
        }

        // Check if stage is set and has amount
        const stageSet = await exchangeContract.stageSet(currentStage)
        const stageAmount = await exchangeContract.stagetokenBAmounts(
          currentStage
        )
        console.log("stageSet:", stageSet)
        console.log("stageAmount:", stageAmount.toString())
        if (!stageSet || stageAmount.eq(0)) {
          alert("Stage not set or amount not configured")
          return
        }

        // Check the allowance
        const allowance = await tokenBContract.allowance(
          userAddress,
          dexAddress
        )
        console.log("Allowance:", allowance.toString())

        // If allowance is less than the amount to be spent, request approval
        if (allowance.lt(tokenBAmountWei)) {
          console.log("Requesting token B approval...")
          const approveTx = await tokenBContract.approve(
            dexAddress,
            tokenBAmountWei
          )
          await approveTx.wait()
          console.log("Token B approved")
        }

        console.log("Buying tokens...")
        const tx = await exchangeContract.buyTokens(tokenBAmountWei, {
          value:
            tokenBAddress === ethers.constants.AddressZero
              ? tokenBAmountWei
              : 0,
          gasLimit: 9000000, // Adjust as needed
        })
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
                    const value = e.target.value
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
                  className="input-field"
                />
              </div>
              {stageInfo && (
                <div className="swap-summary">
                  <p className="swap-summary-item">
                    Exchange Rate: 1 {tokenBName} ={" "}
                    {(
                      parseFloat(stageInfo.safeMemeForSale) /
                      parseFloat(stageInfo.requiredTokenB)
                    ).toFixed(6)}{" "}
                    {safeMemeSymbol}
                  </p>
                  <p className="swap-summary-item">
                    Estimated {safeMemeSymbol} Output:{" "}
                    {parseFloat(safeMemeAmount).toFixed(6)}
                  </p>
                  <p className="swap-summary-item">
                    Available {safeMemeSymbol}:{" "}
                    {parseFloat(stageInfo.availableSafeMeme).toFixed(6)}
                  </p>
                </div>
              )}
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
      <div className={`dashboard ${isConnected ? "active" : "inactive"}`}>
        <h1 className="pagetitle">Your Dashboard</h1>
        <div className="dashboard-sections">
          <div
            onClick={() => handleSectionClick("NFTs")}
            className={`dashboard-section ${
              activeSection === "NFTs" ? "selected" : ""
            }`}
          >
            <h2>NFTs</h2>
          </div>
          <div
            onClick={() => handleSectionClick("Frames")}
            className={`dashboard-section ${
              activeSection === "Frames" ? "selected" : ""
            }`}
          >
            <h2>Frames</h2>
          </div>
          <div
            onClick={() => handleSectionClick("Tokens")}
            className={`dashboard-section ${
              activeSection === "Tokens" ? "selected" : ""
            }`}
          >
            <h2>Tokens</h2>
          </div>
          <div
            onClick={() => handleSectionClick("SafeMemesNotLaunched")}
            className={`dashboard-section ${
              activeSection === "SafeMemesNotLaunched" ? "selected" : ""
            }`}
          >
            <h2>SafeMemes</h2>
          </div>
          <div
            onClick={() => handleSectionClick("SafeMemes")}
            className={`dashboard-section ${
              activeSection === "SafeMemes" ? "selected" : ""
            }`}
          >
            <h2>SafeMemes Launched</h2>
          </div>
          <div
            onClick={() => handleSectionClick("Rewards")}
            className={`dashboard-section ${
              activeSection === "Rewards" ? "selected" : ""
            }`}
          >
            <h2>Rewards</h2>
          </div>
          <div
            onClick={() => handleSectionClick("CreateAirdrop")}
            className={`dashboard-section ${
              activeSection === "CreateAirdrop" ? "selected" : ""
            }`}
          >
            <h2>Create Airdrop</h2>
          </div>
          <div
            onClick={() => handleSectionClick("CreateAirdrop")}
            className={`dashboard-section ${
              activeSection === "CreateAirdrop" ? "selected" : ""
            }`}
          >
            <h2>Followers</h2>
          </div>
        </div>

        <div className="section-content">
          {activeSection === "NFTs" && (
            <div>
              {nfts.map((nft) => (
                <div key={nft.id}>
                  <img src={nft.image} alt={nft.name} />
                  <p>{nft.name}</p>
                </div>
              ))}
            </div>
          )}
          {activeSection === "Frames" && (
            <div>
              {frames.map((frame) => (
                <div key={frame.id}>
                  <p>{frame.content}</p>
                  <p>Likes: {frame.likes}</p>
                </div>
              ))}
            </div>
          )}
          {activeSection === "Tokens" && (
            <div>{/* Token details rendering logic here */}</div>
          )}
          {activeSection === "SafeMemesNotLaunched" && (
            <div>{/* SafeMemes not launched rendering logic here */}</div>
          )}
          {activeSection === "SafeMemesLaunched" && (
            <div>{/* SafeMemes launched rendering logic here */}</div>
          )}
          {activeSection === "Rewards" && (
            <div>{/* Rewards rendering logic here */}</div>
          )}
          {activeSection === "CreateAirdrop" && (
            <div>{/* Create Airdrop rendering logic here */}</div>
          )}
          {activeSection === "SafeMemes" && (
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
                        {parseFloat(token.totalSupply).toLocaleString()}
                      </p>
                      <p>
                        <strong>Contract:</strong>{" "}
                        <a
                          href={`${blockExplorerToken[chainId || ""]}${
                            token.address
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {truncateAddress(token.address)}
                        </a>
                      </p>
                      <p>
                        <strong>Anti-Whale Percentage:</strong>{" "}
                        {(token.antiWhalePercentage / 100).toFixed(2)}%
                      </p>
                      <p>
                        <strong>Max Wallet Amount:</strong>{" "}
                        {parseFloat(token.maxTokens).toLocaleString()}{" "}
                        {token.symbol}
                      </p>
                      {!token.safeLaunchInitialized && (
                        <p>
                          <strong>Status:</strong> SafeLaunch not started
                        </p>
                      )}
                      {token.safeLaunchInitialized &&
                        !token.safeLaunchStarted && (
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
                            {parseFloat(
                              token.lockedTokens || "0"
                            ).toLocaleString()}
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
                                href={`${blockExplorerToken[chainId || ""]}${
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
                                onChange={(e) =>
                                  setSelectedTokenB(e.target.value)
                                }
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
                                  submitTokenB(token.address, selectedTokenB)
                                }
                              >
                                Submit Token B
                              </button>
                            </div>
                          )}
                          {token.currentStage !== undefined &&
                            token.stageInfo && (
                              <div className="stages-container">
                                <div className="stage-title">
                                  <strong>Current Stage:</strong>{" "}
                                  {token.currentStage + 1}
                                </div>
                                {token.stageInfo.map((stage, index) => (
                                  <div key={index} className="stage">
                                    <div className="stage-details">
                                      <div className="stage-detail-item">
                                        <p>
                                          <span className="secondary-dark-color">
                                            {token.symbol}
                                          </span>{" "}
                                          for sale:
                                        </p>
                                        <p>
                                          {parseFloat(
                                            stage.safeMemeForSale
                                          ).toLocaleString()}
                                        </p>
                                      </div>
                                      <div className="stage-detail-item">
                                        <p>
                                          Available{" "}
                                          <span className="secondary-dark-color">
                                            {token.symbol}
                                          </span>
                                          :
                                        </p>
                                        <p>
                                          {parseFloat(
                                            stage.availableSafeMeme
                                          ).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="stage-details">
                                      <div className="stage-detail-item">
                                        <p>Required {selectedTokenBName}:</p>
                                        <p>
                                          {parseFloat(
                                            stage.requiredTokenB
                                          ).toLocaleString()}{" "}
                                          {selectedTokenBName}
                                        </p>
                                      </div>
                                      <div className="stage-detail-item">
                                        <p>Received {selectedTokenBName}:</p>
                                        <p>
                                          {parseFloat(
                                            stage.tokenBReceived
                                          ).toLocaleString()}{" "}
                                          {selectedTokenBName}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="stage-detail-item">
                                      <p>
                                        Price:{" "}
                                        {(
                                          parseFloat(stage.requiredTokenB) /
                                          parseFloat(stage.safeMemeForSale)
                                        ).toFixed(6)}{" "}
                                        {selectedTokenBName} per{" "}
                                        <span className="secondary-dark-color">
                                          {" "}
                                          {token.symbol}
                                        </span>
                                      </p>
                                    </div>
                                    {!token.tokenBAmountSet && (
                                      <div className="stage-actions">
                                        <input
                                          type="number"
                                          id={`amount-${index}`}
                                          value={
                                            tokenBAmountInputs[index] || ""
                                          }
                                          onChange={(e) =>
                                            handleTokenBAmountChange(
                                              index,
                                              e.target.value
                                            )
                                          }
                                          placeholder={`Amount of ${selectedTokenBName}`}
                                          className="input-field"
                                        />
                                        <button
                                          className="buy-token-button"
                                          onClick={() =>
                                            setTokenBAmount(
                                              token.address,
                                              selectedTokenB,
                                              index
                                            )
                                          }
                                        >
                                          Submit Token B Amount for Stage{" "}
                                          {index + 1}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                          <button
                            className="buy-token-button"
                            onClick={() =>
                              token.dexAddress &&
                              openSwapModal(token.dexAddress)
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
                    {token.safeLaunchInitialized &&
                      !token.safeLaunchStarted && (
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
          )}
        </div>
      </div>
      <SwapModal
        isOpen={isSwapModalOpen}
        onRequestClose={closeSwapModal}
        dexAddress={selectedDexAddress}
        provider={provider}
        currentStage={currentStage}
        tokenBName={selectedTokenBName}
        safeMemeSymbol={safeMemeSymbol}
        tokenBAddress={selectedTokenB}
      />
    </>
  )
}

export default SafeLaunch
