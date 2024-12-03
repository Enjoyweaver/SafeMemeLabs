// walletcontext.tsx
"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { ArweaveWebWallet } from "arweave-wallet-connector"

interface WalletContextProps {
  address: string
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  arweaveWallet: ArweaveWebWallet | null
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined)

// walletcontext.tsx
export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState<string>("")
  const [arweaveWallet, setArweaveWallet] = useState<ArweaveWebWallet | null>(
    null
  )

  // Create wallet instance
  const wallet = React.useMemo(() => {
    const w = new ArweaveWebWallet({
      name: "Your application name",
      logo: "URL of your logo to be displayed to users",
    })
    w.setUrl("arweave.app")
    return w
  }, [])

  // Initialize wallet state
  const [state, setState] = useState(wallet.state)

  useEffect(() => {
    wallet.setState([state, setState])
  }, [])

  useEffect(() => {
    if (state && state.address) {
      setAddress(state.address)
    } else {
      setAddress("")
    }
  }, [state])

  const connect = async () => {
    try {
      await wallet.connect()
      setArweaveWallet(wallet) // Set the wallet instance
    } catch (error) {
      console.error("Error connecting to ArweaveWebWallet:", error)
    }
  }

  const disconnect = async () => {
    try {
      await wallet.disconnect()
      setArweaveWallet(null) // Clear the wallet instance
    } catch (error) {
      console.error("Error disconnecting from ArweaveWebWallet:", error)
    }
  }

  return (
    <WalletContext.Provider
      value={{ address, connect, disconnect, arweaveWallet }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
