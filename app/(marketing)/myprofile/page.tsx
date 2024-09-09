"use client"

import React, { useCallback, useEffect, useState } from "react"
import { AirdropABI } from "@/ABIs/Airdrop/Airdrop"
import { AirdropFactoryABI } from "@/ABIs/Airdrop/AirdropFactory"
import { CustomAirdropABI } from "@/ABIs/Airdrop/CustomAirdrop"
import { ExchangeABI } from "@/ABIs/SafeLaunch/Exchange"
import { ExchangeFactoryABI } from "@/ABIs/SafeLaunch/ExchangeFactory"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"
import {
  NativeTokens,
  airdropContract,
  blockExplorerAddress,
  blockExplorerToken,
  chains,
  customAirdropContract,
  exchangeFactory,
  safeLaunchFactory,
} from "@/Constants/config"
import { Alchemy, Network } from "alchemy-sdk"
import { ethers } from "ethers"
import Modal from "react-modal"

import "@/styles/myprofile.css"
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
  tokenBName?: string
  tokenBSymbol?: string
  currentStage?: number
  stageInfo?: StageInfo[]
  tokenBAmountSet?: boolean
  stageStatus?: number
}

interface StageInfo {
  safeMemeForSale: string
  requiredTokenB: string
  price: string
  soldsafeMeme: string
  tokenBReceived: string
  availableSafeMeme: string
  stageSet: boolean
  safeMemesSold: string
  status: "completed" | "open and set" | "open but not set" | "not open"
}

interface SwapModalProps {
  isOpen: boolean
  onRequestClose: () => void
  dexAddress: string
  provider: ethers.providers.Web3Provider | null
  currentStage: number
  tokenBName: string
  safeMemeSymbol: string
  tokenBAddress: string
}

interface Frame {
  id: string
  content: string
  likes: number
}

interface NFT {
  id: string
  name: string
  image: string
  contractAddress: string
  tokenId: string
  chainId: number
}

const MyProfile: React.FC = () => {
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
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false)
  const [frames, setFrames] = useState<Frame[]>([])
  const SAFE_LAUNCH_STAGES = 5
  const [airdropTokenAddress, setAirdropTokenAddress] = useState<string>("")
  const [airdropAmount, setAirdropAmount] = useState<string>("")
  const [airdropDuration, setAirdropDuration] = useState<string>("")
  const [airdropRecipients, setAirdropRecipients] = useState<string[]>([])
  const [customListName, setCustomListName] = useState<string>("")
  const [customListAddresses, setCustomListAddresses] = useState<string>("")
  const [airdropOption, setAirdropOption] = useState<
    "new" | "existing" | "custom"
  >("new")
  const [userCustomLists, setUserCustomLists] = useState<
    Array<{ id: number; name: string }>
  >([])
  const [selectedListId, setSelectedListId] = useState<number | null>(null)
  const [showMessage, setShowMessage] = useState(false)
  const [messageContent, setMessageContent] = useState("")
  const [opacity, setOpacity] = useState(1)
  const [walletError, setWalletError] = useState<string | null>(null)
  const [fees, setFees] = useState([])
  const [totalHolders, setTotalHolders] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [totalOwnerFees, setTotalOwnerFees] = useState("0")
  const [totalNFTs, setTotalNFTs] = useState(0)
  const [totalFrames, setTotalFrames] = useState(0)
  const [totalSafeMemes, setTotalSafeMemes] = useState(0)
  const [totalSafeLaunched, setTotalSafeLaunched] = useState(0)

  useEffect(() => {
    const fetchFees = async () => {
      if (provider && selectedDexAddress) {
        try {
          const exchangeContract = new ethers.Contract(
            selectedDexAddress,
            ExchangeABI,
            provider
          )
          const pastTransactions = await exchangeContract.getPastTransactions()

          const formattedFees = pastTransactions.map((tx) => ({
            swapFee: ethers.utils.formatEther(tx.swapFee),
            ownerFee: ethers.utils.formatEther(tx.ownerFee),
            houseFee: ethers.utils.formatEther(tx.houseFee),
            timestamp: new Date(
              tx.txtimestamp.toNumber() * 1000
            ).toLocaleString(),
          }))

          setFees(formattedFees)
        } catch (error) {
          console.error("Error fetching fees:", error)
        }
      }
    }

    fetchFees()
  }, [selectedDexAddress, provider])

  useEffect(() => {
    const init = async () => {
      console.log("Initializing MyProfile component")
      if (typeof window.ethereum !== "undefined") {
        console.log("Ethereum object found")
        try {
          const web3Provider = new ethers.providers.Web3Provider(
            window.ethereum
          )
          setProvider(web3Provider)
          console.log("Web3Provider set")

          const network = await web3Provider.getNetwork()
          setChainId(network.chainId)
          console.log("Chain ID set:", network.chainId)

          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          })
          console.log("Accounts:", accounts)

          if (accounts.length > 0) {
            const address = accounts[0]
            setUserAddress(address)
            setIsConnected(true)
            console.log("User connected:", address)

            await fetchTokens(web3Provider, address, network.chainId)
            await fetchTokenBOptions(web3Provider, address, network.chainId)
            await fetchNFTs(address)
            await fetchFrames(address)
          } else {
            console.log("No accounts found. Prompting user to connect.")
            const newAccounts = await window.ethereum.request({
              method: "eth_requestAccounts",
            })
            if (newAccounts.length > 0) {
              const address = newAccounts[0]
              setUserAddress(address)
              setIsConnected(true)
              console.log("User connected after prompt:", address)

              await fetchTokens(web3Provider, address, network.chainId)
              await fetchTokenBOptions(web3Provider, address, network.chainId)
              await fetchNFTs(address)
              await fetchFrames(address)
            } else {
              throw new Error("User denied account access")
            }
          }
        } catch (error) {
          console.error("Error during initialization:", error)
          setWalletError(
            error.message || "An error occurred while connecting to your wallet"
          )
          setIsConnected(false)
        }
      } else {
        console.error(
          "Ethereum object not found. Please install MetaMask or another web3 wallet."
        )
        setWalletError(
          "Web3 wallet not detected. Please install MetaMask or another web3 wallet."
        )
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

    // Fetch token addresses deployed by the user
    const tokenAddresses = await factoryContract.getSafeMemesDeployedByUser(
      address
    )

    // Update the totalSafeMemes state with the number of tokens created
    setTotalSafeMemes(tokenAddresses.length)

    const tokenPromises = tokenAddresses.map(async (tokenAddress: string) => {
      try {
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
        const safeLaunchInitialized =
          dexAddress !== ethers.constants.AddressZero
        const safeLaunchStarted =
          safeLaunchInitialized &&
          (await tokenContract.balanceOf(dexAddress)) > 0

        let tokenB,
          tokenBName,
          tokenBSymbol,
          currentStage,
          stageInfo,
          lockedTokens,
          safeMemeForSale,
          tokenBAmountSet = false,
          stageStatus

        if (safeLaunchStarted) {
          const exchangeContract = new ethers.Contract(
            dexAddress,
            ExchangeABI,
            provider
          )

          // Fetch current stage
          currentStage = await exchangeContract.currentStage()

          // Fetch stage details
          const stageDetails = await exchangeContract.getStageDetails()

          tokenB = await exchangeContract.tokenBAddress()
          lockedTokens = await exchangeContract.lockedsafeMeme()
          safeMemeForSale = await exchangeContract.salesafeMeme()
          if (tokenB !== ethers.constants.AddressZero) {
            const tokenBContract = new ethers.Contract(
              tokenB,
              SafeMemeABI,
              provider
            )
            tokenBName = await tokenBContract.name()
            tokenBSymbol = await tokenBContract.symbol()
          } else {
            tokenBName = "ETH"
            tokenBSymbol = "ETH"
          }
          // Process stage info
          stageInfo = stageDetails[0].map((status, index) => ({
            status: status.toNumber(),
            tokenBRequired: ethers.utils.formatEther(stageDetails[1][index]),
            safeMemePrice: ethers.utils.formatEther(stageDetails[2][index]),
            safeMemeRemaining: ethers.utils.formatEther(stageDetails[3][index]),
            tokenBReceived: ethers.utils.formatEther(stageDetails[4][index]),
            safeMemesSoldThisStage: ethers.utils.formatEther(
              stageDetails[5][index]
            ),
            soldsafeMemeThisTX: ethers.utils.formatEther(
              stageDetails[6][index]
            ),
            is_open: stageDetails[7][index],
            tokenBRequired_set: stageDetails[8][index],
            tokenBReceived_met: stageDetails[9][index],
            stage_completed: stageDetails[10][index],
          }))

          stageStatus = stageInfo[currentStage.toNumber()].status
          tokenBAmountSet =
            stageInfo[currentStage.toNumber()].tokenBRequired_set
        }

        return {
          address: tokenAddress,
          name,
          symbol,
          tokenB,
          tokenBName,
          tokenBSymbol,
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
          currentStage: currentStage ? currentStage.toNumber() : undefined,
          stageInfo,
          tokenBAmountSet,
          stageStatus,
        }
      } catch (error) {
        console.error(`Error fetching token ${tokenAddress}:`, error)
        return {
          address: tokenAddress,
          name: "Unknown",
          symbol: "Unknown",
          antiWhalePercentage: 0,
          maxTokens: "0",
          totalSupply: "0",
          safeLaunchInitialized: false,
          safeLaunchStarted: false,
        }
      }
    })

    const fetchedTokens = await Promise.all(tokenPromises)
    setTokens(fetchedTokens.filter(Boolean)) // Filter out any null values from failed fetches
  }

  const fetchTotalHolders = async (
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

    const holderPromises = tokenAddresses.map(async (tokenAddress: string) => {
      try {
        const tokenContract = new ethers.Contract(
          tokenAddress,
          SafeMemeABI,
          provider
        )
        const holdersCount = await tokenContract.holdersCount()
        console.log(
          `Holders count for token ${tokenAddress}:`,
          holdersCount.toNumber()
        )
        return holdersCount.toNumber()
      } catch (error) {
        console.error(
          `Error fetching holders for token ${tokenAddress}:`,
          error
        )
        return 0
      }
    })

    const holdersCounts = await Promise.all(holderPromises)
    const totalHolders = holdersCounts.reduce((acc, count) => acc + count, 0)
    console.log(`Total holders across tokens:`, totalHolders)
    setTotalHolders(totalHolders)
  }

  useEffect(() => {
    const init = async () => {
      console.log("Initializing MyProfile component")
      if (typeof window.ethereum !== "undefined") {
        console.log("Ethereum object found")
        try {
          const web3Provider = new ethers.providers.Web3Provider(
            window.ethereum
          )
          setProvider(web3Provider)
          console.log("Web3Provider set")

          const network = await web3Provider.getNetwork()
          setChainId(network.chainId)
          console.log("Chain ID set:", network.chainId)

          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          })
          console.log("Accounts:", accounts)

          if (accounts.length > 0) {
            const address = accounts[0]
            setUserAddress(address)
            setIsConnected(true)
            console.log("User connected:", address)

            await fetchTokens(web3Provider, address, network.chainId)
            await fetchTokenBOptions(web3Provider, address, network.chainId)
            await fetchNFTs(address)
            await fetchFrames(address)
            await fetchTotalHolders(web3Provider, address, network.chainId)
          } else {
            console.log("No accounts found. Prompting user to connect.")
            const newAccounts = await window.ethereum.request({
              method: "eth_requestAccounts",
            })
            if (newAccounts.length > 0) {
              const address = newAccounts[0]
              setUserAddress(address)
              setIsConnected(true)
              console.log("User connected after prompt:", address)

              await fetchTokens(web3Provider, address, network.chainId)
              await fetchTokenBOptions(web3Provider, address, network.chainId)
              await fetchNFTs(address)
              await fetchFrames(address)
              await fetchTotalHolders(web3Provider, address, network.chainId)
            } else {
              throw new Error("User denied account access")
            }
          }
        } catch (error) {
          console.error("Error during initialization:", error)
          setWalletError(
            error.message || "An error occurred while connecting to your wallet"
          )
          setIsConnected(false)
        }
      } else {
        console.error(
          "Ethereum object not found. Please install MetaMask or another web3 wallet."
        )
        setWalletError(
          "Web3 wallet not detected. Please install MetaMask or another web3 wallet."
        )
      }
    }
    init()
  }, [])

  const fetchNFTs = async (address: string) => {
    console.log("Fetching NFTs for address:", address)
    setIsLoadingNFTs(true)
    const allNFTs: NFT[] = []

    const supportedChains = chains.filter((chain) => chain.id !== 501)

    for (const chain of supportedChains) {
      console.log(`Fetching NFTs for chain: ${chain.name} (${chain.id})`)
      const settings = {
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
        network: Network[chain.network as keyof typeof Network],
      }
      const alchemy = new Alchemy(settings)

      try {
        const nftsForOwner = await alchemy.nft.getNftsForOwner(address)
        console.log(
          `Found ${nftsForOwner.ownedNfts.length} NFTs on ${chain.name}`
        )
        const chainNFTs = nftsForOwner.ownedNfts.map((nft) => ({
          id: nft.tokenId,
          name: nft.title,
          image: nft.media[0]?.gateway || "https://via.placeholder.com/150",
          chainId: chain.id,
          contractAddress: nft.contract.address,
          tokenId: nft.tokenId,
        }))
        allNFTs.push(...chainNFTs)
      } catch (error) {
        console.error(`Error fetching NFTs for chain ${chain.id}:`, error)
      }
    }

    console.log(`Total NFTs found across all chains: ${allNFTs.length}`)
    setNfts(allNFTs)
    setIsLoadingNFTs(false)
  }

  const handleSectionClick = (section: string) => {
    setActiveSection(activeSection === section ? null : section)
  }

  const createAirdrop = async () => {
    if (!provider || !chainId) return
    const signer = provider.getSigner()

    const airdropContractAddress = airdropContract[chainId]
    if (!airdropContractAddress) {
      alert("Airdrop contract not available on this network")
      return
    }

    const contract = new ethers.Contract(
      airdropContractAddress,
      AirdropABI,
      signer
    )

    try {
      const tx = await contract.airdropToken(
        airdropTokenAddress,
        airdropRecipients,
        airdropRecipients.map(() => ethers.utils.parseEther(airdropAmount))
      )
      await tx.wait()
      alert("Airdrop created successfully!")
    } catch (error) {
      console.error("Error creating airdrop:", error)
      alert(`Failed to create airdrop: ${(error as Error).message}`)
    }
  }

  const createCustomList = async () => {
    if (!provider || !chainId) return
    const signer = provider.getSigner()

    const customAirdropContractAddress = customAirdropContract[chainId]
    if (!customAirdropContractAddress) {
      alert("Custom Airdrop contract not available on this network")
      return
    }

    const addresses = customListAddresses
      .split("\n")
      .map((addr) => addr.trim())
      .filter((addr) => ethers.utils.isAddress(addr))

    if (addresses.length === 0) {
      alert("Please provide valid Ethereum addresses")
      return
    }

    const contract = new ethers.Contract(
      customAirdropContractAddress,
      CustomAirdropABI,
      signer
    )

    try {
      const tx = await contract.createList(customListName, addresses)
      await tx.wait()
      alert("Custom list created successfully!")
    } catch (error) {
      console.error("Error creating custom list:", error)
      alert(`Failed to create custom list: ${(error as Error).message}`)
    }
  }

  const airdropToCustomList = async () => {
    if (!provider || !chainId || selectedListId === null) return
    const signer = provider.getSigner()

    const customAirdropContractAddress = customAirdropContract[chainId]
    if (!customAirdropContractAddress) {
      alert("Custom Airdrop contract not available on this network")
      return
    }

    const contract = new ethers.Contract(
      customAirdropContractAddress,
      CustomAirdropABI,
      signer
    )

    try {
      const [, , listRecipients] = await contract.getList(selectedListId)

      if (listRecipients.length === 0) {
        alert("The selected list has no recipients")
        return
      }

      const amounts = listRecipients.map(() =>
        ethers.utils.parseEther(airdropAmount)
      )
      const totalAmount = amounts.reduce(
        (a, b) => a.add(b),
        ethers.BigNumber.from(0)
      )

      console.log("Airdrop parameters:", {
        tokenAddress: airdropTokenAddress,
        listId: selectedListId,
        recipients: listRecipients,
        amounts: amounts,
        totalAmount: ethers.utils.formatEther(totalAmount),
      })

      if (airdropTokenAddress !== ethers.constants.AddressZero) {
        // ERC20 token airdrop
        const tokenContract = new ethers.Contract(
          airdropTokenAddress,
          [
            "function allowance(address owner, address spender) view returns (uint256)",
            "function approve(address spender, uint256 value) returns (bool)",
          ],
          signer
        )
        const allowance = await tokenContract.allowance(
          await signer.getAddress(),
          customAirdropContractAddress
        )

        if (allowance.lt(totalAmount)) {
          const approveTx = await tokenContract.approve(
            customAirdropContractAddress,
            totalAmount
          )
          await approveTx.wait()
        }

        // Let provider estimate gas limit
        const tx = await contract.airdropToken(
          airdropTokenAddress,
          selectedListId,
          amounts
        )
        await tx.wait()
      } else {
        const tx = await contract.airdropToken(
          ethers.constants.AddressZero,
          selectedListId,
          amounts,
          {
            value: totalAmount,
          }
        )
        await tx.wait()
      }
      console.log("Attempting airdrop on blockchain with chainId:", chainId)

      alert("Airdrop to custom list created successfully!")
    } catch (error) {
      console.error("Error creating airdrop to custom list:", error)
      alert(
        `Failed to create airdrop to custom list: ${
          error.message || "Unknown error"
        }`
      )
    }
  }

  const updateCustomList = async () => {
    if (!provider || !chainId || selectedListId === null) return
    const signer = provider.getSigner()

    const customAirdropContractAddress = customAirdropContract[chainId]
    if (!customAirdropContractAddress) {
      alert("Custom Airdrop contract not available on this network")
      return
    }

    try {
      const contract = new ethers.Contract(
        customAirdropContractAddress,
        CustomAirdropABI,
        signer
      )

      console.log("Updating list with ID:", selectedListId)
      console.log("New list name:", customListName)
      console.log("New recipients:", airdropRecipients)

      const tx = await contract.updateList(
        selectedListId,
        customListName,
        airdropRecipients
      )
      console.log("Transaction sent:", tx.hash)
      await tx.wait()
      console.log("Transaction confirmed")

      alert("Custom list updated successfully!")
      await fetchUserCustomLists()
    } catch (error) {
      console.error("Error updating custom list:", error)
      if (error.reason) {
        alert(`Failed to update custom list: ${error.reason}`)
      } else if (error.message) {
        alert(`Failed to update custom list: ${error.message}`)
      } else {
        alert("Failed to update custom list: Unknown error")
      }
    }
  }

  const refetchTokenInfo = async () => {
    if (provider && chainId && userAddress) {
      await fetchTokens(provider, userAddress, chainId)
    }
  }

  const fetchStageInfo = async (
    exchangeContract: ethers.Contract,
    currentStage: number
  ): Promise<StageInfo[]> => {
    const stageInfo: StageInfo[] = []
    const SAFE_LAUNCH_STAGES = 5

    for (let i = 0; i < SAFE_LAUNCH_STAGES; i++) {
      try {
        const [
          status,
          tokenBRequired,
          safeMemePrice,
          safeMemeAvailable,
          tokenBReceived,
          safeMemesSold,
          soldsafeMeme,
        ] = await exchangeContract.getStageInfo(i)
        const [tokenBLiquidityReceived, safeMemesSoldInStage] =
          await exchangeContract.getStageLiquidity(i)

        let stageStatus:
          | "completed"
          | "open and set"
          | "open but not set"
          | "not open" = "not open"

        if (
          i === 0 ||
          (stageInfo[i - 1] && stageInfo[i - 1].status === "completed")
        ) {
          if (ethers.BigNumber.from(safeMemeAvailable).gt(0)) {
            if (ethers.BigNumber.from(tokenBRequired).gt(0)) {
              if (
                ethers.BigNumber.from(safeMemeAvailable).eq(0) &&
                ethers.BigNumber.from(tokenBRequired).eq(
                  ethers.BigNumber.from(tokenBLiquidityReceived)
                )
              ) {
                stageStatus = "completed"
              } else {
                stageStatus = "open and set"
              }
            } else {
              stageStatus = "open but not set"
            }
          } else {
            stageStatus = "completed"
          }
        }

        stageInfo.push({
          safeMemeForSale: ethers.utils.formatEther(safeMemeAvailable),
          requiredTokenB: ethers.utils.formatEther(tokenBRequired),
          price: ethers.utils.formatEther(safeMemePrice),
          safeMemesSold: ethers.utils.formatEther(safeMemesSold),
          tokenBReceived: ethers.utils.formatEther(tokenBReceived),
          availableSafeMeme: ethers.utils.formatEther(safeMemeAvailable),
          soldsafeMeme: ethers.utils.formatEther(soldsafeMeme),
          stageSet: stageStatus === "open and set",
          status: stageStatus,
        })
      } catch (error) {
        console.error(`Error fetching stage ${i} info:`, error)
        stageInfo.push({
          safeMemeForSale: "0",
          requiredTokenB: "0",
          price: "0",
          safeMemesSold: "0",
          tokenBReceived: "0",
          availableSafeMeme: "0",
          soldsafeMeme: "0",
          stageSet: false,
          status: "not open",
        })
      }
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
    stage: number,
    amount: number
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
      const exchangeContract = new ethers.Contract(
        dexAddress,
        ExchangeABI,
        signer
      )
      const amountInWei = ethers.utils.parseUnits(amount.toString(), 18)

      // Fetch current stage
      const currentStage = await exchangeContract.currentStage()

      // Fetch stage details
      const stageDetails = await exchangeContract.getStageDetails()

      // Get the status of the current stage
      const stageStatus = stageDetails[0][currentStage.toNumber()]

      // Add logs to debug
      console.log(`Setting Token B amount for stage: ${stage}`)
      console.log(`Current stage from contract: ${currentStage}`)
      console.log(`Stage status: ${stageStatus}`)

      // Check if the stage matches the current stage and is open but not set
      if (stage !== currentStage.toNumber()) {
        console.error("Can only set amount for the current stage")
        alert("Can only set amount for the current stage")
        return
      }

      // STAGE_STATUS_OPEN_NOT_SET is 1 in the contract
      if (stageStatus.toNumber() !== 1) {
        console.error("Stage must be open and not set")
        alert("Stage must be open and not set")
        return
      }

      const tx = await exchangeContract.setStagetokenBAmount(amountInWei)
      await tx.wait()

      await fetchTokens(provider, userAddress, chainId) // Ensure this updates the UI immediately
      alert(`Token B amount for stage ${stage} set successfully!`)
    } catch (error) {
      console.error(`Error setting Token B amount for stage ${stage}:`, error)
      alert(
        `Failed to set Token B amount for stage ${stage}. Please try again.`
      )
    }
  }

  const handleTokenBAmountChange = (stage: number, value: string) => {
    setTokenBAmountInputs((prev) => {
      const newInputs = [...prev]
      newInputs[stage] = Number(value)
      return newInputs
    })
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

  const fetchUserCustomLists = useCallback(async () => {
    if (!provider || !chainId || !userAddress) return

    const customAirdropContractAddress = customAirdropContract[chainId]
    if (!customAirdropContractAddress) {
      console.error("Custom Airdrop contract not available on this network")
      return
    }

    const contract = new ethers.Contract(
      customAirdropContractAddress,
      CustomAirdropABI,
      provider
    )

    try {
      const listIds = await contract.getUserLists(userAddress)
      const listsPromises = listIds.map(async (id: number) => {
        const [name] = await contract.getList(id)
        return { id, name }
      })
      const lists = await Promise.all(listsPromises)
      setUserCustomLists(lists)
    } catch (error) {
      console.error("Error fetching user's custom lists:", error)
    }
  }, [provider, chainId, userAddress])

  useEffect(() => {
    if (isConnected && provider && chainId && userAddress) {
      fetchUserCustomLists()
    }
  }, [isConnected, provider, chainId, userAddress, fetchUserCustomLists])

  const formatSignificantDigits = (number) => {
    if (number === 0) return "0"
    const parts = number.toExponential(2).split("e")
    const coefficient = parseFloat(parts[0])
    const exponent = parseInt(parts[1])
    if (exponent < 0) {
      return (
        "0." +
        "0".repeat(Math.abs(exponent) - 1) +
        coefficient.toString().replace(".", "")
      )
    } else {
      return number.toFixed(2)
    }
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
        const [
          status,
          tokenBRequired,
          safeMemePrice,
          safeMemeAvailable,
          tokenBReceived,
          safeMemesSold,
          soldsafeMeme,
        ] = await exchangeContract.getStageInfo(currentStage)

        // Fetch stage liquidity
        const [tokenBLiquidityReceived, safeMemesSoldInStage] =
          await exchangeContract.getStageLiquidity(currentStage)

        const totalSupply = await exchangeContract.totalSupply()
        const MAX_PERCENTAGE_PER_STAGE = ethers.BigNumber.from(10) // 10% per stage

        const safeMemeForSale = totalSupply
          .mul(MAX_PERCENTAGE_PER_STAGE)
          .div(100)
        const availableSafeMeme = safeMemeForSale.sub(safeMemesSold)

        setStageInfo({
          status: status.toNumber(),
          tokenBRequired: ethers.utils.formatEther(tokenBRequired),
          safeMemePrice: ethers.utils.formatEther(safeMemePrice),
          safeMemeForSale: ethers.utils.formatEther(safeMemeForSale),
          safeMemesSold: ethers.utils.formatEther(safeMemesSold),
          tokenBReceived: ethers.utils.formatEther(tokenBReceived),
          availableSafeMeme: ethers.utils.formatEther(availableSafeMeme),
          soldsafeMeme: ethers.utils.formatEther(soldsafeMeme),
        })

        setExchangeRate(parseFloat(ethers.utils.formatEther(safeMemePrice)))
      } catch (error) {
        console.error("Error fetching stage info:", error)
      }
    }

    useEffect(() => {
      const fadeTimer = setTimeout(() => {
        setOpacity(0) // Start fading out after 3 seconds
      }, 3000)

      const hideTimer = setTimeout(() => {
        setShowMessage(false) // Hide the message completely after 5 seconds
      }, 5000)

      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(hideTimer)
      }
    }, [])

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
        )
        const tokenBAmountWei = ethers.utils.parseEther(tokenBAmount)

        const safeLaunchComplete = await exchangeContract.safeLaunchComplete()
        console.log("safeLaunchComplete:", safeLaunchComplete)
        if (safeLaunchComplete) {
          alert("SafeLaunch is already complete")
          return
        }

        // Check current stage
        const currentStage = await exchangeContract.currentStage()
        console.log("currentStage:", currentStage)
        const SAFE_LAUNCH_STAGES = 5
        if (currentStage > SAFE_LAUNCH_STAGES) {
          alert("Invalid stage")
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
          gasLimit: 9000000,
        })
        await tx.wait()
        await refetchTokenInfo()
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
                      parseFloat(stageInfo.requiredTokenB) /
                      parseFloat(stageInfo.safeMemeForSale)
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
        <div className="dashboard-overview">
          <div className="overview-item">
            <h3>SafeMemes</h3>
            <p>{totalSafeMemes}</p>
          </div>
          <div className="overview-item">
            <h3>SafeLaunched</h3>
            <p>{totalSafeLaunched}</p>
          </div>
          <div className="overview-item">
            <h3>Holders</h3>
            <p>{totalHolders}</p>
          </div>
          <div className="overview-item">
            <h3>Transactions</h3>
            <p>{totalTransactions}</p>
          </div>
          <div className="overview-item">
            <h3>Owner Fees</h3>
            <p>{parseFloat(totalOwnerFees).toFixed(4)} ETH</p>
          </div>
          <div className="overview-item">
            <h3>NFTs</h3>
            <p>{nfts.length}</p>
          </div>
          <div className="overview-item">
            <h3>Frames</h3>
            <p>{frames.length}</p>
          </div>
        </div>
        <div className="dashboard-sections">
          <div
            onClick={() => {
              if (isConnected) {
                handleSectionClick("NFTs")
              } else {
                setMessageContent(
                  "You must connect your wallet to start your dashboard and access the NFTs section."
                )
                setShowMessage(true)
              }
            }}
            className={`dashboard-section ${
              activeSection === "NFTs" ? "selected" : ""
            }`}
          >
            <h2>NFTs</h2>
          </div>

          <div
            onClick={() => {
              if (isConnected) {
                handleSectionClick("Frames")
              } else {
                setMessageContent(
                  "You must connect your wallet to start your dashboard and access the Frames section."
                )
                setShowMessage(true)
              }
            }}
            className={`dashboard-section ${
              activeSection === "Frames" ? "selected" : ""
            }`}
          >
            <h2>Frames</h2>
          </div>

          <div
            onClick={() => {
              if (isConnected) {
                handleSectionClick("SafeMemes")
              } else {
                setMessageContent(
                  "You must connect your wallet to start your dashboard and access the SafeMemes section."
                )
                setShowMessage(true)
              }
            }}
            className={`dashboard-section ${
              activeSection === "SafeMemes" ? "selected" : ""
            }`}
          >
            <h2>SafeMemes</h2>
          </div>

          <div
            onClick={() => {
              if (isConnected) {
                handleSectionClick("Rewards")
              } else {
                setMessageContent(
                  "You must connect your wallet to start your dashboard and access the Rewards section."
                )
                setShowMessage(true)
              }
            }}
            className={`dashboard-section ${
              activeSection === "Rewards" ? "selected" : ""
            }`}
          >
            <h2>Rewards</h2>
          </div>

          <div
            onClick={() => {
              if (isConnected) {
                handleSectionClick("CreateAirdrop")
              } else {
                setMessageContent(
                  "You must connect your wallet to start your dashboard and access the Create Airdrop section."
                )
                setShowMessage(true)
              }
            }}
            className={`dashboard-section ${
              activeSection === "CreateAirdrop" ? "selected" : ""
            }`}
          >
            <h2>Create Airdrop</h2>
          </div>
        </div>
        {showMessage && (
          <div className="overlay" style={{ opacity }}>
            <div className="message-box">
              <p>{messageContent}</p>
            </div>
          </div>
        )}

        <div className="section-content">
          {activeSection === "NFTs" && (
            <div className="nft-container">
              <h2 className="sectionTitle">Your NFTs</h2>
              {isLoadingNFTs ? (
                <p>Loading NFTs...</p>
              ) : nfts.length > 0 ? (
                <div className="nft-grid">
                  {nfts.map((nft) => (
                    <div key={`${nft.chainId}-${nft.id}`} className="nft-item">
                      <img src={nft.image} alt={nft.name} />
                      <p>{nft.name}</p>
                      <p>
                        Chain:{" "}
                        {chains.find((chain) => chain.id === nft.chainId)
                          ?.name || "Unknown"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No NFTs found.</p>
              )}
            </div>
          )}
          {activeSection === "Frames" && (
            <div>
              <div>
                <p className="sectionBody">
                  Soon you will be able to create and launch Frames on Warpcast
                  straight from here. We will store the NFTs on Arweave for
                  permanent decentralization and mint them on the Base
                  blockchain for Farcaster interoperability.
                </p>
              </div>
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
            <div className="create-airdrop-container">
              <h2 className="sectionTitle">Create Airdrop</h2>

              <div className="airdrop-options">
                <button
                  className={`option-button ${
                    airdropOption === "new" ? "selected" : ""
                  }`}
                  onClick={() => setAirdropOption("new")}
                >
                  New Airdrop
                </button>
                <button
                  className={`option-button ${
                    airdropOption === "existing" ? "selected" : ""
                  }`}
                  onClick={() => setAirdropOption("existing")}
                >
                  Existing Lists
                </button>
                <button
                  className={`option-button ${
                    airdropOption === "custom" ? "selected" : ""
                  }`}
                  onClick={() => setAirdropOption("custom")}
                >
                  Create Custom List
                </button>
              </div>

              {airdropOption === "new" && (
                <div className="airdrop-form">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Token Address"
                      value={airdropTokenAddress}
                      onChange={(e) => setAirdropTokenAddress(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Amount per Address"
                      value={airdropAmount}
                      onChange={(e) => setAirdropAmount(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Duration (in days)"
                      value={airdropDuration}
                      onChange={(e) => setAirdropDuration(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <button onClick={createAirdrop} className="buy-token-button">
                    Create Airdrop
                  </button>
                </div>
              )}

              {airdropOption === "existing" && (
                <div className="existing-lists">
                  <h3 className="stagetext">Select from Existing Lists</h3>
                  <div className="list-selection">
                    <h4>Custom Lists</h4>
                    {userCustomLists.map((list) => (
                      <div key={list.id} className="list-option">
                        <input
                          type="radio"
                          id={`list-${list.id}`}
                          name="selectedList"
                          value={list.id}
                          onChange={async (e) => {
                            const selectedListId = Number(e.target.value)
                            setSelectedListId(selectedListId)
                            setAirdropRecipients([]) // Clear token holder selection

                            try {
                              if (!provider || !chainId) {
                                const web3Provider =
                                  new ethers.providers.Web3Provider(
                                    window.ethereum
                                  )
                                setProvider(web3Provider)
                              }

                              if (!provider || !chainId) {
                                throw new Error(
                                  "Provider or chainId is not available"
                                )
                              }

                              const signer = provider.getSigner()
                              const customAirdropContractAddress =
                                customAirdropContract[chainId]
                              if (!customAirdropContractAddress) {
                                throw new Error(
                                  "Custom Airdrop contract address is missing"
                                )
                              }

                              const contract = new ethers.Contract(
                                customAirdropContractAddress,
                                CustomAirdropABI,
                                signer
                              )

                              const [name, , recipients] =
                                await contract.getList(selectedListId)
                              setAirdropRecipients(recipients)
                              setCustomListName(name)
                            } catch (error) {
                              console.error("Error fetching recipients:", error)
                              alert(
                                `Failed to fetch recipients for the selected list: ${error.message}`
                              )
                            }
                          }}
                          checked={selectedListId === list.id}
                        />
                        <label htmlFor={`list-${list.id}`}>{list.name}</label>
                      </div>
                    ))}

                    <h4>Token Holders</h4>
                    {tokens.map((token) => (
                      <div key={token.address} className="list-option">
                        <input
                          type="checkbox"
                          id={token.address}
                          value={token.holders ? token.holders.join(",") : ""}
                          onChange={(e) => {
                            if (!token.holders) return
                            const addresses = e.target.value
                              .split(",")
                              .filter(Boolean)
                            if (e.target.checked) {
                              setAirdropRecipients((prev) => [
                                ...new Set([...prev, ...addresses]),
                              ])
                              setSelectedListId(null) // Clear custom list selection
                            } else {
                              setAirdropRecipients((prev) =>
                                prev.filter((addr) => !addresses.includes(addr))
                              )
                            }
                          }}
                        />
                        <label htmlFor={token.address}>
                          {token.symbol} Holders
                        </label>
                      </div>
                    ))}
                  </div>

                  {selectedListId !== null && (
                    <div className="edit-list-form">
                      <h4>Edit Selected List</h4>
                      <div className="input-group">
                        <input
                          type="text"
                          value={customListName}
                          onChange={(e) => setCustomListName(e.target.value)}
                          placeholder="List Name"
                          className="input-field"
                        />
                      </div>
                      <div className="input-group">
                        <textarea
                          value={airdropRecipients.join("\n")}
                          onChange={(e) =>
                            setAirdropRecipients(e.target.value.split("\n"))
                          }
                          placeholder="Enter addresses (one per line)"
                          className="input-field"
                          rows={5}
                        />
                      </div>
                      <button
                        onClick={updateCustomList}
                        className="buy-token-button"
                      >
                        Update List
                      </button>
                    </div>
                  )}

                  <p className="selected-count">
                    Selected Addresses:{" "}
                    {selectedListId !== null
                      ? "Custom List"
                      : airdropRecipients.length}
                  </p>
                  <div className="input-group">
                    <select
                      value={airdropTokenAddress}
                      onChange={(e) => setAirdropTokenAddress(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select a token from your wallet</option>
                      {tokens.map((token) => (
                        <option key={token.address} value={token.address}>
                          {token.symbol} - {token.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Amount per Address"
                      value={airdropAmount}
                      onChange={(e) => setAirdropAmount(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <button
                    onClick={airdropToCustomList}
                    className="buy-token-button"
                  >
                    Create Airdrop with Selected List
                  </button>
                </div>
              )}

              {airdropOption === "custom" && (
                <div className="custom-list-form">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="List Name"
                      value={customListName}
                      onChange={(e) => setCustomListName(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="input-group">
                    <textarea
                      placeholder="Enter addresses (one per line)"
                      value={customListAddresses}
                      onChange={(e) => setCustomListAddresses(e.target.value)}
                      className="input-field"
                      rows={5}
                    />
                  </div>
                  <button
                    onClick={createCustomList}
                    className="buy-token-button"
                  >
                    Create Custom List
                  </button>
                </div>
              )}
            </div>
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
                        {parseFloat(token.maxTokens).toLocaleString()}
                      </p>

                      {token.dexAddress && (
                        <div className="fee-display">
                          <h4>Past Transaction Fees</h4>
                          <table>
                            <thead>
                              <tr>
                                <th>Timestamp</th>
                                <th>Swap Fee</th>
                                <th>Owner Fee</th>
                                <th>House Fee</th>
                              </tr>
                            </thead>
                            <tbody>
                              {fees.map((fee, index) => (
                                <tr key={index}>
                                  <td>{fee.timestamp}</td>
                                  <td>{fee.swapFee} ETH</td>
                                  <td>{fee.ownerFee} ETH</td>
                                  <td>{fee.houseFee} ETH</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {!token.safeLaunchInitialized && (
                        <p>
                          <strong>SafeLaunch Status:</strong> Not Started
                        </p>
                      )}
                      {token.safeLaunchInitialized &&
                        !token.safeLaunchStarted && (
                          <p>
                            <strong>SafeLaunch Status:</strong> Initialized
                          </p>
                        )}
                      {token.safeLaunchStarted && (
                        <>
                          <p>
                            <strong>SafeLaunch Status:</strong> Active
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
                          <p>
                            <strong>Available {token.symbol}</strong>
                            <a>
                              {(
                                parseFloat(token.totalSupply) * 0.1
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              })}
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

                          {token.stageInfo && (
                            <div className="stages-container">
                              <div className="stage-title">
                                <strong>SafeLaunch Stages</strong>
                              </div>
                              {token.stageInfo &&
                                token.stageInfo.map((stage, index) => (
                                  <div
                                    key={index}
                                    className={`stage ${
                                      stage.status === 3
                                        ? "completed"
                                        : stage.status === 2
                                        ? "open-and-set"
                                        : stage.status === 1
                                        ? "open-but-not-set"
                                        : "not-open"
                                    }`}
                                  >
                                    <h4 className="stage-number">
                                      Stage {index + 1}
                                    </h4>

                                    {stage.status === 3 ? (
                                      <div className="stage-completed">
                                        <p>Stage Completed</p>
                                        <p>
                                          Price:{" "}
                                          {parseFloat(
                                            stage.safeMemePrice
                                          ).toFixed(6)}{" "}
                                          {selectedTokenBName} per{" "}
                                          <span className="secondary-dark-color">
                                            {token.symbol}
                                          </span>
                                        </p>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="stage-details">
                                          <div className="secondary-dark-color stage-detail-item">
                                            <p>
                                              Available{" "}
                                              <span className="secondary-dark-color">
                                                {token.symbol}
                                              </span>
                                              :
                                            </p>
                                            <p>
                                              {parseFloat(
                                                stage.safeMemeRemaining
                                              ).toLocaleString()}
                                            </p>
                                          </div>
                                          <div className="stage-detail-item">
                                            <p>
                                              Sold{" "}
                                              <span className="secondary-dark-color">
                                                {token.symbol}
                                              </span>
                                              :
                                            </p>
                                            <p>
                                              {parseFloat(
                                                stage.safeMemesSoldThisStage
                                              ).toLocaleString()}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="stage-details">
                                          <div className="stage-detail-item">
                                            <p>
                                              Required{" "}
                                              <span className="primary-dark-color">
                                                {selectedTokenBName}
                                              </span>
                                              :
                                            </p>
                                            <p>
                                              {parseFloat(
                                                stage.tokenBRequired
                                              ).toLocaleString()}{" "}
                                              <span className="primary-dark-color">
                                                {selectedTokenBName}
                                              </span>
                                            </p>
                                          </div>
                                          <div className="stage-detail-item">
                                            <p>
                                              Received{" "}
                                              <span className="primary-dark-color">
                                                {selectedTokenBName}
                                              </span>
                                              :
                                            </p>
                                            <p>
                                              {parseFloat(
                                                stage.tokenBReceived
                                              ).toLocaleString()}{" "}
                                              <span className="primary-dark-color">
                                                {selectedTokenBName}
                                              </span>
                                            </p>
                                          </div>
                                        </div>
                                        <div className="stage-details">
                                          <div className="stage-detail-item">
                                            <p>
                                              Price:{" "}
                                              {(
                                                1 /
                                                parseFloat(stage.safeMemePrice)
                                              ).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                              })}{" "}
                                              <span className="primary-dark-color">
                                                {token.tokenBSymbol ||
                                                  token.tokenBName ||
                                                  selectedTokenBName ||
                                                  "Token B"}
                                              </span>{" "}
                                              per{" "}
                                              <span className="secondary-dark-color">
                                                {token.symbol}
                                              </span>
                                              <br />
                                              Or:{" "}
                                              {formatSignificantDigits(
                                                parseFloat(stage.safeMemePrice)
                                              )}{" "}
                                              <span className="secondary-dark-color">
                                                {token.symbol}
                                              </span>{" "}
                                              per{" "}
                                              <span className="primary-dark-color">
                                                {token.tokenBSymbol ||
                                                  token.tokenBName ||
                                                  selectedTokenBName ||
                                                  "Token B"}
                                              </span>
                                            </p>
                                          </div>
                                        </div>
                                        {token.currentStage !== undefined &&
                                          token.currentStage === index && (
                                            <div className="stage-actions">
                                              {token.tokenB &&
                                              token.tokenB !==
                                                "0x0000000000000000000000000000000000000000" &&
                                              !stage.tokenBRequired_set ? (
                                                <>
                                                  {stage.status === 1 && (
                                                    <>
                                                      <input
                                                        type="number"
                                                        id={`amount-${token.currentStage}`}
                                                        value={
                                                          tokenBAmountInputs[
                                                            token.currentStage!
                                                          ] || ""
                                                        }
                                                        onChange={(e) =>
                                                          handleTokenBAmountChange(
                                                            token.currentStage!,
                                                            e.target.value
                                                          )
                                                        }
                                                        placeholder={`Amount `}
                                                        className="input-field"
                                                      />
                                                      <button
                                                        className="buy-token-button"
                                                        onClick={() =>
                                                          setTokenBAmount(
                                                            token.address,
                                                            token.currentStage ??
                                                              0,
                                                            tokenBAmountInputs[
                                                              token.currentStage!
                                                            ] ?? 0
                                                          )
                                                        }
                                                      >
                                                        Set Token B Amount for
                                                        Stage{" "}
                                                        {token.currentStage +
                                                          1 ?? 0}
                                                      </button>
                                                    </>
                                                  )}
                                                </>
                                              ) : (
                                                <p></p>
                                              )}
                                            </div>
                                          )}
                                      </>
                                    )}
                                  </div>
                                ))}

                              {token.currentStage == SAFE_LAUNCH_STAGES && (
                                <div className="dex-stage">
                                  <h3>Permanent DEX</h3>
                                  <p>
                                    50% of locked SafeMemes and all received
                                    Token B are paired in the DEX.
                                  </p>
                                  {/* Add more DEX-specific information here */}
                                </div>
                              )}
                            </div>
                          )}
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

export default MyProfile
