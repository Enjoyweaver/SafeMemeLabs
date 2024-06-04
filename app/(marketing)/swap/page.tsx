"use client"

import { useEffect, useState } from "react"
import { erc20ABI } from "@/ABIs/erc20"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import { routerDetails, tokenDeployerDetails } from "@/Constants/config"
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
  const [exchangeRate, setExchangeRate] = useState() // Mock exchange rate
  const [estimatedOutput, setEstimatedOutput] = useState()
  const [tokens, setTokens] = useState([]) // State to store fetched tokens

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
            dexAddress,
            dexABI,
            provider.getSigner()
          )
          await dexContract.swap(tokenFrom, tokenTo, amount)
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
    pricePerToken
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
        pricePerToken
      )
      console.log(
        "Initial tokens listed:",
        tokenAddress,
        initialAmount,
        pricePerToken
      )
    } catch (error) {
      console.error("Listing initial tokens failed:", error)
    }
  }

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
                    onChange={(e) => setTokenFrom(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select Token</option>
                    {tokens.map((token, index) => (
                      <option key={index} value={token.address}>
                        {token.name}
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
                <select
                  id="tokenTo"
                  value={tokenTo}
                  onChange={(e) => setTokenTo(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Token</option>
                  {tokens.map((token, index) => (
                    <option key={index} value={token.address}>
                      {token.name} ({token.symbol})
                    </option>
                  ))}
                </select>
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
