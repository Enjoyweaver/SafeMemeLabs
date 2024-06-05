"use client"

import { useEffect, useState } from "react"
import { erc20ABI } from "@/ABIs/erc20"
import { routerABI } from "@/ABIs/router"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import {
  priceFeedAddresses,
  routerDetails,
  tokenBOptions,
  tokenDeployerDetails,
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

const Swap = () => {
  const [isClient, setIsClient] = useState(false)
  const [tokenFrom, setTokenFrom] = useState("")
  const [tokenTo, setTokenTo] = useState("")
  const [amount, setAmount] = useState("")
  const [balance, setBalance] = useState(1000) // Mock balance
  const [exchangeRate, setExchangeRate] = useState(0) // Mock exchange rate
  const [estimatedOutput, setEstimatedOutput] = useState(0)
  const [tokens, setTokens] = useState([]) // State to store fetched tokens
  const [pairs, setPairs] = useState([]) // State to store pairs
  const [tokenPrices, setTokenPrices] = useState({}) // State to store token prices

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const chainId = chain ? chain.id : Object.keys(tokenDeployerDetails)[0]

  const { data: contractsCount, error: contractsCountError } = useContractRead({
    address: tokenDeployerDetails[chainId] as `0x${string}`,
    abi: tokenDeployerABI,
    functionName: "getDeployedTokenCount",
  })

  const { data: allContracts, error: allContractsError } = useContractReads({
    contracts: contractsCount
      ? Array.from({ length: Number(contractsCount) }, (_, i) => ({
          address: tokenDeployerDetails[chainId] as `0x${string}`,
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
      setTokens(splitData(tempTokenData))
    }
  }, [tempTokenData, tempTokenDataError])

  const fetchTokensFromRouter = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const routerAddress = routerDetails[chainId]
      const routerContract = new ethers.Contract(
        routerAddress,
        routerABI,
        provider
      )

      const listedTokens = await routerContract.getListedTokens()

      const tokenDetails = await Promise.all(
        listedTokens.map(async (tokenAddress) => {
          const tokenContract = new ethers.Contract(
            tokenAddress,
            erc20ABI,
            provider
          )
          const name = await tokenContract.name()
          const symbol = await tokenContract.symbol()
          const totalSupply = await tokenContract.totalSupply()
          const decimals = await tokenContract.decimals()

          return { address: tokenAddress, name, symbol, totalSupply, decimals }
        })
      )

      return tokenDetails
    } catch (error) {
      console.error("Error fetching tokens from router:", error)
      return []
    }
  }

  const fetchPairsFromRouter = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const routerAddress = routerDetails[chainId]
      const routerContract = new ethers.Contract(
        routerAddress,
        routerABI,
        provider
      )

      const pairs = await routerContract.getAllPairs()

      const pairDetails = await Promise.all(
        pairs.map(async (pairAddress) => {
          const pairContract = new ethers.Contract(
            pairAddress,
            erc20ABI,
            provider
          )
          const token0 = await pairContract.token0()
          const token1 = await pairContract.token1()

          const token0Contract = new ethers.Contract(token0, erc20ABI, provider)
          const token1Contract = new ethers.Contract(token1, erc20ABI, provider)

          const token0Name = await token0Contract.name()
          const token1Name = await token1Contract.name()

          return {
            pairAddress,
            token0: { address: token0, name: token0Name },
            token1: { address: token1, name: token1Name },
          }
        })
      )

      return pairDetails
    } catch (error) {
      console.error("Error fetching pairs from router:", error)
      return []
    }
  }

  const fetchTokenPrice = async (tokenSymbol) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const priceFeedAddress =
        priceFeedAddresses[chainId]?.[`${tokenSymbol}/USD`]
      if (!priceFeedAddress) {
        console.error(`Price feed address not found for ${tokenSymbol}/USD`)
        return 0
      }

      const priceFeedABI = [
        {
          inputs: [],
          name: "latestRoundData",
          outputs: [
            { internalType: "uint80", name: "roundId", type: "uint80" },
            { internalType: "int256", name: "answer", type: "int256" },
            { internalType: "uint256", name: "startedAt", type: "uint256" },
            { internalType: "uint256", name: "updatedAt", type: "uint256" },
            { internalType: "uint80", name: "answeredInRound", type: "uint80" },
          ],
          stateMutability: "view",
          type: "function",
        },
      ]

      const priceFeedContract = new ethers.Contract(
        priceFeedAddress,
        priceFeedABI,
        provider
      )

      const priceData = await priceFeedContract.latestRoundData()
      const price = priceData.answer / 10 ** 8 // Assuming the price feed returns 8 decimal places

      return price
    } catch (error) {
      console.error("Error fetching token price:", error)
      return 0
    }
  }

  useEffect(() => {
    const fetchTokensAndPairs = async () => {
      const tokensFromRouter = await fetchTokensFromRouter()
      const pairsFromRouter = await fetchPairsFromRouter()
      setPairs(pairsFromRouter)

      const prices = {}
      for (const token of tokensFromRouter) {
        const price = await fetchTokenPrice(token.symbol)
        prices[token.address] = price
      }
      setTokenPrices(prices)
    }

    if (chainId) {
      fetchTokensAndPairs()
    }
  }, [chainId])

  const handleTokenFromChange = async (e) => {
    const selectedTokenAddress = e.target.value
    setTokenFrom(selectedTokenAddress)

    const selectedToken = tokens.find(
      (token) => token.address === selectedTokenAddress
    )
    if (selectedToken) {
      const price = await fetchTokenPrice(selectedToken.symbol)
      setExchangeRate(price)
    }
  }

  const handleTokenToChange = async (e) => {
    const selectedTokenAddress = e.target.value
    setTokenTo(selectedTokenAddress)

    const selectedToken = tokens.find(
      (token) => token.address === selectedTokenAddress
    )
    const price = await fetchTokenPrice(selectedToken.symbol)

    if (price && exchangeRate) {
      setEstimatedOutput((parseFloat(amount) * exchangeRate) / price)
    }
  }

  function splitData(data: any) {
    const groupedData = []
    const namedData = []
    for (let i = 0; i < data.length; i += 4) {
      groupedData.push(data.slice(i, i + 4))
    }
    for (let i = 0; i < groupedData.length; i++) {
      namedData.push({
        address: allContracts[i].result,
        name: groupedData[i][0].result,
        symbol: groupedData[i][1].result,
        supply: groupedData[i][2].result,
        decimals: groupedData[i][3].result,
      })
    }
    return namedData
  }

  const formatNumber = (number: number, decimals: number) => {
    return (number / 10 ** decimals).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })
  }

  const handleSwap = async () => {
    if (isConnected && amount > 0 && tokenFrom && tokenTo) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const swapTokens = async (provider, tokenFrom, tokenTo, amount) => {
          const dexContract = new ethers.Contract(
            routerDetails[chainId],
            routerABI,
            provider.getSigner()
          )
          await dexContract.swapTokens(tokenFrom, tokenTo, amount)
          console.log("Tokens swapped:", tokenFrom, tokenTo, amount)
        }
        await swapTokens(provider, tokenFrom, tokenTo, amount)
      } catch (error) {
        console.error("Swap failed:", error)
      }
    }
  }

  useEffect(() => {
    if (amount && exchangeRate) {
      setEstimatedOutput(parseFloat(amount) * exchangeRate)
    }
  }, [amount, exchangeRate])

  const handleQuickSelect = (percentage) => {
    const calculatedAmount = (balance * percentage) / 100
    setAmount(calculatedAmount.toString())
  }

  const handleReverse = () => {
    const temp = tokenFrom
    setTokenFrom(tokenTo)
    setTokenTo(temp)
  }

  const handleListInitialTokens = async (
    tokenAddress,
    initialAmount,
    tokenBAmount
  ) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const routerAddress = routerDetails[chainId]
      const routerContract = new ethers.Contract(
        routerAddress,
        routerABI,
        provider.getSigner()
      )

      await routerContract.listInitialTokens(
        tokenAddress,
        initialAmount,
        tokenBAmount
      )
      console.log(
        "Initial tokens listed:",
        tokenAddress,
        initialAmount,
        tokenBAmount
      )
    } catch (error) {
      console.error("Listing initial tokens failed:", error)
    }
  }

  useEffect(() => {
    const tokenBList = tokenBOptions[chainId] || []
    setTokens(tokenBList)
  }, [chainId])

  return (
    <div>
      <Navbar />
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
                    value={tokenFrom}
                    onChange={handleTokenFromChange}
                    className="input-field"
                  >
                    <option value="">Select Token</option>
                    {tokens.map((token, index) => (
                      <option key={index} value={token.address}>
                        {token.symbol}
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
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount"
                      className="input-field"
                    />
                    {tokenFrom && tokenPrices[tokenFrom] !== undefined ? (
                      <span className="price-info">
                        {`$${tokenPrices[tokenFrom].toFixed(2)}`}
                      </span>
                    ) : (
                      <span className="price-info">Select a token</span>
                    )}
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
                    value={tokenTo}
                    onChange={handleTokenToChange}
                    className="input-field"
                  >
                    <option value="">Select Token</option>
                    {tokens.map((token, index) => (
                      <option key={index} value={token.address}>
                        {token.name} ({token.symbol})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    id="estimatedOutput"
                    value={estimatedOutput}
                    disabled
                    className="input-field"
                  />
                  {tokenTo && tokenPrices[tokenTo] !== undefined ? (
                    <span className="price-info">
                      {`$${tokenPrices[tokenTo].toFixed(2)}`}
                    </span>
                  ) : (
                    <span className="price-info">Select a token</span>
                  )}
                </div>
              </div>
              <div className="swap-summary">
                <p>Exchange Rate: {exchangeRate}</p>
                <p>Estimated Output: {estimatedOutput}</p>
                <p>Slippage:</p>
                <p>Price Impact:</p>
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

export default Swap
