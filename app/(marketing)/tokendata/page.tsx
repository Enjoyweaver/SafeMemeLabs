"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ExchangeABI } from "@/ABIs/SafeLaunch/Exchange"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import {
  blockExplorerAddress,
  rpcUrls,
  safeLaunchFactory,
} from "@/Constants/config"
import { ethers } from "ethers"
import { toast } from "react-toastify"

import { Navbar } from "@/components/walletconnect/walletconnect"

import "./tokendata.css"
import "react-toastify/dist/ReactToastify.css"
import { useAccount, useContractEvent, useNetwork } from "wagmi"

type Transaction = {
  transactionId: string
  buyer: string
  safeMemeAmount: string
  tokenBAmount: string
  gasUsed: string
}

type TokenData = {
  tokenName: string
  tokenSymbol: string
  tokenAddress: string
  tokenBPairing: string
  dexAddress: string
  totalSafeMemeSold: string
  totalTokenBReceived: string
  currentStage: number
  transactionsPerStage: number[]
  averageTransactionAmount: string
  transactionCount: number
  owner: string
  safeLaunchStartTime: string
}

export default function TokenData({
  searchParams,
}: {
  searchParams: { tokenAddress: string }
}): JSX.Element {
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedChainId, setSelectedChainId] = useState("4002")
  const { isConnected } = useAccount()
  const { chain } = useNetwork()
  const [isClient, setIsClient] = useState(false)
  const tokenAddress = searchParams.tokenAddress

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && tokenAddress) {
      fetchTokenData()
      fetchTransactions()
    }
  }, [isClient, tokenAddress, selectedChainId])

  const fetchTokenData = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        rpcUrls[selectedChainId]
      )
      const tokenContract = new ethers.Contract(
        tokenAddress as string,
        SafeMemeABI,
        provider
      )

      const [tokenName, tokenSymbol, dexAddress, owner] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.dexAddress(),
        tokenContract.owner(),
      ])

      let tokenBPairing = ""
      let transactionCount = 0
      let totalSafeMemeSold = "0"
      let totalTokenBReceived = "0"
      let currentStage = 0
      let transactionsPerStage = [0, 0, 0, 0, 0, 0] // 5 SafeLaunch stages + 1 DEX stage
      let safeLaunchStartTime = "Not started"

      if (dexAddress !== ethers.constants.AddressZero) {
        const exchangeContract = new ethers.Contract(
          dexAddress,
          ExchangeABI,
          provider
        )
        const filter = exchangeContract.filters.SafeMemePurchased()
        const events = await exchangeContract.queryFilter(filter)

        const [tokenB, safeMemesSold, tokenBReceived, stage] =
          await Promise.all([
            exchangeContract.tokenBAddress(),
            exchangeContract.getsafeMemesSold(),
            exchangeContract.getReceivedtokenB(),
            exchangeContract.currentStage(),
          ])
        transactionCount = events.length
        tokenBPairing = tokenB
        totalSafeMemeSold = ethers.utils.formatUnits(safeMemesSold, 18)
        totalTokenBReceived = ethers.utils.formatUnits(tokenBReceived, 18)
        currentStage = stage.toNumber() + 1 // Adding 1 because stages are 0-indexed

        // Fetch transactions per stage
        for (let i = 0; i < 6; i++) {
          try {
            const stageInfo = await exchangeContract.getStageLiquidity(i)
            transactionsPerStage[i] = stageInfo[1].toNumber() // safeMemesSold is at index 1
          } catch (error) {
            console.warn(`Error fetching stage ${i} info:`, error)
          }
        }

        // Fetch SafeLaunch start time
        if (events.length > 0) {
          const firstEvent = events[events.length - 1] // Get the earliest event
          const tx = await firstEvent.getTransaction()
          const receipt = await tx.wait()
          const block = await provider.getBlock(receipt.blockNumber)
          safeLaunchStartTime = new Date(
            block.timestamp * 1000
          ).toLocaleString()
        }
      }

      const averageTransactionAmount =
        transactionCount > 0
          ? (parseFloat(totalSafeMemeSold) / transactionCount).toFixed(2)
          : "0"

      setTokenData({
        tokenName,
        tokenSymbol,
        tokenAddress: tokenAddress as string,
        tokenBPairing,
        dexAddress,
        totalSafeMemeSold,
        totalTokenBReceived,
        currentStage,
        transactionsPerStage,
        averageTransactionAmount,
        transactionCount,
        owner,
        safeLaunchStartTime,
      })
    } catch (error) {
      console.error("Error fetching token data:", error)
      toast.error("Failed to fetch token data")
    }
  }

  const fetchTransactions = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        rpcUrls[selectedChainId]
      )
      const tokenContract = new ethers.Contract(
        tokenAddress as string,
        SafeMemeABI,
        provider
      )
      const dexAddress = await tokenContract.dexAddress()
      const exchangeContract = new ethers.Contract(
        dexAddress,
        ExchangeABI,
        provider
      )

      const filter = exchangeContract.filters.SafeMemePurchased()
      const events = await exchangeContract.queryFilter(filter)

      const txs = await Promise.all(
        events.map(async (event) => {
          const tx = await event.getTransaction()
          const receipt = await tx.wait()
          return {
            transactionId: tx.hash,
            buyer: event.args.buyer,
            safeMemeAmount: ethers.utils.formatUnits(
              event.args.safeMemeAmount,
              18
            ),
            tokenBAmount: ethers.utils.formatUnits(event.args.tokenBAmount, 18),
            gasUsed: receipt.gasUsed.toString(),
          }
        })
      )

      setTransactions(txs.reverse())

      // Update total transactions count
      setTokenData((prevData) => ({
        ...prevData,
        transactionCount: txs.length,
      }))
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast.error("Failed to fetch transactions")
    }
  }

  useContractEvent({
    address: tokenData?.dexAddress as `0x${string}`,
    abi: ExchangeABI,
    eventName: "SafeMemePurchased",
    listener(log) {
      fetchTransactions()
      fetchTokenData()
    },
  })

  const getExplorerLink = (address: string) => {
    return `${blockExplorerAddress[selectedChainId]}${address}`
  }

  if (!tokenData) {
    return <div>Loading...</div>
  }

  return (
    <div className="container">
      <Navbar />
      <h1 className="title">Token Data</h1>
      <div className="token-info-stats-container">
        <div className="token-info">
          <h2>Token Information</h2>
          <p>
            <strong>Name:</strong> {tokenData.tokenName}
          </p>
          <p>
            <strong>Symbol:</strong> {tokenData.tokenSymbol}
          </p>
          <p>
            <strong>Address:</strong>{" "}
            <Link
              href={getExplorerLink(tokenData.tokenAddress)}
              target="_blank"
            >
              {tokenData.tokenAddress}
            </Link>
          </p>
          <p>
            <strong>Owner:</strong>{" "}
            <Link href={getExplorerLink(tokenData.owner)} target="_blank">
              {tokenData.owner}
            </Link>
          </p>
          <p>
            <strong>Token B Pairing:</strong>{" "}
            <Link
              href={getExplorerLink(tokenData.tokenBPairing)}
              target="_blank"
            >
              {tokenData.tokenBPairing}
            </Link>
          </p>
          <p>
            <strong>SafeLaunch Start Time in UTC:</strong>{" "}
            {tokenData.safeLaunchStartTime}
          </p>
        </div>
        <div className="token-stats">
          <h2>Token Statistics</h2>
          <p>
            <strong>Current Stage:</strong> {tokenData.currentStage}
          </p>
          <p>
            <strong>Total SafeMemes Sold:</strong> {tokenData.totalSafeMemeSold}
          </p>
          <p>
            <strong>Total Token B Received:</strong>{" "}
            {tokenData.totalTokenBReceived}
          </p>

          <p>
            <strong>Total Transactions:</strong> {tokenData.transactionCount}
          </p>
          <p>
            <strong>Average Transaction:</strong>{" "}
            {tokenData.averageTransactionAmount} SafeMemes
          </p>
        </div>
      </div>
      <div className="transactions">
        <h2>Recent Transactions</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Buyer</th>
              <th>SafeMeme Amount</th>
              <th>Token B Amount</th>
              <th>Gas Used</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index}>
                <td>
                  <Link
                    href={getExplorerLink(tx.transactionId)}
                    target="_blank"
                  >
                    {tx.transactionId.slice(0, 6)}...
                    {tx.transactionId.slice(-4)}
                  </Link>
                </td>
                <td>
                  <Link href={getExplorerLink(tx.buyer)} target="_blank">
                    {tx.buyer.slice(0, 6)}...{tx.buyer.slice(-4)}
                  </Link>
                </td>
                <td>{parseFloat(tx.safeMemeAmount).toFixed(2)}</td>
                <td>{parseFloat(tx.tokenBAmount).toFixed(2)}</td>
                <td>{tx.gasUsed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
