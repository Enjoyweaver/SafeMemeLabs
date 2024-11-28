// components/ArweaveContext.tsx
"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import ArDB from "ardb"
import Arweave from "arweave"
import Account, { ArProfile } from "arweave-account"
import { ArweaveWebWallet } from "arweave-wallet-connector"

interface ArweaveContextType {
  arweaveWallet: ArweaveWebWallet | null
  isArweaveConnected: boolean
  arweaveAddress: string | null
  profile: ArProfile | null
  isProfileVerified: boolean
  connectArweave: () => Promise<void>
  disconnectArweave: () => void
  updateProfile: (newProfile: ArProfile) => void
}

const ArweaveContext = createContext<ArweaveContextType | undefined>(undefined)

export function ArweaveProvider({ children }: { children: React.ReactNode }) {
  const [arweaveWallet, setArweaveWallet] = useState<ArweaveWebWallet | null>(
    null
  )
  const [isArweaveConnected, setIsArweaveConnected] = useState(false)
  const [arweaveAddress, setArweaveAddress] = useState<string | null>(null)
  const [profile, setProfile] = useState<ArProfile | null>(null)
  const [isProfileVerified, setIsProfileVerified] = useState(false)

  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  })

  const account = new Account(arweave)

  const verifyProfile = async (address: string, profile: ArProfile) => {
    if (profile?.handleName) {
      const ardb = new ArDB(arweave)
      const transactions = await ardb
        .search("transactions")
        .from(address)
        .tag("App-Name", "SafeMemes.fun")
        .findAll()

      if (transactions.length > 0) {
        setIsProfileVerified(true)
        return true
      }
    }
    setIsProfileVerified(false)
    return false
  }

  const fetchProfile = async (address: string) => {
    try {
      const userProfile = await account.get(address)
      if (userProfile?.profile) {
        setProfile(userProfile.profile)
        await verifyProfile(address, userProfile.profile)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  useEffect(() => {
    const savedAddress = localStorage.getItem("arweaveAddress")
    if (savedAddress) {
      setArweaveAddress(savedAddress)
      setIsArweaveConnected(true)
      const wallet = new ArweaveWebWallet({
        name: "SafeMeme Labs",
        logo: "URL to your app logo",
      })
      wallet.setUrl("https://arweave.app")
      setArweaveWallet(wallet)
      fetchProfile(savedAddress)
    }
  }, [])

  const connectArweave = async () => {
    try {
      const wallet = new ArweaveWebWallet({
        name: "SafeMeme Labs",
        logo: "URL to your app logo",
      })
      wallet.setUrl("https://arweave.app")
      await wallet.connect()

      const address = wallet.address
      if (!address) {
        throw new Error("Arweave wallet address not found.")
      }

      setArweaveWallet(wallet)
      setArweaveAddress(address)
      setIsArweaveConnected(true)
      localStorage.setItem("arweaveAddress", address)

      await fetchProfile(address)
      return address
    } catch (error) {
      console.error("Error connecting to Arweave:", error)
      throw error
    }
  }

  const disconnectArweave = () => {
    if (arweaveWallet) {
      arweaveWallet.disconnect()
    }
    setArweaveWallet(null)
    setIsArweaveConnected(false)
    setArweaveAddress(null)
    setProfile(null)
    setIsProfileVerified(false)
    localStorage.removeItem("arweaveAddress")
  }

  const updateProfile = (newProfile: ArProfile) => {
    setProfile(newProfile)
  }

  return (
    <ArweaveContext.Provider
      value={{
        arweaveWallet,
        isArweaveConnected,
        arweaveAddress,
        profile,
        isProfileVerified,
        connectArweave,
        disconnectArweave,
        updateProfile,
      }}
    >
      {children}
    </ArweaveContext.Provider>
  )
}

export function useArweave() {
  const context = useContext(ArweaveContext)
  if (context === undefined) {
    throw new Error("useArweave must be used within an ArweaveProvider")
  }
  return context
}
