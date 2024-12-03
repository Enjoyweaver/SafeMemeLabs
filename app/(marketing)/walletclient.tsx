// WalletClient.tsx
"use client"

import React from "react"

import { useWallet } from "./walletcontext"

export default function WalletClient() {
  const { address, connect, disconnect } = useWallet()

  return (
    <>
      {!address ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected Address: {address}</p>
          <button onClick={disconnect}>Disconnect Wallet</button>
        </div>
      )}
    </>
  )
}
