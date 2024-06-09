"use client"

import React, { useEffect, useState } from "react"
import { useTokenHolders } from "@/APIs/tokenholders"

import "@/styles/rewards.css"
import { useAccount } from "wagmi"

import { Navbar } from "@/components/walletconnect/walletconnect"

// Assuming wagmi is used for wallet connection

const RewardsPage = () => {
  const tokenAddress = "0x54B051d102c19c1Cc12a391b0eefCD7eeb64CeDA"
  const chainId = 250
  const { holders, loading, error } = useTokenHolders(tokenAddress, chainId)
  const { address } = useAccount() // Get the connected wallet address

  const [canClaim, setCanClaim] = useState(false)

  useEffect(() => {
    if (
      holders.some(
        (holder) => holder.address.toLowerCase() === address?.toLowerCase()
      ) ||
      address?.toLowerCase() ===
        "0x8cfeb8Eacdfe56C5C3B529e5EBf9F76399d8Ca49".toLowerCase()
    ) {
      setCanClaim(true)
    } else {
      setCanClaim(false)
    }
  }, [holders, address])

  // Function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const handleClaim = () => {
    if (canClaim) {
      // Logic for claiming rewards
      alert(
        "Claiming rewards... (Rewards are yet to be determined, working on 'em!)"
      )
    } else {
      alert("You are not eligible to claim rewards.")
    }
  }

  if (loading) return <p className="loading">Loading...</p>
  if (error) return <p className="error">Error: {error}</p>

  return (
    <div className="rewardsBody">
      <Navbar />
      <div className="rewardsContainer">
        <h2 className="rewardsTitle">
          First 100 "hodling" $bubbles token holders
        </h2>
        <p className="rewardsintro">
          These wallets have bought $bubbles and haven't sold anything, and for
          supporting us as we build SafeMeme Labs, we will be sharing some of
          our early successes with them. The rewards are not explicitly defined
          just yet, though they will be well worth the late reveal.
        </p>
        <button
          className="claimButton"
          onClick={handleClaim}
          disabled={!canClaim}
        >
          Claim Rewards
        </button>
        <table className="rewardsTable">
          <thead>
            <tr>
              <th>#</th>
              <th>Wallet Address</th>
              <th>Token Amount</th>
              <th>1st Reward</th>
              <th>2nd Reward</th>
              <th>3rd Reward</th>
            </tr>
          </thead>
          <tbody>
            {holders.map((holder, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{holder.address}</td>
                <td>
                  {formatNumber((holder.balance / Math.pow(10, 18)).toFixed(2))}
                </td>
                <td>Mad Token Claim</td>
                <td>Profile Boost</td>
                <td>Your Choice</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RewardsPage
