"use client"

import React, { useEffect, useState } from "react"
import {
  NativeTokens,
  oracleDetails,
  priceFeedAddresses,
  rpcUrls,
  safeLaunchFactory,
} from "@/Constants/config"
import { ethers } from "ethers"
import { toast } from "react-toastify"
import {
  useAccount,
  useContractRead,
  useContractReads,
  useNetwork,
} from "wagmi"

import "react-toastify/dist/ReactToastify.css"
import { Navbar } from "@/components/walletconnect/walletconnect"

import "./swap.css"
import { ExchangeABI } from "@/ABIs/SafeLaunch/Exchange"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"

const TokenSwap: React.FC<{
  tokenAddress: string | null
  hideNavbar?: boolean
}> = ({ tokenAddress, hideNavbar }) => {
  const { chain } = useNetwork()
  const { address, isConnected } = useAccount()
  const [tokenPrices, setTokenPrices] = useState<{
    [key: string]: { [symbol: string]: number | null }
  }>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedTokenFrom, setSelectedTokenFrom] = useState<string | null>(
    null
  )
  const [selectedTokenTo, setSelectedTokenTo] = useState<string | null>(null)
  const [amount, setAmount] = useState<number>(1)
  const [estimatedOutput, setEstimatedOutput] = useState<number>(0)
  const [deployedTokens, setDeployedTokens] = useState<any[]>([]) // State to store fetched tokens
  const [walletTokens, setWalletTokens] = useState<any[]>([]) // State to store wallet tokens
  const [isClient, setIsClient] = useState(false) // State to track if we are on the client
  const [stageInfo, setStageInfo] = useState(null)
  const [currentStage, setCurrentStage] = useState(0)
  const [tokenPrice, setTokenPrice] = useState(0)
  const [dexStageTokens, setDexStageTokens] = useState<any[]>([])
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null)
  const [tokenFactoryContract, setTokenFactoryContract] =
    useState<ethers.Contract | null>(null)

  const chainId = chain ? chain.id : Object.keys(safeLaunchFactory)[0]

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const chainId = chain ? chain.id : Object.keys(safeLaunchFactory)[0]
        const web3Provider = new ethers.providers.Web3Provider(
          window.ethereum,
          {
            chainId: Number(chainId),
            name: "unknown", // This effectively disables ENS without type errors
          }
        )
        setProvider(web3Provider)

        const contract = new ethers.Contract(
          safeLaunchFactory[chainId] as `0x${string}`,
          TokenFactoryABI,
          web3Provider
        )
        setTokenFactoryContract(contract)
      } catch (error) {
        console.error("Error initializing provider or contract:", error)
        // Handle the error appropriately, maybe set an error state
      }
    }
  }, [chain])

  const { data: contractsCount, error: contractsCountError } = useContractRead({
    address: safeLaunchFactory[chainId] as `0x${string}`,
    abi: TokenFactoryABI,
    functionName: "getDeployedTokenCount",
  })

  const { data: allContracts, error: allContractsError } = useContractReads({
    contracts: contractsCount
      ? Array.from({ length: Number(contractsCount) }, (_, i) => ({
          address: safeLaunchFactory[chainId] as `0x${string}`,
          abi: TokenFactoryABI,
          functionName: "tokensDeployed",
          args: [i],
        }))
      : [],
    enabled: contractsCount > 0,
  })

  useEffect(() => {
    if (allContractsError) {
      console.error("All Contracts Error: ", allContractsError)
    }
    if (allContracts) {
      console.log("All Contracts: ", allContracts)
    }
  }, [allContracts, allContractsError])

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

  const fetchAllTokenData = async () => {
    try {
      const allTokens = await getAllTokens()
      console.log("All Tokens:", allTokens) // Debugging log
      if (!allTokens || allTokens.length === 0) return
      const userTokens = await getUserTokens(address!)
      console.log("User Tokens:", userTokens) // Debugging log
      if (!userTokens) return
      const tokenData = await Promise.all(
        allTokens.map(async (tokenAddress) => {
          const details = await getTokenDetails(tokenAddress)
          const stages = await getStageDetails(tokenAddress)
          return { ...details, stages }
        })
      )
      console.log("Token Data:", tokenData) // Debugging log

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
      console.log("Deployed Token Data:", deployedTokenData) // Debugging log

      setDeployedTokens(deployedTokenData)
    } catch (error) {
      console.error("Error fetching token data: ", error)
    }
  }

  const fetchDEXStageTokens = async () => {
    if (!provider || !tokenFactoryContract) return

    const allTokens = await getAllTokens()
    const dexStageTokens = await Promise.all(
      allTokens.map(async (tokenAddress) => {
        const tokenContract = new ethers.Contract(
          tokenAddress,
          SafeMemeABI,
          provider
        )
        const exchangeContract = new ethers.Contract(
          tokenAddress,
          ExchangeABI,
          provider
        )

        try {
          const [name, symbol, safeLaunchComplete] = await Promise.all([
            tokenContract.name(),
            tokenContract.symbol(),
            exchangeContract.safeLaunchComplete(),
          ])

          if (safeLaunchComplete) {
            return {
              address: tokenAddress,
              name,
              symbol,
              chainId,
            }
          }
        } catch (error) {
          console.error(
            `Error fetching DEX stage token ${tokenAddress}:`,
            error
          )
        }

        return null
      })
    )

    return dexStageTokens.filter((token) => token !== null)
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

    console.log("Token Balances:", tokenBalances) // Debugging log

    setWalletTokens(
      tokenBalances.filter((token) => parseFloat(token.balance) > 0)
    )
  }

  useEffect(() => {
    if (isClient && isConnected) {
      fetchAllTokenData()
      fetchDEXStageTokens().then((tokens) => {
        setDexStageTokens(tokens)
      })
    }
  }, [isClient, isConnected, chain, address, tokenFactoryContract])

  const fetchTokenPrices = async () => {
    const allTokenPrices: {
      [key: string]: { [symbol: string]: number | null }
    } = {}

    const aggregatorV3InterfaceABI = [
      {
        inputs: [],
        name: "latestRoundData",
        outputs: [
          { internalType: "uint80", name: "roundId", type: "uint80" },
          { internalType: "int256", name: "answer", type: "int256" },
          { internalType: "uint256", name: "startedAt", type: "uint256" },
          { internalType: "uint256", name: "updatedAt", type: "uint256" },
          {
            internalType: "uint80",
            name: "answeredInRound",
            type: "uint80",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ]

    for (const [chainId, tokens] of Object.entries(NativeTokens)) {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrls[chainId])
      const chainPrices: { [symbol: string]: number | null } = {}

      for (const token of tokens) {
        const priceFeedAddress =
          priceFeedAddresses[chainId]?.[`${token.symbol}/USD`]
        if (!priceFeedAddress) continue

        try {
          const priceFeed = new ethers.Contract(
            priceFeedAddress,
            aggregatorV3InterfaceABI,
            provider
          )
          const roundData = await priceFeed.latestRoundData()
          const price = parseFloat(
            ethers.utils.formatUnits(roundData.answer, 8)
          )
          chainPrices[token.symbol] = price
        } catch (error) {
          console.error(`Error fetching price for ${token.symbol}:`, error)
          chainPrices[token.symbol] = null
        }
      }

      allTokenPrices[chainId] = chainPrices
    }

    setTokenPrices(allTokenPrices)
    setLoading(false)
  }

  useEffect(() => {
    fetchTokenPrices()
  }, [])

  useEffect(() => {
    fetchWalletTokens()
  }, [address, deployedTokens])

  const handleTokenFromChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = event.target.value
    setSelectedTokenFrom(selectedValue)

    if (selectedValue) {
      const [selectedChainId, selectedSymbol] = selectedValue.split("-")
      const walletToken = walletTokens.find(
        (token) =>
          token.chainId === selectedChainId && token.symbol === selectedSymbol
      )
      if (walletToken) {
        setAmount(parseFloat(walletToken.balance))
      }
    }
  }

  const handleTokenToChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTokenTo(event.target.value)
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(parseFloat(event.target.value))
  }

  const handleQuickSelect = (percentage: number) => {
    // Example function, you can implement the logic to fetch the max amount user can trade
    const maxAmount = 100 // Example max amount
    setAmount((maxAmount * percentage) / 100)
  }

  const handleReverse = () => {
    const tempToken = selectedTokenFrom
    setSelectedTokenFrom(selectedTokenTo)
    setSelectedTokenTo(tempToken)
  }

  const fetchStageInfo = async (tokenAddress) => {
    if (typeof window !== "undefined" && window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      if (!provider || !tokenAddress) return

      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        provider
      )
      const currentStage = await tokenContract.getCurrentStage()
      const stageInfo = await tokenContract.getStageInfo(currentStage)

      setCurrentStage(currentStage)
      setStageInfo(stageInfo)
      setTokenPrice(stageInfo[1])
    }
  }

  // Call fetchStageInfo whenever the selectedTokenFrom changes
  useEffect(() => {
    if (selectedTokenFrom) {
      fetchStageInfo(selectedTokenFrom.split("-")[0])
    }
  }, [selectedTokenFrom])

  useEffect(() => {
    if (
      amount &&
      selectedTokenFrom &&
      selectedTokenTo &&
      tokenPrices[selectedTokenFrom.split("-")[0]] &&
      tokenPrices[selectedTokenTo.split("-")[0]]
    ) {
      const fromPrice =
        tokenPrices[selectedTokenFrom.split("-")[0]][
          selectedTokenFrom.split("-")[1]
        ]
      const toPrice =
        tokenPrices[selectedTokenTo.split("-")[0]][
          selectedTokenTo.split("-")[1]
        ]
      if (fromPrice && toPrice) {
        setEstimatedOutput((amount * fromPrice) / toPrice)
      }
    }
  }, [amount, selectedTokenFrom, selectedTokenTo, tokenPrices])

  const handleSwap = async () => {
    if (isConnected && amount > 0 && selectedTokenFrom && selectedTokenTo) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const tokenContract = new ethers.Contract(
          selectedTokenFrom.split("-")[0],
          SafeMemeABI,
          signer
        )

        // Calculate the amount in Wei
        const amountInWei = ethers.utils.parseUnits(amount.toString(), 18)
        const tokenBAddress = selectedTokenTo.split("-")[0]

        // Approve the token transfer if necessary
        await approveTokens(tokenBAddress, amountInWei)

        // Perform the swap
        await tokenContract.buyTokens(amountInWei, tokenBAddress, {
          gasLimit: ethers.utils.hexlify(1000000),
        })

        console.log(
          "Tokens swapped:",
          selectedTokenFrom,
          selectedTokenTo,
          amount
        )
        toast.success("Swap successful!")
      } catch (error) {
        console.error("Swap failed:", error)
        toast.error("Swap failed: " + error.message)
      }
    }
  }

  const approveTokens = async (tokenAddress, amount) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const tokenContract = new ethers.Contract(tokenAddress, SafeMemeABI, signer)
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 18)
    await tokenContract.approve(tokenAddress, amountInWei)
  }

  useEffect(() => {
    // Ensure this code runs only on the client
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Render nothing on the server
    return null
  }

  const getTokensForCurrentChain = () => {
    const currentChainId = chain ? chain.id : Object.keys(safeLaunchFactory)[0]
    return NativeTokens[currentChainId] || []
  }

  const allTokens = getTokensForCurrentChain().map((token) => ({
    chainId: chain ? chain.id : Object.keys(safeLaunchFactory)[0],
    ...token,
  }))

  // Combine native tokens and wallet tokens with balance
  const combinedTokens = [
    ...allTokens,
    ...walletTokens
      .filter((token) => parseFloat(token.balance) > 0)
      .map((token) => ({
        chainId,
        ...token,
      })),
    ...deployedTokens,
    ...dexStageTokens,
  ]

  return (
    <div>
      {!hideNavbar && <Navbar />}
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="swap-container">
            <h1 className="page-title">Token Swap</h1>
            <div className="swap-card">
              <div className="token-section">
                <label htmlFor="tokenFrom">From</label>
                <div className="token-amount-container">
                  <select
                    id="tokenFrom"
                    value={selectedTokenFrom ?? ""}
                    onChange={handleTokenFromChange}
                    className="input-field"
                  >
                    <option value="">Select Token</option>
                    {combinedTokens.map((token, index) => (
                      <option
                        key={index}
                        value={`${token.chainId}-${token.symbol}`}
                      >
                        {token.symbol}{" "}
                        {token.balance ? `(${token.balance})` : ""}
                      </option>
                    ))}
                  </select>
                  <div className="amount-container">
                    <div className="quick-select-buttons">
                      <button onClick={() => handleQuickSelect(25)}>25%</button>
                      <button onClick={() => handleQuickSelect(50)}>50%</button>
                      <button onClick={() => handleQuickSelect(75)}>75%</button>
                      <button onClick={() => handleQuickSelect(100)}>
                        Max
                      </button>
                    </div>
                    <div className="amount-input-with-price">
                      <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="Amount"
                        className="input-field-with-price"
                        inputMode="numeric"
                      />
                      <div className="price-info">
                        {selectedTokenFrom &&
                        tokenPrices[selectedTokenFrom.split("-")[0]]
                          ? `$${tokenPrices[selectedTokenFrom.split("-")[0]][
                              selectedTokenFrom.split("-")[1]
                            ]?.toFixed(4)}`
                          : "Select a token"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="reverse-button-container">
                <button className="reverse-button" onClick={handleReverse}>
                  &#x21C5;
                </button>
              </div>

              <div className="token-section">
                <label htmlFor="tokenTo">To</label>
                <div className="token-amount-container">
                  <select
                    id="tokenTo"
                    value={selectedTokenTo ?? ""}
                    onChange={handleTokenToChange}
                    className="input-field"
                  >
                    <option value="">Select Token</option>
                    {combinedTokens.map((token, index) => (
                      <option
                        key={index}
                        value={`${token.chainId}-${token.symbol}`}
                      >
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                  <div className="amount-containerTo">
                    <div className="quick-select-buttonsTo">
                      <button onClick={() => handleQuickSelect(25)}>25%</button>
                      <button onClick={() => handleQuickSelect(50)}>50%</button>
                      <button onClick={() => handleQuickSelect(75)}>75%</button>
                      <button onClick={() => handleQuickSelect(100)}>
                        Max
                      </button>
                    </div>
                    <div className="amount-input-with-price">
                      <input
                        type="number"
                        id="estimatedOutput"
                        value={estimatedOutput}
                        disabled
                        className="input-field-with-price"
                        inputMode="numeric"
                      />
                      <div className="price-info">
                        {selectedTokenTo &&
                        tokenPrices[selectedTokenTo.split("-")[0]]
                          ? `$${tokenPrices[selectedTokenTo.split("-")[0]][
                              selectedTokenTo.split("-")[1]
                            ]?.toFixed(4)}`
                          : "Select a token"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="swap-summary">
                <p>Exchange Rate: {tokenPrice || 0}</p>
                <p>Estimated Output: {estimatedOutput}</p>
                <p>Slippage: 0.5%</p>
                <p>Price Impact: 0.3%</p>
              </div>
              <button className="swap-button" onClick={handleSwap}>
                Swap
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default TokenSwap
