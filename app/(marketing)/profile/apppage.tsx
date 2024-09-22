"use client"

import React, { useEffect, useState } from "react"
import Arweave from "arweave"
import Account from "arweave-account"
import { ArweaveWebWallet } from "arweave-wallet-connector"

import "./styles.css"

interface ProfileData {
  handleName?: string
  name?: string
  bio?: string
  avatar?: string
  avatarURL?: string
  banner?: string
  bannerURL?: string
  email?: string
  links?: {
    twitter?: string
    instagram?: string
    tiktok?: string
    website?: string
    github?: string
    discord?: string
    linkedin?: string
    facebook?: string
    youtube?: string
    twitch?: string
  }
  wallets?: {
    BTC?: string
    eth?: string
    FTM?: string
    AVAX?: string
    POL?: string
    Sol?: string
    Arbitrum?: string
    Sonic?: string
    Rootstock?: string
  }
}

interface WalletInfo {
  address: string
  jwk: any
}

type ArweaveWebWalletType = InstanceType<typeof ArweaveWebWalletClass>

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    handleName: "",
    name: "",
    bio: "",
    avatar: "",
    avatarURL: "",
    email: "",
    links: {},
    wallets: {},
  })

  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [arweaveWallet, setArweaveWallet] =
    useState<ArweaveWebWalletType | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [existingWallets, setExistingWallets] = useState<WalletInfo[]>([])
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false,
  })
  const account = new Account(arweave)

  useEffect(() => {
    const wallets = JSON.parse(localStorage.getItem("wallets") || "[]")
    setExistingWallets(wallets)
  }, [])

  useEffect(() => {
    if (arweaveWallet) {
      window.arweaveWallet = arweaveWallet.namespaces.arweaveWallet
    }
  }, [arweaveWallet])

  const handleConnectWallet = async () => {
    try {
      const wallet = new ArweaveWebWallet({
        name: "SafeMeme Labs",
        logo: "URL to your app logo",
      })
      wallet.setUrl("https://arweave.app")
      await wallet.connect()
      setArweaveWallet(wallet)
      const address = wallet.address
      if (!address) {
        throw new Error("Wallet address is undefined")
      }
      setWalletInfo({ address, jwk: null })
      setIsConnected(true)

      fetchProfileData(address)
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  const handleInitializeProfile = async () => {
    try {
      const jwk = await arweave.wallets.generate()
      const address = await arweave.wallets.jwkToAddress(jwk)
      const newWallet = { address, jwk }
      setWalletInfo(newWallet)
      setIsConnected(true)

      const updatedWallets = [...existingWallets, newWallet]
      setExistingWallets(updatedWallets)
      localStorage.setItem("wallets", JSON.stringify(updatedWallets))
    } catch (error) {
      console.error("Error initializing profile:", error)
    }
  }

  const handleDisconnect = () => {
    if (arweaveWallet) {
      arweaveWallet.disconnect()
      setArweaveWallet(null)
    }
    setWalletInfo(null)
    setIsConnected(false)
    setProfileData({
      handleName: "",
      name: "",
      bio: "",
      avatar: "",
      avatarURL: "",
      email: "",
      links: {},
      wallets: {},
    })
    setSelectedImage(null)
  }

  const handleWalletClick = async (wallet: WalletInfo) => {
    setWalletInfo(wallet)
    setIsConnected(true)
    fetchProfileData(wallet.address)
  }

  const handleAppWalletClick = async (wallet: WalletInfo) => {
    setWalletInfo(wallet)
    setIsConnected(true)
    fetchAppProfileData(wallet.address)
  }

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  const handleImageUpload = async () => {
    if (selectedImage) {
      try {
        const reader = new FileReader()
        reader.onload = async (event) => {
          const data = event.target?.result
          if (data) {
            const dataArray = new Uint8Array(data as ArrayBuffer)

            let transaction

            // Get the address from the browser wallet if connected
            const arweaveWalletAddress = arweaveWallet
              ? await window.arweaveWallet.getActiveAddress()
              : null

            if (arweaveWallet && arweaveWalletAddress === walletInfo?.address) {
              // Create the transaction without a key
              transaction = await arweave.createTransaction({ data: dataArray })

              transaction.addTag("Content-Type", selectedImage.type)

              // Dispatch the transaction using the browser wallet
              const result = await window.arweaveWallet.dispatch(transaction)

              if (result && result.id) {
                const txId = result.id
                const avatarURL = `https://arweave.net/${txId}`
                setProfileData((prev) => ({ ...prev, avatar: txId, avatarURL }))
                alert("Image uploaded successfully!")
              } else {
                alert("Failed to upload image.")
              }
            } else if (walletInfo?.jwk) {
              transaction = await arweave.createTransaction(
                { data: dataArray },
                walletInfo.jwk
              )

              transaction.addTag("Content-Type", selectedImage.type)

              await arweave.transactions.sign(transaction, walletInfo.jwk)

              let uploader = await arweave.transactions.getUploader(transaction)
              while (!uploader.isComplete) {
                await uploader.uploadChunk()
              }

              const txId = transaction.id
              const avatarURL = `https://arweave.net/${txId}`
              setProfileData((prev) => ({ ...prev, avatar: txId, avatarURL }))
              alert("Image uploaded successfully!")
            } else {
              alert("Wallet not connected or addresses do not match.")
              return
            }
          }
        }
        reader.readAsArrayBuffer(selectedImage)
      } catch (error) {
        console.error("Error uploading image:", error)
        alert("Error uploading image.")
      }
    } else {
      alert("No image selected.")
    }
  }

  const handleSaveProfile = async () => {
    try {
      const data = JSON.stringify({
        handleName: profileData.handleName || "",
        name: profileData.name || "",
        bio: profileData.bio || "",
        avatar: profileData.avatar || "",
        email: profileData.email || "",
        links: profileData.links || {},
        wallets: profileData.wallets || {},
      })

      let transaction

      // Get the address from the browser wallet if connected
      const arweaveWalletAddress = arweaveWallet
        ? await window.arweaveWallet.getActiveAddress()
        : null

      if (arweaveWallet && arweaveWalletAddress === walletInfo?.address) {
        // Create the transaction without a key
        transaction = await arweave.createTransaction({ data })

        transaction.addTag("Content-Type", "application/json")
        transaction.addTag("App-Name", "arweave-id")
        transaction.addTag("App-Version", "0.0.1")
        transaction.addTag("Protocol-Name", "Account-0.2")

        // Dispatch the transaction using the browser wallet
        const result = await window.arweaveWallet.dispatch(transaction)

        if (result && result.id) {
          alert("Profile data saved successfully!")
        } else {
          alert("Failed to save profile data.")
        }
      } else if (walletInfo?.jwk) {
        // Use the JWK keypair to sign and send the transaction
        transaction = await arweave.createTransaction({ data }, walletInfo.jwk)

        transaction.addTag("Content-Type", "application/json")
        transaction.addTag("App-Name", "arweave-id")
        transaction.addTag("App-Version", "0.0.1")
        transaction.addTag("Protocol-Name", "Account-0.2")

        await arweave.transactions.sign(transaction, walletInfo.jwk)

        let uploader = await arweave.transactions.getUploader(transaction)
        while (!uploader.isComplete) {
          await uploader.uploadChunk()
        }

        alert("Profile data saved successfully!")
      } else {
        alert("Wallet not connected or addresses do not match.")
        return
      }
    } catch (error) {
      console.error("Error saving profile data:", error)
      alert("Error saving profile data.")
    }
  }

  const fetchProfileData = async (address: string) => {
    try {
      const profile = await account.get(address)
      if (profile && profile.profile) {
        setProfileData(profile.profile)
      } else {
        // If no profile data, reset the profile data
        setProfileData({
          handleName: "",
          name: "",
          bio: "",
          avatar: "",
          avatarURL: "",
          email: "",
          links: {},
          wallets: {},
        })
      }
    } catch (error) {
      console.error("Error fetching profile data:", error)
    }
  }

  const fetchAppProfileData = async (address: string) => {
    try {
      const transactions = await arweave.arql({
        op: "and",
        expr1: {
          op: "equals",
          expr1: "App-Name",
          expr2: "arweave-id",
        },
        expr2: {
          op: "equals",
          expr1: "Protocol-Name",
          expr2: "Account-0.2",
        },
      })

      const profileTx = transactions.find(async (txId: string) => {
        const tx = await arweave.transactions.get(txId)
        return tx.owner.address === address
      })

      if (profileTx) {
        const data = await arweave.transactions.getData(profileTx, {
          decode: true,
          string: true,
        })
        const profile = JSON.parse(data)
        setProfileData(profile)
      } else {
        setProfileData({
          handleName: "",
          name: "",
          bio: "",
          avatar: "",
          avatarURL: "",
          email: "",
          links: {},
          wallets: {},
        })
      }
    } catch (error) {
      console.error("Error fetching profile data:", error)
      alert("Failed to fetch profile data.")
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-section">
        <h2>Your Profile</h2>
        {isConnected ? (
          <>
            <div className="profile-image">
              {profileData.avatarURL ? (
                <img
                  src={profileData.avatarURL}
                  alt="Profile"
                  className="profile-picture"
                />
              ) : (
                <div className="placeholder-image">No Image</div>
              )}
              <input type="file" onChange={handleImageSelection} />
              {selectedImage && (
                <>
                  <button onClick={handleImageUpload}>
                    Submit Image to Arweave
                  </button>
                </>
              )}
            </div>
            <div className="profile-handle">
              <input
                type="text"
                value={profileData.handleName}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    handleName: e.target.value,
                  })
                }
                placeholder="Handle Name"
              />
            </div>
            <div className="profile-name">
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                placeholder="Your Name"
              />
            </div>
            <div className="profile-email">
              <input
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                placeholder="Email"
              />
            </div>
            <div className="profile-description">
              <textarea
                value={profileData.bio}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    bio: e.target.value,
                  })
                }
                placeholder="Short description about yourself"
              />
            </div>
            <div className="social-links">
              <input
                type="text"
                value={profileData.links?.twitter || ""}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    links: {
                      ...profileData.links,
                      twitter: e.target.value,
                    },
                  })
                }
                placeholder="Twitter"
              />
            </div>
            <div className="profile-wallets">
              <h3>Wallet Addresses</h3>
              <input
                type="text"
                value={profileData.wallets?.eth || ""}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    wallets: {
                      ...profileData.wallets,
                      eth: e.target.value,
                    },
                  })
                }
                placeholder="Ethereum Address"
              />
            </div>
            <button onClick={handleSaveProfile}>Save Profile</button>
            <button onClick={handleDisconnect}>Disconnect</button>
          </>
        ) : (
          <p>Please connect your wallet to create or view your profile.</p>
        )}
      </div>
      <div className="login-section">
        {!isConnected && (
          <>
            <h2>Login</h2>
            <button onClick={handleConnectWallet}>
              Connect Arweave.app Wallet
            </button>
            <button onClick={handleInitializeProfile}>
              Initialize New Profile
            </button>

            {existingWallets.length > 0 && (
              <div>
                <h3 className="profile-title">Your Profiles</h3>
                <ul>
                  {existingWallets.map((wallet) => (
                    <li key={wallet.address}>
                      <button onClick={() => handleAppWalletClick(wallet)}>
                        {wallet.address}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
