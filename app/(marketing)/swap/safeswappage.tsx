"use client"

import React, { useEffect, useState } from "react"
import {
  oracleDetails,
  priceFeedAddresses,
  rpcUrls,
  safeLaunchFactory,
  tokenBOptions,
} from "@/Constants/config"
import { ethers } from "ethers"
import {
  useAccount,
  useContractRead,
  useContractReads,
  useNetwork,
} from "wagmi"

import { Navbar } from "@/components/walletconnect/walletconnect"

import "./swap.css"
import { erc20ABI } from "@/ABIs/erc20"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"

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
  const [deployedTokens, setDeployedTokens] = useState([]) // State to store fetched tokens
  const [walletTokens, setWalletTokens] = useState([]) // State to store wallet tokens
  const [isClient, setIsClient] = useState(false) // State to track if we are on the client

  const chainId = chain ? chain.id : Object.keys(safeLaunchFactory)[0]

  const { data: contractsCount, error: contractsCountError } = useContractRead({
    address: safeLaunchFactory[chainId] as `0x${string}`,
    abi: tokenDeployerABI,
    functionName: "getDeployedTokenCount",
  })

  const { data: allContracts, error: allContractsError } = useContractReads({
    contracts: contractsCount
      ? Array.from({ length: Number(contractsCount) }, (_, i) => ({
          address: safeLaunchFactory[chainId] as `0x${string}`,
          abi: tokenDeployerABI,
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

  const contractRequests = allContracts?.map((contract) => [
    {
      address: contract.result,
      abi: erc20ABI,
      functionName: "name",
    },
    {
      address: contract.result,
      abi: erc20ABI,
      functionName: "symbol",
    },
    {
      address: contract.result,
      abi: erc20ABI,
      functionName: "totalSupply",
    },
    {
      address: contract.result,
      abi: erc20ABI,
      functionName: "decimals",
    },
    {
      address: contract.result,
      abi: erc20ABI,
      functionName: "balanceOf",
      args: [address],
    },
  ])

  const { data: tempTokenData, error: tempTokenDataError } = useContractReads({
    contracts: contractRequests?.flat(),
    enabled: !!contractRequests?.length,
  })

  useEffect(() => {
    if (tempTokenDataError) {
      console.error("Temp Token Data Error: ", tempTokenDataError)
    }
    if (tempTokenData) {
      console.log("Temp Token Data: ", tempTokenData)
      console.log("All Contracts Data: ", allContracts)
      setDeployedTokens(splitData(tempTokenData, allContracts))
    }
  }, [tempTokenData, tempTokenDataError, allContracts])

  function splitData(data, allContracts) {
    const groupedData = []
    const namedData = []

    // Group the data into chunks of 5
    for (let i = 0; i < data.length; i += 5) {
      groupedData.push(data.slice(i, i + 5))
    }

    console.log("Grouped Data:", groupedData)
    console.log("All Contracts:", allContracts)

    // Process each group
    for (let i = 0; i < groupedData.length; i++) {
      const contract = allContracts[i]
      const group = groupedData[i]

      console.log(`Processing index ${i}:`, { contract, group })

      // Check if the contract exists and has a 'result' property
      if (contract && contract.result && group.length === 5) {
        // Check if all elements in the group exist and have a 'result' property
        if (
          group[0]?.result &&
          group[1]?.result &&
          group[2]?.result &&
          group[3]?.result
        ) {
          namedData.push({
            address: contract.result,
            name: group[0].result,
            symbol: group[1].result,
            supply: group[2].result,
            decimals: group[3].result,
          })
        } else {
          console.error(
            `Error processing data at index ${i}: Some group elements are missing 'result' properties`,
            {
              contract,
              group,
            }
          )
        }
      } else {
        console.error(
          `Error processing data at index ${i}: Contract is undefined or missing 'result' property`,
          {
            contract,
            group,
          }
        )
      }
    }

    return namedData
  }

  useEffect(() => {
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

      for (const [chainId, tokens] of Object.entries(tokenBOptions)) {
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

    fetchTokenPrices()
  }, [])

  const fetchWalletTokens = async () => {
    if (!isConnected || !address) return

    const provider = new ethers.providers.Web3Provider(window.ethereum)

    console.log("Deployed Tokens: ", deployedTokens) // Debugging log

    const tokenBalances = await Promise.all(
      deployedTokens.map(async (token) => {
        const contract = new ethers.Contract(token.address, erc20ABI, provider)
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

  const handleSwap = async () => {
    if (isConnected && amount > 0 && selectedTokenFrom && selectedTokenTo) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const routerContract = new ethers.Contract(
          routerAddress,
          routerABI,
          signer
        )

        // Approve the DEX to spend tokens
        await approveTokens(selectedTokenFrom, amount)

        // Perform the swap
        const amountInWei = ethers.utils.parseUnits(amount.toString(), decimals)
        await routerContract.swapExactETHForTokens(
          min_tokens,
          [selectedTokenFrom, selectedTokenTo],
          deadline
        )
        console.log(
          "Tokens swapped:",
          selectedTokenFrom,
          selectedTokenTo,
          amount
        )
      } catch (error) {
        console.error("Swap failed:", error)
      }
    }
  }

  useEffect(() => {
    if (
      amount &&
      tokenPrices[selectedTokenFrom?.split("-")[0]] &&
      tokenPrices[selectedTokenTo?.split("-")[0]]
    ) {
      const fromPrice =
        tokenPrices[selectedTokenFrom?.split("-")[0]][
          selectedTokenFrom?.split("-")[1]
        ]
      const toPrice =
        tokenPrices[selectedTokenTo?.split("-")[0]][
          selectedTokenTo?.split("-")[1]
        ]
      if (fromPrice && toPrice) {
        setEstimatedOutput((amount * fromPrice) / toPrice)
      }
    }
  }, [amount, selectedTokenFrom, selectedTokenTo, tokenPrices])

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
    return tokenBOptions[currentChainId] || []
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
  ]

  const approveTokens = async (tokenAddress: string, amount: number) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer)
    const decimals = await tokenContract.decimals()
    const amountInWei = ethers.utils.parseUnits(amount.toString(), decimals)
    await tokenContract.approve(dexAddress, amountInWei)
  }

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
                <p>Exchange Rate: {estimatedOutput / amount || 0}</p>
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
