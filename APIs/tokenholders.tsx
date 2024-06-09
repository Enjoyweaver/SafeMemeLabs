"use client"

import { useEffect, useState } from "react"
import { chainIdToCovalentChainId } from "@/Constants/config"

export const useTokenHolders = (tokenAddress, chainId) => {
  const [holders, setHolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTokenHolders = async () => {
      const covalentChainId = chainIdToCovalentChainId[chainId]
      if (!covalentChainId) {
        setError(`Chain ID ${chainId} not supported by Covalent`)
        setLoading(false)
        return
      }

      const apiKey = process.env.NEXT_PUBLIC_COVALENT_API_KEY
      const url = `https://api.covalenthq.com/v1/${covalentChainId}/tokens/${tokenAddress}/token_holders/?key=${apiKey}`

      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`)
        }
        const data = await response.json()
        if (!data.data || !data.data.items || data.data.items.length === 0) {
          throw new Error("No holder data returned from API")
        }

        // Filter holders who have not sold anything yet
        const filteredHolders = data.data.items.filter(
          (holder) => holder.balance_quote === holder.total_received_quote
        )

        setHolders(filteredHolders.slice(0, 100)) // Take the first 100 holders
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTokenHolders()
  }, [tokenAddress, chainId])

  return { holders, loading, error }
}
