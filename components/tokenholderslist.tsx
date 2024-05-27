// components/TokenHoldersList.js
"use client"

import React, { useEffect, useState } from "react"

interface MarketingLayoutProps {
  children: React.ReactNode
}
const TokenHoldersList = ({ walletAddress, chainName }) => {
  const [transactionSummary, setTransactionSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTransactionSummary = async () => {
      const apiKey = process.env.NEXT_PUBLIC_COVALENT_API_KEY
      const url = `https://api.covalenthq.com/v1/${chainName}/address/${walletAddress}/transactions_summary/?key=${apiKey}`

      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`)
        }
        const data = await response.json()
        if (!data.data || !data.data.items || data.data.items.length === 0) {
          throw new Error("No transaction data returned from API")
        }
        setTransactionSummary(data.data.items[0])
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactionSummary()
  }, [walletAddress, chainName])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  const { total_count, latest_transaction, earliest_transaction } =
    transactionSummary

  return (
    <div>
      <h2>Transaction Summary</h2>
      <p>
        <strong>Total Transactions:</strong> {total_count}
      </p>
      {latest_transaction && (
        <div>
          <h3>Latest Transaction</h3>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(latest_transaction.block_signed_at).toLocaleString()}
          </p>
          <p>
            <strong>Transaction Hash:</strong>{" "}
            <a
              href={latest_transaction.tx_detail_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {latest_transaction.tx_hash}
            </a>
          </p>
        </div>
      )}
      {earliest_transaction && (
        <div>
          <h3>Earliest Transaction</h3>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(earliest_transaction.block_signed_at).toLocaleString()}
          </p>
          <p>
            <strong>Transaction Hash:</strong>{" "}
            <a
              href={earliest_transaction.tx_detail_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {earliest_transaction.tx_hash}
            </a>
          </p>
        </div>
      )}
    </div>
  )
}

export default TokenHoldersList
