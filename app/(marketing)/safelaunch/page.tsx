"use client"

import { useCallback, useEffect, useState } from "react"
import { ExchangeABI } from "@/ABIs/SafeLaunch/Exchange"
import { ExchangeFactoryABI } from "@/ABIs/SafeLaunch/ExchangeFactory"
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
  exchangeFactory,
  exchangeTemplate,
  safeLaunchFactory,
} from "../../../Constants/config"
import "@/styles/safeLaunch.css"

export default function SafeLaunch(): JSX.Element {
  const [isClient, setIsClient] = useState(false)
  const [deployedTokenData, setDeployedTokenData] = useState<any[]>([])
  const [fetchingError, setFetchingError] = useState<string | null>(null)
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null)
  const [tokenFactoryContract, setTokenFactoryContract] =
    useState<ethers.Contract | null>(null)
  const [exchangeContract, setExchangeContract] =
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
  const [saleActive, setSaleActive] = useState(false)
  const [stageInfo, setStageInfo] = useState<
    [ethers.BigNumber, ethers.BigNumber] | null
  >(null)
  const [isLoadingTokenBDetails, setIsLoadingTokenBDetails] =
    useState<boolean>(false)
  const [tokensAvailable, setTokensAvailable] =
    useState<ethers.BigNumber | null>(null)
  const [tokensSold, setTokensSold] = useState<ethers.BigNumber | null>(null)
  const [stageSoldTokens, setStageSoldTokens] = useState<{
    [key: string]: string
  }>({})
  const chainId: string | number = chain ? chain.id : 250
  // State variables for contract addresses and other data
  const [tokenFactoryAddress, setTokenFactoryAddress] = useState(null)

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined" && window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(web3Provider)
      const chainId = chain ? chain.id : Object.keys(safeLaunchFactory)[0]
      const tokenFactory = new ethers.Contract(
        safeLaunchFactory[chainId],
        TokenFactoryABI,
        web3Provider
      )
      const exchange = new ethers.Contract(
        exchangeTemplate[chainId],
        ExchangeABI,
        web3Provider
      )
      setTokenFactoryContract(tokenFactory)
      setExchangeContract(exchange)
    }
  }, [chain])

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined" && window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(web3Provider)
      const chainId = chain ? chain.id : Object.keys(safeLaunchFactory)[0]
      const tokenFactory = new ethers.Contract(
        safeLaunchFactory[chainId],
        TokenFactoryABI,
        web3Provider
      )
      setTokenFactoryContract(tokenFactory)
    }
  }, [chain])

  const fetchDexAddressAndSaleStatus = async (tokenAddress) => {
    if (!provider) return

    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        provider
      )
      const dexAddr = await tokenContract.dexAddress()
      setDexAddress(dexAddr)

      if (dexAddr && dexAddr !== ethers.constants.AddressZero) {
        const exchangeContract = new ethers.Contract(
          dexAddr,
          ExchangeABI,
          provider
        )
        const isSaleActive = await exchangeContract.saleActive()
        setSaleActive(isSaleActive)
      }
    } catch (error) {
      console.error("Error fetching dexAddress and sale status:", error)
    }
  }

  const getAllTokens = async () => {
    try {
      if (!tokenFactoryContract) return []
      const tokenCount = await tokenFactoryContract.getDeployedSafeMemeCount({
        gasLimit: ethers.utils.hexlify(1000000),
      })
      const allTokens: string[] = []
      for (let i = 0; i < tokenCount; i++) {
        const tokenAddress: string =
          await tokenFactoryContract.safeMemesDeployed(i, {
            gasLimit: ethers.utils.hexlify(1000000),
          })
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
      const userTokens = await tokenFactoryContract.getSafeMemesDeployedByUser(
        userAddress,
        {
          gasLimit: ethers.utils.hexlify(2000000), // Increased gas limit
        }
      )
      return userTokens
    } catch (error) {
      console.error("Error fetching user tokens: ", error)
      return []
    }
  }

  const submitTokenBInfo = async (tokenAddress) => {
    try {
      if (!provider) {
        throw new Error("Provider not available")
      }

      const tokenBAddress = tokenBSelection[tokenAddress]
      console.log("Token B Address Retrieved:", tokenBAddress)
      if (!tokenBAddress) {
        throw new Error("Token B address must be provided")
      }

      const tokenBName = tokenBDetails[tokenBAddress]?.name || ""
      const tokenBSymbol = tokenBDetails[tokenBAddress]?.symbol || ""

      const signer = provider.getSigner()
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        signer
      )

      // Retrieve the exchange address from the SafeMeme contract
      const dexAddress = await tokenContract.dexAddress()
      if (!dexAddress || dexAddress === ethers.constants.AddressZero) {
        throw new Error(
          "Invalid exchange address retrieved from SafeMeme contract"
        )
      }

      // Use the retrieved exchange address to interact with the Exchange contract
      const exchangeContract = new ethers.Contract(
        dexAddress,
        ExchangeABI,
        signer
      )

      console.log("Token Address:", tokenAddress)
      console.log("Exchange Contract Address:", exchangeContract.address)
      console.log("Token B Address:", tokenBAddress)
      console.log("Token B Name:", tokenBName)
      console.log("Token B Symbol:", tokenBSymbol)

      // Check current state of the contract
      const currentTokenBAddress = await exchangeContract.tokenBAddress()
      console.log("Current Token B Address:", currentTokenBAddress)

      const gasLimit = 8000000 // Set a manual gas limit

      console.log("Sending transaction to set Token B details...")
      const tx = await exchangeContract.settokenBDetails(
        tokenBAddress,
        tokenBName,
        tokenBSymbol,
        { gasLimit }
      )
      console.log("Transaction sent:", tx.hash)

      await tx.wait()
      console.log("Transaction confirmed")

      toast.success(`Token B details set for token ${tokenAddress}`)

      // Refresh token data
      await fetchAllTokenData()
    } catch (error) {
      console.error(
        `Error setting Token B details for token ${tokenAddress}:`,
        error
      )
      toast.error(`Error setting Token B details: ${error.message}`)
    }
  }

  const initializeSafeLaunch = async (tokenAddress) => {
    try {
      const signer = provider.getSigner()
      const signerAddress = await signer.getAddress()
      console.log(`Signer Address: ${signerAddress}`)

      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        signer
      )
      console.log(`Contract Address: ${tokenContract.address}`)

      // Add logging to check the owner of the contract
      const contractOwner = await tokenContract.owner()
      console.log(`Contract Owner: ${contractOwner}`)

      const gasLimit = await tokenContract.estimateGas.initializeSafeLaunch()
      const tx = await tokenContract.initializeSafeLaunch({
        gasLimit: gasLimit.add(6200000), // Adding extra gas limit
      })
      await tx.wait()
      toast.success(`SafeLaunch initialized for token ${tokenAddress}`)
      fetchAllTokenData() // Refresh token data
    } catch (error) {
      console.error(
        `Error initializing SafeLaunch for token ${tokenAddress}:`,
        error
      )
      toast.error(`Error initializing SafeLaunch: ${error.message}`)
    }
  }

  const startSafeLaunch = async (tokenAddress) => {
    try {
      const signer = provider.getSigner()
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        signer
      )

      const gasLimit = await tokenContract.estimateGas.startSafeLaunch()
      const tx = await tokenContract.startSafeLaunch({
        gasLimit: gasLimit.add(6200000), // Adding extra gas limit
      })
      await tx.wait()
      toast.success(`SafeLaunch started for token ${tokenAddress}`)
      fetchAllTokenData() // Refresh token data
    } catch (error) {
      console.error(
        `Error starting SafeLaunch for token ${tokenAddress}:`,
        error
      )
      toast.error(`Error starting SafeLaunch: ${error.message}`)
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
        isSafeLaunched,
        dexAddress,
        isInitialized,
        lockedsafeMeme, // Fetch locked tokens
      ] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.totalSupply(),
        tokenContract.owner(),
        tokenContract.decimals(),
        tokenContract.antiWhalePercentage(),
        tokenContract.isSafeLaunched(),
        tokenContract.exchangeFactory(),
        tokenContract
          .dexAddress()
          .then((addr) => addr !== ethers.constants.AddressZero),
        getlockedsafeMeme(tokenAddress), // Fetch locked tokens here
      ])

      return {
        address: tokenAddress,
        name,
        symbol,
        totalSupply,
        owner,
        decimals,
        antiWhalePercentage,
        isSafeLaunched,
        dexAddress,
        isInitialized,
        lockedsafeMeme, // Include locked tokens in the returned details
      }
    } catch (error) {
      console.error(`Error fetching details for token ${tokenAddress}:`, error)
      return null
    }
  }

  const fetchTokenSaleData = async (tokenAddress: string) => {
    if (!provider || !exchangeContract) return

    try {
      const available = await exchangeContract.getTokensAvailable()
      const sold = await exchangeContract.getTokensSold()

      setTokensAvailable(available)
      setTokensSold(sold)
    } catch (error) {
      console.error(
        `Error fetching sale data for token ${tokenAddress}:`,
        error
      )
    }
  }

  const fetchStageLiquidity = async (tokenAddress, stage) => {
    if (!provider || !exchangeContract) return

    try {
      const [tokenBReceived, tokensSold] =
        await exchangeContract.getStageLiquidity(stage)
      return {
        tokensSold,
        tokenBReceived,
      }
    } catch (error) {
      console.error(
        `Error fetching stage liquidity for token ${tokenAddress}:`,
        error
      )
      return null
    }
  }

  const displayTokensSold = async (tokenAddress, stage) => {
    const liquidityData = await fetchStageLiquidity(tokenAddress, stage)
    if (liquidityData) {
      const { tokensSold } = liquidityData
      // Format and display the tokens sold
      return ethers.utils.formatUnits(tokensSold, 18)
    }
    return "N/A"
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

  const setStageTokenBAmount = async (tokenAddress, stage, amount) => {
    try {
      if (!provider) return

      const signer = provider.getSigner()
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        signer
      )
      const dexAddress = await tokenContract.dexAddress()
      const exchangeContract = new ethers.Contract(
        dexAddress,
        ExchangeABI,
        signer
      )

      // Check if the sale is active
      const saleActive = await exchangeContract.saleActive()
      console.log(`Sale active status for ${tokenAddress}:`, saleActive)
      if (!saleActive) {
        throw new Error("Sale not active")
      }

      const amountInWei = ethers.utils.parseUnits(amount.toString(), 18) // Convert to 18 decimals

      // Call the correct overloaded function
      const gasLimit = await exchangeContract.estimateGas[
        "setStagetokenBAmount(uint256,uint256)"
      ](stage, amountInWei)
      const tx = await exchangeContract[
        "setStagetokenBAmount(uint256,uint256)"
      ](stage, amountInWei, {
        gasLimit: gasLimit.add(100000),
      })
      await tx.wait()
      toast.success(
        `Token B amount set for stage ${stage} of token ${tokenAddress}`
      )
      fetchAllTokenData() // Refresh token data to get updated stage info
    } catch (error) {
      console.error(`Error setting Token B amount: ${error.message}`)
      toast.error(`Error setting Token B amount: ${error.message}`)
    }
  }

  const getlockedsafeMeme = async (tokenAddress) => {
    try {
      if (!provider) return ethers.BigNumber.from(0)

      // Assume SafeMeme contract has the exchange address
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        provider
      )
      const dexAddress = await tokenContract.dexAddress()

      if (dexAddress === ethers.constants.AddressZero) {
        return ethers.BigNumber.from(0)
      }

      const exchangeContract = new ethers.Contract(
        dexAddress,
        ExchangeABI,
        provider
      )
      const lockedsafeMeme = await exchangeContract.lockedsafeMeme()

      return lockedsafeMeme
    } catch (error) {
      console.error(`Error fetching locked tokens for ${tokenAddress}:`, error)
      return ethers.BigNumber.from(0)
    }
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
    setTokenBSelection((prev) => ({ ...prev, [tokenAddress]: tokenBAddress }))
    // Also update the selectedToken state if necessary
    setSelectedToken((prev) => ({ ...prev, tokenBAddress }))
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
          if (details) {
            await fetchDexAddressAndSaleStatus(tokenAddress)
            const stages = await getStageDetails(tokenAddress) // Ensure this call fetches data correctly
            const tokenBAddress = details.tokenBAddress
            const tokenBDetails = tokenBAddress
              ? await fetchTokenBDetails(tokenBAddress)
              : null
            return { ...details, stages, tokenBDetails }
          }
          return details
        })
      )
      const userTokenAddresses = new Set(
        userTokens.map((token) => token?.toLowerCase())
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

  const fetchWalletTokens = async () => {
    if (!isConnected || !address) return

    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const tokenBalances = await Promise.all(
      deployedTokens.map(async (token) => {
        if (token.address) {
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
        } else {
          console.error(`Token address is undefined for token:`, token)
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

  const fetchStageInfo = async (tokenAddress) => {
    if (!provider || !tokenAddress) return

    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        provider
      )

      const dexAddress = await tokenContract.dexAddress()
      if (!dexAddress || dexAddress === ethers.constants.AddressZero) {
        console.error("Invalid exchange address")
        return
      }

      const exchangeContract = new ethers.Contract(
        dexAddress,
        ExchangeABI,
        provider
      )
      const saleActive = await exchangeContract.saleActive()
      const isSafeLaunchActive = await exchangeContract.isSafeLaunchActive()

      if (!saleActive || !isSafeLaunchActive) {
        console.error("Sale or SafeLaunch is not active")
        toast.error("Sale or SafeLaunch is not active")
        return
      }

      const currentStage = await exchangeContract.getCurrentStage()
      const stageInfo = await exchangeContract.getStageInfo(currentStage)
      const tokenBAddress = await exchangeContract.tokenBAddress()

      console.log("Current Stage:", currentStage.toString())
      console.log("Stage Info:", stageInfo)
      console.log("Token B Address:", tokenBAddress)

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

  const getStageDetails = async (tokenAddress) => {
    try {
      if (!provider) return []

      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        provider
      )
      const dexAddress = await tokenContract.dexAddress()

      if (!dexAddress || dexAddress === ethers.constants.AddressZero) return []

      const exchangeContract = new ethers.Contract(
        dexAddress,
        ExchangeABI,
        provider
      )

      const stageDetails = await Promise.all(
        Array.from({ length: 5 }, async (_, i) => {
          try {
            const stage = await exchangeContract.getStageInfo(i, {
              gasLimit: ethers.utils.hexlify(5000000),
            })
            console.log(`Stage ${i} Details:`, stage)
            return stage
          } catch (error) {
            console.error(
              `Error fetching stage info for stage ${i} of token ${tokenAddress}:`,
              error
            )
            return [ethers.BigNumber.from(0), ethers.BigNumber.from(0)]
          }
        })
      )

      const formattedStageDetails = stageDetails.map((stage, index) => ({
        stage: index,
        tokenBRequired: stage[0],
        tokenPrice: stage[1],
      }))

      console.log("Formatted Stage Details:", formattedStageDetails)
      return formattedStageDetails
    } catch (error) {
      console.error(
        `Error fetching stage details for token ${tokenAddress}:`,
        error
      )
      return []
    }
  }

  useEffect(() => {
    if (selectedToken?.tokenAddress) {
      fetchStageInfo(selectedToken.tokenAddress)
    }
  }, [selectedToken?.tokenAddress, provider])

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value)
  }

  const handleSwap = async () => {
    if (!amount || !selectedToken || !provider || !exchangeContract) {
      toast.error("Please enter an amount and ensure wallet is connected")
      console.error("Token purchase failed due to missing parameters", {
        amount,
        selectedToken,
        provider,
      })
      return
    }

    const { tokenAddress, tokenBAddress } = selectedToken

    if (!tokenAddress || !tokenBAddress) {
      toast.error("Invalid token addresses")
      console.error("Token purchase failed due to invalid token addresses", {
        tokenAddress,
        tokenBAddress,
      })
      return
    }

    try {
      const parsedAmount = parseFloat(amount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        toast.error("Invalid amount entered")
        return
      }

      console.log(
        `Attempting to buy tokens with tokenAddress: ${tokenAddress} and tokenBAddress: ${tokenBAddress}`
      )
      const signer = provider.getSigner()
      const tokenBContract = new ethers.Contract(
        tokenBAddress,
        SafeMemeABI,
        signer
      )
      const exchangeSigner = exchangeContract.connect(signer)

      // Convert the amount to the correct units
      const amountInWei = ethers.utils.parseUnits(amount, 18)

      // Approve the Exchange contract to spend Token B
      console.log("Approving token spend...")
      const approveTx = await tokenBContract.approve(
        exchangeSigner.address,
        amountInWei
      )
      await approveTx.wait()
      console.log("Approval successful")
      toast.info("Approval successful. Proceeding with token purchase...")

      // Check if the sale is active immediately before attempting the purchase
      const saleActive = await updateSaleStatus(exchangeSigner)
      if (!saleActive) {
        toast.error("Sale is not active")
        console.error("Sale is not active")
        return
      }

      // Validate the current stage and amount set
      const currentStage = await exchangeSigner.getCurrentStage()
      console.log(`Current stage: ${currentStage}`)

      const stageInfo = await exchangeSigner.getStageInfo(currentStage)
      console.log(`Stage info: ${JSON.stringify(stageInfo)}`)

      // Ensure stage is set and valid
      if (!stageInfo || stageInfo[0].eq(0)) {
        toast.error("Current stage is not properly set")
        console.error("Current stage is not properly set")
        return
      }

      // Manually set a gas limit if gas estimation fails
      let gasLimit
      try {
        console.log("Estimating gas for token purchase...")
        const gasEstimate = await exchangeSigner.estimateGas.buyTokens(
          amountInWei
        )
        gasLimit = gasEstimate.mul(120).div(100)
      } catch (gasEstimationError) {
        console.error(
          "Gas estimation failed, setting manual gas limit:",
          gasEstimationError
        )
        gasLimit = ethers.BigNumber.from("8000000") // Set a manual gas limit
      }

      console.log(`Gas limit: ${gasLimit}`)

      console.log("Executing token purchase...")
      // Perform the token purchase with increased gas limit
      const buyTx = await exchangeSigner.buyTokens(amountInWei, { gasLimit })
      console.log("Token purchase transaction sent:", buyTx.hash)
      await buyTx.wait()
      console.log("Token purchase transaction confirmed")
      toast.success("Token purchase successful!")
      fetchStageInfo(tokenAddress)
    } catch (error) {
      console.error("Detailed error during token purchase:", error)
      if (error.reason) {
        console.error("Error reason:", error.reason)
      }
      if (error.data) {
        console.error("Error data:", error.data)
      }
      toast.error(`Token purchase failed: ${error.message}`)
    }
  }

  const updateSaleStatus = async (exchangeSigner) => {
    try {
      const saleActive = await exchangeSigner.saleActive()
      console.log(`Updated sale active status: ${saleActive}`)
      return saleActive
    } catch (error) {
      console.error("Error fetching sale status:", error)
      return false
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
    const fetchSoldTokens = async () => {
      const soldTokensData: { [key: string]: string } = {}
      for (const token of deployedTokenData) {
        if (token.saleActive) {
          const sold = await displayTokensSold(
            token.address,
            token.currentStage
          )
          soldTokensData[`${token.address}-${token.currentStage}`] = sold
        }
      }
      setStageSoldTokens(soldTokensData)
    }

    if (deployedTokenData.length > 0) {
      fetchSoldTokens()
    }
  }, [deployedTokenData])

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

  useEffect(() => {
    if (!provider || !selectedToken?.tokenAddress) return

    const tokenAddress = selectedToken.tokenAddress

    const signer = provider.getSigner()
    const tokenContract = new ethers.Contract(tokenAddress, SafeMemeABI, signer)

    const handleSafeLaunched = (token) => {
      console.log(`SafeLaunch started for token ${token}`)
      toast.success(`SafeLaunch started for token ${token}`)
      // Fetch updated token data to reflect the new sale status
      fetchAllTokenData()
    }

    tokenContract.on("SafeLaunched", handleSafeLaunched)

    return () => {
      tokenContract.off("SafeLaunched", handleSafeLaunched)
    }
  }, [provider, selectedToken?.tokenAddress])

  const formatNumber = (
    number: ethers.BigNumber | null | undefined,
    decimals: number
  ) => {
    if (!number || number.isZero()) {
      return "0"
    }
    try {
      return ethers.utils.commify(ethers.utils.formatUnits(number, decimals))
    } catch (error) {
      console.error("Error formatting number:", error)
      return "0" // or any appropriate default value
    }
  }

  const displayTokenBRequired = (amount: ethers.BigNumber | undefined) => {
    if (!amount) {
      console.error("Invalid amount value:", amount)
      return "0" // or any appropriate default value
    }
    return formatNumber(amount, 18)
  }

  const getBlockExplorerLink = (address: string) => {
    return `${blockExplorerAddress[chainId] || ""}${address}`
  }

  const shortenAddress = (address: string | undefined) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-6)}`
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

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="dashboard">
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
                          <p>
                            <strong>Max Wallet Amount:</strong>{" "}
                            {formatNumber(
                              token.totalSupply && token.antiWhalePercentage
                                ? token.totalSupply
                                    .mul(token.antiWhalePercentage)
                                    .div(100)
                                : ethers.BigNumber.from(0),
                              token.decimals
                            )}
                          </p>
                          <p>
                            <strong>Locked Tokens:</strong>{" "}
                            {formatNumber(token.lockedsafeMeme, token.decimals)}
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

                          {!token.isInitialized && (
                            <button
                              onClick={() =>
                                initializeSafeLaunch(token.address)
                              }
                              className="initialize-launch-button"
                            >
                              Initialize SafeLaunch
                            </button>
                          )}

                          {token.isInitialized && !token.isSafeLaunched && (
                            <button
                              onClick={() => startSafeLaunch(token.address)}
                              className="start-launch-button"
                            >
                              Start SafeLaunch
                            </button>
                          )}

                          {token.isSafeLaunched && <p>SafeLaunch active</p>}
                          <button
                            onClick={() => {
                              console.log(
                                "Current Token B Selection:",
                                selectedToken?.tokenBAddress
                              )
                              submitTokenBInfo(token.address)
                            }}
                            disabled={
                              !selectedToken?.tokenBAddress ||
                              !token.isInitialized
                            }
                          >
                            Submit Token B Info
                          </button>

                          <div className="stages-container">
                            {token.stages.map((stage, stageIndex) => (
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
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value)
                                      if (!isNaN(value)) {
                                        handleTokenBAmountChange(
                                          token.address,
                                          stageIndex,
                                          value
                                        )
                                      }
                                    }}
                                  />
                                </label>
                                {token.isSafeLaunched &&
                                stageIndex <= currentStage ? (
                                  <>
                                    <div className="stagetext">
                                      <p>
                                        <strong>{token.name} Price:</strong>{" "}
                                        {ethers.utils.formatUnits(
                                          stage.tokenPrice,
                                          token.decimals
                                        )}{" "}
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
                                        <strong>
                                          Tokens remaining for sale:
                                        </strong>{" "}
                                        {formatNumber(
                                          ethers.BigNumber.from(
                                            token.totalSupply
                                          )
                                            .mul(5)
                                            .div(100)
                                            .sub(
                                              ethers.BigNumber.from(
                                                ethers.utils.parseUnits(
                                                  stageSoldTokens[
                                                    `${token.address}-${stageIndex}`
                                                  ] || "0",
                                                  token.decimals
                                                )
                                              )
                                            ),
                                          token.decimals
                                        )}
                                      </p>
                                      <p>
                                        <strong>
                                          Tokens Sold in Current Stage:
                                        </strong>{" "}
                                        {stageSoldTokens[
                                          `${token.address}-${stageIndex}`
                                        ] || "Loading..."}
                                      </p>
                                      <p>
                                        <strong>Token B Required:</strong>{" "}
                                        {displayTokenBRequired(
                                          stage.tokenBRequired
                                        )}
                                      </p>
                                      <p>
                                        <strong>Token B:</strong>{" "}
                                        {combinedTokens.find(
                                          (token) =>
                                            token.address ===
                                            selectedToken?.tokenBAddress
                                        )?.symbol || "Token B"}
                                      </p>
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
                                  className="submit-token-b-amounts-button"
                                  onClick={() =>
                                    handleSubmitTokenBAmounts(token.address)
                                  }
                                >
                                  Submit Token B Info
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
