"use client"

import React, { useEffect, useState } from "react"
import { useTokenHolders } from "@/APIs/tokenholders"

import "@/styles/rewards.css"
import { useAccount } from "wagmi"

import { Navbar } from "@/components/walletconnect/walletconnect"

const RewardsPage = () => {
  const { address } = useAccount() // Get the connected wallet address

  const tokenData = [
    {
      name: "First 100 $bubbles Holders",
      tokenAddress: "0x54B051d102c19c1Cc12a391b0eefCD7eeb64CeDA",
      chainId: 250,
      description: `These wallets have bought $bubbles and haven't sold anything, and for supporting us as we build SafeMeme Labs, we will be sharing some of our early successes with them. <br></br>You can find more information about $bubbles on our <a href="/memedashboard">Dashboard</a> and also about MemeBox where we launched the token <a href="https://twitter.com/MemeBoxFi">@MemeBoxFi</a>. Check out the token on <a href="https://dexscreener.com/fantom/0x0FE3c2b440AE55eC003165D71F5212B2B8c7ec97">Dex Screener</a>. You can buy $bubbles at <a href="https://memebox.fi/#/swap">https://memebox.fi/#/swap</a>.`,
    },
    {
      name: "Protocol Testers",
      tokenAddress: "tbd",
      chainId: 250,
      description: `These users helped us test the protocol on the testnet and provided valuable feedback.`,
    },
    {
      name: "First 100 Protocol Users",
      tokenAddress: "tbd",
      chainId: 250,
      description: `These users were the first 100 to use our protocol once it went live.`,
    },
    {
      name: "First 100 Profile Initializers",
      tokenAddress: "tbd",
      chainId: 250,
      description: `These users were the first 100 to initialize their profiles on our platform.`,
    },
  ]

  const [selectedSection, setSelectedSection] = useState(tokenData[0])
  const { holders, loading, error } = useTokenHolders(
    selectedSection.tokenAddress,
    selectedSection.chainId
  )

  const [canClaim, setCanClaim] = useState(false)
  const excludedAddresses = [
    "0x8cfeb8Eacdfe56C5C3B529e5EBf9F76399d8Ca49".toLowerCase(),
    "0x0FE3c2b440AE55eC003165D71F5212B2B8c7ec97".toLowerCase(),
  ]

  useEffect(() => {
    if (
      holders.some(
        (holder) => holder.address.toLowerCase() === address?.toLowerCase()
      ) ||
      excludedAddresses.includes(address?.toLowerCase())
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

  // Function to shorten addresses
  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
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
        <div className="rewardsTabs">
          {tokenData.map((section, index) => (
            <button
              key={index}
              className={`tabButton ${
                selectedSection.name === section.name ? "active" : ""
              }`}
              onClick={() => setSelectedSection(section)}
            >
              {section.name}
            </button>
          ))}
        </div>
        <h2 className="rewardsTitle">{selectedSection.name}</h2>
        <p
          className="rewardsintro"
          dangerouslySetInnerHTML={{ __html: selectedSection.description }}
        ></p>
        <button
          className="claimButton"
          onClick={handleClaim}
          disabled={!canClaim}
        >
          Claim Rewards
        </button>
        <div className="rewardsTableContainer">
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
              {holders.length > 0 ? (
                holders
                  .filter(
                    (holder) =>
                      !excludedAddresses.includes(holder.address.toLowerCase())
                  )
                  .map((holder, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{shortenAddress(holder.address)}</td>
                      <td>
                        {formatNumber(
                          (holder.balance / Math.pow(10, 18)).toFixed(2)
                        )}
                      </td>
                      <td>Mad Token Claim</td>
                      <td>Share MemeBox Earnings</td>
                      <td>Your Choice</td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="6" className="noData">
                    No data available for this section.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default RewardsPage
