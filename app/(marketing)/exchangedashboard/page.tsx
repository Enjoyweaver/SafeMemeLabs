"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ExchangeABI } from "@/ABIs/SafeLaunch/Exchange"
import { ExchangeFactoryABI } from "@/ABIs/SafeLaunch/ExchangeFactory"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"
import {
  blockExplorerAddress,
  exchangeFactory,
  rpcUrls,
  safeLaunchFactory,
} from "@/Constants/config"
import { ethers } from "ethers"
import { toast } from "react-toastify"

import { ChangeNetwork } from "@/components/changeNetwork/changeNetwork"
import { Navbar } from "@/components/walletconnect/walletconnect"

import "./dashboard.css"
import "react-toastify/dist/ReactToastify.css"
import Image from "next/image"
import { useDebounce } from "usehooks-ts"
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi"

type TokenInfo = {
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  totalSupply: string
  tokenBPairing: string
  stage: string // Change type to string to handle "Not started"
  isSafeLaunchActive: boolean
  isFinalized: boolean
}

type ExchangeInfo = {
  tokenAddress: string
  exchangeAddress: string
  tokenSymbol: string
  tokenName: string
  ethBalance: bigint
  tokenBalance: bigint
}

export default function Dashboard(): JSX.Element {
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [exchanges, setExchanges] = useState<ExchangeInfo[]>([])
  const [selectedChainId, setSelectedChainId] = useState("4002")
  const { isConnected } = useAccount()
  const { chain } = useNetwork()
  const [isClient, setIsClient] = useState(false)
  const [errorMenu, setErrorMenu] = useState(false)

  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (selectedChainId) {
      fetchTokens()
      fetchExchanges()
    }
  }, [selectedChainId])

  const fetchTokens = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        rpcUrls[selectedChainId]
      )
      const factoryAddress = safeLaunchFactory[selectedChainId] as `0x${string}`
      const factoryContract = new ethers.Contract(
        factoryAddress,
        TokenFactoryABI,
        provider
      )

      const count = await factoryContract.getDeployedTokenCount()
      const tokenList: TokenInfo[] = []

      for (let i = 0; i < count.toNumber(); i++) {
        const tokenAddress = await factoryContract.tokensDeployed(i)
        const tokenContract = new ethers.Contract(
          tokenAddress,
          SafeMemeABI,
          provider
        )

        const tokenSymbol = await tokenContract.symbol()
        const tokenName = await tokenContract.name()
        const totalSupply = await tokenContract.totalSupply()
        const formattedTotalSupply = ethers.utils.formatUnits(totalSupply, 18) // Convert to readable format
        const tokenBPairing = await tokenContract.tokenBAddress()
        const stageNumber = (await tokenContract.currentStage()).toNumber()
        const stage =
          stageNumber === 0 && !(await tokenContract.saleActive())
            ? "Not started"
            : (stageNumber + 1).toString() // Convert stage 0-4 to 1-5 or "Not started"
        const isSafeLaunchActive = await tokenContract.saleActive()
        const isFinalized = !isSafeLaunchActive && stageNumber === 5 // Sale is finalized if saleActive is false and all stages are completed

        tokenList.push({
          tokenAddress,
          tokenSymbol,
          tokenName,
          totalSupply: formattedTotalSupply,
          tokenBPairing,
          stage,
          isSafeLaunchActive: isSafeLaunchActive && !isFinalized,
          isFinalized,
        })
      }

      setTokens(tokenList)
    } catch (error) {
      console.error("Error fetching tokens:", error)
    }
  }

  const fetchExchanges = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        rpcUrls[selectedChainId]
      )
      const factoryAddress = exchangeFactory[selectedChainId] as `0x${string}`
      const factoryContract = new ethers.Contract(
        factoryAddress,
        ExchangeFactoryABI,
        provider
      )

      const count = await factoryContract.tokenCount()
      const exchangeList: ExchangeInfo[] = []

      for (let i = 0; i < count.toNumber(); i++) {
        const tokenAddress = await factoryContract.id_to_token(i)
        const exchangeAddress = await factoryContract.getExchange(tokenAddress)
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ExchangeABI,
          provider
        )

        const tokenSymbol = await tokenContract.symbol()
        const tokenName = await tokenContract.name()
        const ethBalance = await provider.getBalance(exchangeAddress) // get ETH balance
        const tokenBalance = await tokenContract.balanceOf(exchangeAddress) // get Token balance

        exchangeList.push({
          tokenAddress,
          exchangeAddress,
          tokenSymbol,
          tokenName,
          ethBalance,
          tokenBalance,
        })
      }

      setExchanges(exchangeList)
    } catch (error) {
      console.error("Error fetching exchanges:", error)
    }
  }

  const toggleErrorMenuOpen = () => {
    setErrorMenu(!errorMenu)
  }

  const getExplorerLink = (address: string) => {
    return `${blockExplorerAddress[selectedChainId]}${address}`
  }

  const finalizeSale = async (tokenAddress: string) => {
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        signer
      )
      const tx = await tokenContract.finalizeSaleAndCreateExchange()
      await tx.wait()
      toast.success("Sale finalized and exchange created successfully")
    } catch (error) {
      console.error("Error finalizing sale and creating exchange:", error)
      toast.error("Failed to finalize sale and create exchange")
    }
  }

  // Calculate totals
  const totalTokens = tokens.length
  const totalTransactions = exchanges.length
  const stageCounts = {
    1: tokens.filter((token) => token.stage === "1").length,
    2: tokens.filter((token) => token.stage === "2").length,
    3: tokens.filter((token) => token.stage === "3").length,
    4: tokens.filter((token) => token.stage === "4").length,
    5: tokens.filter((token) => token.stage === "5").length,
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <div>
          <Navbar />
          <h1 className="title">Dashboard</h1>
          <div className="form">
            <div className="inputGroup">
              <label className="inputTitle">Select Blockchain:</label>
              <select
                id="chain-select"
                value={selectedChainId}
                onChange={(e) => setSelectedChainId(e.target.value)}
                className="tokenInput"
              >
                {Object.keys(rpcUrls).map((chainId) => (
                  <option key={chainId} value={chainId}>
                    {chainId}
                  </option>
                ))}
              </select>
            </div>

            <h2 className="subtitle">TokenFactory</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="table-header">Total Tokens Created</th>
                    <th className="table-header">Stage 1 Contracts</th>
                    <th className="table-header">Stage 2 Contracts</th>
                    <th className="table-header">Stage 3 Contracts</th>
                    <th className="table-header">Stage 4 Contracts</th>
                    <th className="table-header">Stage 5 Contracts</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{totalTokens}</td>
                    <td>{stageCounts[1]}</td>
                    <td>{stageCounts[2]}</td>
                    <td>{stageCounts[3]}</td>
                    <td>{stageCounts[4]}</td>
                    <td>{stageCounts[5]}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="table-header">Token Address</th>
                    <th className="table-header">Token Symbol</th>
                    <th className="table-header">Token Name</th>
                    <th className="table-header">Total Supply</th>
                    <th className="table-header">Token B Pairing</th>
                    <th className="table-header narrow-column">Stage</th>
                    <th className="table-header narrow-column">
                      SafeLaunch Active
                    </th>
                    <th className="table-header narrow-column">
                      Sale Finalized
                    </th>
                    <th className="table-header narrow-column">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token, index) => (
                    <tr key={index}>
                      <td>
                        <Link
                          href={getExplorerLink(token.tokenAddress)}
                          target="_blank"
                        >
                          {token.tokenAddress.slice(0, 6)}...
                          {token.tokenAddress.slice(-4)}
                        </Link>
                      </td>
                      <td>{token.tokenSymbol}</td>
                      <td>{token.tokenName}</td>
                      <td>{token.totalSupply.toString()}</td>
                      <td>
                        <Link
                          href={getExplorerLink(token.tokenBPairing)}
                          target="_blank"
                        >
                          {token.tokenBPairing.slice(0, 6)}...
                          {token.tokenBPairing.slice(-4)}
                        </Link>
                      </td>
                      <td className="narrow-column">{token.stage}</td>
                      <td className="narrow-column">
                        {token.isSafeLaunchActive
                          ? "Active"
                          : token.isFinalized
                          ? "Completed"
                          : "Inactive"}
                      </td>
                      <td className="narrow-column">
                        {token.isFinalized ? "Yes" : "No"}
                      </td>
                      <td className="narrow-column">
                        <button
                          onClick={() => finalizeSale(token.tokenAddress)}
                          disabled={!token.isFinalized && token.stage !== "5"}
                        >
                          Finalize
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="subtitle">ExchangeFactory</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="table-header">Total Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{totalTransactions}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="table-header">Token Address</th>
                    <th className="table-header">Exchange Address</th>
                    <th className="table-header">Token Symbol</th>
                    <th className="table-header">Token Name</th>
                    <th className="table-header">ETH Balance</th>
                    <th className="table-header">Token Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {exchanges.map((exchange, index) => (
                    <tr key={index}>
                      <td>
                        <Link
                          href={getExplorerLink(exchange.tokenAddress)}
                          target="_blank"
                        >
                          {exchange.tokenAddress.slice(0, 6)}...
                          {exchange.tokenAddress.slice(-4)}
                        </Link>
                      </td>
                      <td>
                        <Link
                          href={getExplorerLink(exchange.exchangeAddress)}
                          target="_blank"
                        >
                          {exchange.exchangeAddress.slice(0, 6)}...
                          {exchange.exchangeAddress.slice(-4)}
                        </Link>
                      </td>
                      <td>{exchange.tokenSymbol}</td>
                      <td>{exchange.tokenName}</td>
                      <td>{exchange.ethBalance.toString()}</td>
                      <td>{exchange.tokenBalance.toString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
