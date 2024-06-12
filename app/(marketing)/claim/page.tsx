// SPDX-License-Identifier: MIT
"use client"

import React, { useState } from "react"
import { tokenSaleDetails } from "@/Constants/config"
import { ethers } from "ethers"
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi"

import "@/styles/claiming.css"
import { Navbar } from "@/components/walletconnect/walletconnect"

const Specs: React.FC = () => {
  const { isConnected } = useAccount()
  const [isPreparing, setIsPreparing] = useState(true)

  const { config, error } = usePrepareContractWrite({
    address: tokenSaleDetails["250"],
    abi: ["function buyTokens(uint256 amount) external payable"],
    functionName: "buyTokens",
    args: [1],
    overrides: {
      value: ethers.utils.parseEther("0.01"),
    },
    onSuccess() {
      setIsPreparing(false)
    },
    onError() {
      setIsPreparing(false)
    },
  })

  const { write: buyTokens } = useContractWrite(config)

  const handleClaim = () => {
    if (isConnected) {
      if (buyTokens) {
        buyTokens()
      } else {
        alert("Contract write function not ready yet. Please try again later.")
      }
    } else {
      alert("Please connect your wallet first")
    }
  }

  return (
    <div className="grassPageBody">
      <Navbar />
      <div className="grassPageContainer">
        <h1>Are you touching $grass today?</h1>
        <p>
          The "Touching Grass" (GRASS) token is designed to encourage users to
          touch $grass daily. Grass touchers can claim their daily $grass by
          connecting their wallets and claiming them. The initial token supply
          is distributed through a sale contract, with dynamic pricing and
          liquidity provision to ensure market stability. A transaction tax
          mechanism supports the long-term sustainability of the project by
          redistributing taxes to the claim pool, liquidity pool, and burn
          wallet.
        </p>
        <button
          onClick={handleClaim}
          disabled={isPreparing}
          className="claimButton"
        >
          Claim Your GRASS Tokens
        </button>
      </div>
    </div>
  )
}

export default Specs
