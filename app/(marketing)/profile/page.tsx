"use client"

import React, { useEffect, useState } from "react"
import { chains, config } from "@/Constants/config"
import Arweave from "arweave"
import Account, { ArAccount, ArProfile } from "arweave-account"
import { ArweaveWebWallet } from "arweave-wallet-connector"
import { ethers } from "ethers"
import { useAccount, useConnect, useSignMessage } from "wagmi"

import MyProfile from "../myprofile/page"
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
  website?: string
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
    [key: string]: string
  }
}

interface WalletInfo {
  address: string
  jwk: any | null
}

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    handleName: "",
    name: "",
    bio: "",
    avatar: "",
    avatarURL: "",
    banner: "",
    bannerURL: "",
    email: "",
    website: "",
    links: {},
    wallets: {},
  })

  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [arweaveWallet, setArweaveWallet] = useState<ArweaveWebWallet | null>(
    null
  )
  const [isConnected, setIsConnected] = useState(false)
  const [existingWallets, setExistingWallets] = useState<WalletInfo[]>([])
  const [isSquare, setIsSquare] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null)
  const [showJwkModal, setShowJwkModal] = useState(false)
  const [currentJwk, setCurrentJwk] = useState<any>(null)
  const [arProfiles, setArProfiles] = useState<WalletInfo[]>([])
  const [selectedProfile, setSelectedProfile] = useState<WalletInfo | null>(
    null
  )
  const [uniqueLink, setUniqueLink] = useState<string>("")
  const [newBlockchain, setNewBlockchain] = useState<string>("")
  const [newWalletAddress, setNewWalletAddress] = useState<string>("")

  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  })

  const account = new Account(arweave)

  useEffect(() => {
    const wallets = JSON.parse(localStorage.getItem("wallets") || "[]")
    setExistingWallets(wallets)
  }, [])

  useEffect(() => {
    if (arweaveWallet) {
      console.log("Arweave Wallet instance updated.")
    }
  }, [arweaveWallet])

  useEffect(() => {
    const connectAccount = async () => {
      if (walletInfo?.jwk) {
        try {
          await account.connect(walletInfo.jwk)
          console.log("Account connected with JWK.")
        } catch (error) {
          console.error("Error connecting account with JWK:", error)
          alert("Failed to connect account with the selected wallet.")
        }
      } else {
        try {
          await account.connect()
          console.log("Account connected via Arweave Web Wallet.")
        } catch (error) {
          console.error(
            "Error connecting account with Arweave Web Wallet:",
            error
          )
          alert("Failed to connect account with Arweave Web Wallet.")
        }
      }
    }

    if (walletInfo && isConnected) {
      connectAccount().then(() => {
        fetchAllArProfiles(walletInfo.address)
      })
    }
  }, [walletInfo, isConnected])

  const handleAddWallet = async () => {
    if (!newBlockchain || !newWalletAddress) {
      alert("Please select a blockchain and enter a wallet address.")
      return
    }

    const selectedChain = chains.find(
      (chain) => chain.id.toString() === newBlockchain
    )
    if (!selectedChain) {
      alert("Selected blockchain is not supported.")
      return
    }

    const connector = config.connectors.find((connector) => connector.ready)
    if (!connector) {
      alert("Unable to find a connector for the selected blockchain.")
      return
    }

    try {
      await connector.connect()
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const message = `Verify wallet address ${newWalletAddress} on blockchain ID ${newBlockchain}`
      const signature = await signer.signMessage(message)
      const recoveredAddress = ethers.utils.verifyMessage(message, signature)

      if (recoveredAddress.toLowerCase() !== newWalletAddress.toLowerCase()) {
        alert("Signature verification failed.")
        return
      }

      const updatedWallets = {
        ...profileData.wallets,
        [newBlockchain]: newWalletAddress,
      }

      setProfileData((prev) => ({
        ...prev,
        wallets: updatedWallets,
      }))

      await handleSaveProfile(updatedWallets)

      alert("Wallet address added and verified successfully.")
      setNewBlockchain("")
      setNewWalletAddress("")
    } catch (error) {
      console.error("Error verifying wallet address:", error)
      alert("Failed to verify wallet address.")
    }
  }

  const handleSaveProfile = async (wallets: { [key: string]: string }) => {
    try {
      if (!profileData.handleName) {
        alert("Handle Name is required.")
        console.log("Handle Name is missing.")
        return
      }

      const activeAddress = selectedProfile?.address
      if (!activeAddress) {
        alert("No wallet address found.")
        console.log("No active wallet address found.")
        return
      }

      const user: ArAccount = await account.get(activeAddress)
      user.profile.handleName = profileData.handleName
      user.profile.bio = profileData.bio
      user.profile.name = profileData.name
      user.profile.email = profileData.email
      user.profile.website = profileData.website
      user.profile.links = profileData.links
      user.profile.wallets = wallets
      user.profile.avatar = profileData.avatar
      user.profile.avatarURL = profileData.avatarURL
      user.profile.banner = profileData.banner
      user.profile.bannerURL = profileData.bannerURL

      if (selectedProfile?.jwk) {
        await account.connect(selectedProfile.jwk)
      } else {
        await account.connect()
      }

      await account.updateProfile(user.profile)
      console.log("Profile updated successfully.")

      alert("Profile updated successfully!")

      const domain = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000"
      setUniqueLink(`${domain}/${user.profile.handleName}`)
      console.log(
        "Unique profile link set:",
        `${domain}/${user.profile.handleName}`
      )
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile.")
    }
  }

  const fetchAllArProfiles = async (address: string) => {
    try {
      const arAccount: ArAccount = await account.get(address)
      const profiles: WalletInfo[] = []

      profiles.push({ address: arAccount.addr, jwk: walletInfo?.jwk || null })
      if (arAccount.profile.wallets) {
        for (const [key, addr] of Object.entries(arAccount.profile.wallets)) {
          profiles.push({ address: addr, jwk: null })
        }
      }

      setArProfiles(profiles)
      setSelectedProfile(profiles[0] || null)
      if (profiles[0]) {
        fetchProfileData(profiles[0].address, profiles[0].jwk)
      }
      console.log("Fetched all Arweave profiles:", profiles)
    } catch (error) {
      console.error("Error fetching ArAccount profiles:", error)
      alert("Failed to fetch profiles for the connected account.")
    }
  }

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
        throw new Error("Wallet address not found.")
      }
      setWalletInfo({ address, jwk: null })
      setIsConnected(true)
      console.log("Arweave Wallet connected. Address:", address)
    } catch (error) {
      console.error("Error connecting wallet:", error)
      alert("Failed to connect Arweave.app Wallet.")
    }
  }

  const handleDisconnect = () => {
    if (arweaveWallet) {
      arweaveWallet.disconnect()
      setArweaveWallet(null)
      console.log("Arweave Wallet disconnected.")
    }
    setWalletInfo(null)
    setIsConnected(false)
    setProfileData({
      handleName: "",
      name: "",
      bio: "",
      avatar: "",
      avatarURL: "",
      banner: "",
      bannerURL: "",
      email: "",
      website: "",
      links: {},
      wallets: {},
    })
    setSelectedImage(null)
    setSelectedBanner(null)
    setArProfiles([])
    setSelectedProfile(null)
    console.log("User disconnected and profile reset.")
  }

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      console.log("Image selected:", file.name)
    }
  }

  const handleBannerSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedBanner(file)
      console.log("Banner selected:", file.name)
    }
  }

  const handleImageUpload = async () => {
    if (!selectedImage) {
      alert("No image selected.")
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const data = event.target?.result
        if (data && selectedProfile) {
          const dataArray = new Uint8Array(data as ArrayBuffer)
          let txId: string

          if (arweaveWallet && selectedProfile.jwk === null) {
            const tx = await arweave.createTransaction({ data: dataArray })
            tx.addTag("Content-Type", selectedImage.type)
            const result = await window.arweaveWallet.dispatch(tx)
            if (result && result.id) {
              txId = result.id
            } else {
              alert("Failed to upload image.")
              return
            }
          } else if (selectedProfile.jwk) {
            const tx = await arweave.createTransaction(
              { data: dataArray },
              selectedProfile.jwk
            )
            tx.addTag("Content-Type", selectedImage.type)
            await arweave.transactions.sign(tx, selectedProfile.jwk)
            const uploader = await arweave.transactions.getUploader(tx)
            while (!uploader.isComplete) {
              await uploader.uploadChunk()
            }
            txId = tx.id
          } else {
            alert("Wallet not connected or addresses do not match.")
            return
          }

          // **Use Backticks for Template Literals**
          const avatarURL = `https://arweave.net/${txId}`
          const activeAddress = selectedProfile.address

          if (!activeAddress) {
            alert("No wallet address found.")
            return
          }

          const user: ArAccount = await account.get(activeAddress)
          if (selectedProfile.jwk) {
            await account.connect(selectedProfile.jwk)
          } else {
            await account.connect()
          }
          user.profile.avatar = txId
          user.profile.avatarURL = avatarURL
          await account.updateProfile(user.profile)
          setProfileData((prev) => ({
            ...prev,
            avatar: txId,
            avatarURL,
          }))
          alert("Image uploaded and profile updated successfully!")
        }
      }

      reader.onerror = (error) => {
        console.error("Error reading file:", error)
        alert("Error reading the selected file.")
      }

      reader.readAsArrayBuffer(selectedImage)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error uploading image.")
    }
  }

  const handleBannerUpload = async () => {
    if (!selectedBanner) {
      alert("No banner selected.")
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const data = event.target?.result
        if (data && selectedProfile) {
          const dataArray = new Uint8Array(data as ArrayBuffer)
          let txId: string

          if (arweaveWallet && selectedProfile.jwk === null) {
            const tx = await arweave.createTransaction({ data: dataArray })
            tx.addTag("Content-Type", selectedBanner.type)
            const result = await window.arweaveWallet.dispatch(tx)
            if (result && result.id) {
              txId = result.id
            } else {
              alert("Failed to upload banner.")
              return
            }
          } else if (selectedProfile.jwk) {
            const tx = await arweave.createTransaction(
              { data: dataArray },
              selectedProfile.jwk
            )
            tx.addTag("Content-Type", selectedBanner.type)
            await arweave.transactions.sign(tx, selectedProfile.jwk)
            const uploader = await arweave.transactions.getUploader(tx)
            while (!uploader.isComplete) {
              await uploader.uploadChunk()
            }
            txId = tx.id
          } else {
            alert("Wallet not connected or addresses do not match.")
            return
          }

          const bannerURL = `https://arweave.net/${txId}`
          const activeAddress = selectedProfile.address

          if (!activeAddress) {
            alert("No wallet address found.")
            return
          }

          const user: ArAccount = await account.get(activeAddress)
          if (selectedProfile.jwk) {
            await account.connect(selectedProfile.jwk)
          } else {
            await account.connect()
          }
          user.profile.banner = txId
          user.profile.bannerURL = bannerURL
          await account.updateProfile(user.profile)
          setProfileData((prev) => ({
            ...prev,
            banner: txId,
            bannerURL,
          }))
          alert("Banner uploaded and profile updated successfully!")
        }
      }

      reader.onerror = (error) => {
        console.error("Error reading file:", error)
        alert("Error reading the selected file.")
      }

      reader.readAsArrayBuffer(selectedBanner)
    } catch (error) {
      console.error("Error uploading banner:", error)
      alert("Error uploading banner.")
    }
  }

  const fetchProfileData = async (address: string, jwk: any | null) => {
    try {
      const profile = await account.get(address)
      if (profile && profile.profile) {
        setProfileData({
          handleName: profile.profile.handleName || "",
          name: profile.profile.name || "",
          bio: profile.profile.bio || "",
          avatar: profile.profile.avatar || "",
          avatarURL: profile.profile.avatarURL || "",
          banner: profile.profile.banner || "",
          bannerURL: profile.profile.bannerURL || "",
          email: profile.profile.email || "",
          website: profile.profile.website || "",
          links: profile.profile.links || {},
          wallets: profile.profile.wallets || {},
        })

        if (profile.profile.handleName) {
          const domain =
            process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000"
          setUniqueLink(`${domain}/${profile.profile.handleName}`)
          console.log(
            "Unique profile link fetched:",
            `${domain}/${profile.profile.handleName}`
          )
        }
      } else {
        setProfileData({
          handleName: "",
          name: "",
          bio: "",
          avatar: "",
          avatarURL: "",
          banner: "",
          bannerURL: "",
          email: "",
          website: "",
          links: {},
          wallets: {},
        })
        setUniqueLink("")
        console.log("No profile data found. Resetting profile data.")
      }
    } catch (error) {
      console.error("Error fetching profile data:", error)
    }
  }

  return (
    <div>
      <div className="profile-page">
        <div className="profile-section">
          <h2 className="profile-title">Your Profile</h2>
          {isConnected && selectedProfile ? (
            <>
              <div className="profile-banner">
                {profileData.bannerURL ? (
                  <label className="image-upload-label">
                    <img
                      src={profileData.bannerURL}
                      alt="Banner"
                      className="banner-image"
                    />
                    <input
                      type="file"
                      className="file-input"
                      onChange={handleBannerSelection}
                      accept="image/*"
                    />
                    <div className="overlay">Click to Upload</div>
                  </label>
                ) : (
                  <label className="image-upload-label">
                    <input
                      type="file"
                      className="file-input"
                      onChange={handleBannerSelection}
                      accept="image/*"
                    />
                    <div className="overlay">Click to Upload</div>
                  </label>
                )}
                {selectedBanner && (
                  <button
                    onClick={handleBannerUpload}
                    className="submit-button"
                  >
                    Submit Banner to Arweave
                  </button>
                )}
              </div>

              <div className="profile-image">
                {profileData.avatarURL ? (
                  <label className="image-upload-label">
                    <img
                      src={profileData.avatarURL}
                      alt="Profile"
                      className="profile-picture"
                    />
                    <input
                      type="file"
                      className="file-input"
                      onChange={handleImageSelection}
                      accept="image/*"
                    />
                    <div className="overlay">Click to Upload</div>
                  </label>
                ) : (
                  <label className="image-upload-label">
                    <input
                      type="file"
                      className="file-input"
                      onChange={handleImageSelection}
                      accept="image/*"
                    />
                    <div className="overlay">Click to Upload</div>
                  </label>
                )}
                {selectedImage && (
                  <button onClick={handleImageUpload} className="submit-button">
                    Submit Image to Arweave
                  </button>
                )}
              </div>

              <div className="social-links">
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
                <div className="profile-website">
                  <input
                    type="text"
                    value={profileData.website}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        website: e.target.value,
                      })
                    }
                    placeholder="Website"
                  />
                </div>
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
                <input
                  type="text"
                  value={profileData.links?.instagram || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      links: {
                        ...profileData.links,
                        instagram: e.target.value,
                      },
                    })
                  }
                  placeholder="Instagram"
                />
                <input
                  type="text"
                  value={profileData.links?.tiktok || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      links: {
                        ...profileData.links,
                        tiktok: e.target.value,
                      },
                    })
                  }
                  placeholder="TikTok"
                />
                <input
                  type="text"
                  value={profileData.links?.website || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      links: {
                        ...profileData.links,
                        website: e.target.value,
                      },
                    })
                  }
                  placeholder="Website"
                />
                <input
                  type="text"
                  value={profileData.links?.github || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      links: {
                        ...profileData.links,
                        github: e.target.value,
                      },
                    })
                  }
                  placeholder="Github"
                />
                <input
                  type="text"
                  value={profileData.links?.discord || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      links: {
                        ...profileData.links,
                        discord: e.target.value,
                      },
                    })
                  }
                  placeholder="Discord"
                />
                <input
                  type="text"
                  value={profileData.links?.linkedin || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      links: {
                        ...profileData.links,
                        linkedin: e.target.value,
                      },
                    })
                  }
                  placeholder="LinkedIn"
                />
                <input
                  type="text"
                  value={profileData.links?.facebook || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      links: {
                        ...profileData.links,
                        facebook: e.target.value,
                      },
                    })
                  }
                  placeholder="Facebook"
                />
                <input
                  type="text"
                  value={profileData.links?.youtube || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      links: {
                        ...profileData.links,
                        youtube: e.target.value,
                      },
                    })
                  }
                  placeholder="YouTube"
                />
                <input
                  type="text"
                  value={profileData.links?.twitch || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      links: {
                        ...profileData.links,
                        twitch: e.target.value,
                      },
                    })
                  }
                  placeholder="Twitch"
                />
              </div>
              <div className="profile-wallets">
                <h3>Wallet Addresses</h3>
                {profileData.wallets &&
                Object.keys(profileData.wallets).length > 0 ? (
                  <ul>
                    {Object.entries(profileData.wallets).map(
                      ([chainId, address]) => (
                        <li key={chainId}>
                          <strong>
                            {chains.find(
                              (chain) => chain.id.toString() === chainId
                            )?.name || "Unknown Blockchain"}
                            :
                          </strong>{" "}
                          {address} (Verified)
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>No wallet addresses added.</p>
                )}
                <div className="add-wallet">
                  <select
                    value={newBlockchain}
                    onChange={(e) => setNewBlockchain(e.target.value)}
                  >
                    <option value="">Select Blockchain</option>
                    {chains.map((chain) => (
                      <option key={chain.id} value={chain.id}>
                        {chain.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Wallet Address"
                    value={newWalletAddress}
                    onChange={(e) => setNewWalletAddress(e.target.value)}
                  />
                  <button onClick={handleAddWallet}>Add Wallet</button>
                </div>
              </div>
              <div className="action-row">
                <div className="button-section">
                  <button onClick={handleSaveProfile}>Save Profile</button>
                  <button onClick={handleDisconnect}>Disconnect</button>
                </div>
                {uniqueLink && (
                  <div className="profile-link">
                    <p>Your profile link:</p>
                    <a
                      href={uniqueLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {uniqueLink}
                    </a>
                    <button
                      onClick={() => navigator.clipboard.writeText(uniqueLink)}
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="intro">
              Please connect your Arweave.app wallet to view or create your
              profile.
            </div>
          )}
          <div className="intro">
            {!isConnected && (
              <>
                <button onClick={handleConnectWallet}>
                  Log In or Create Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {isConnected && selectedProfile ? (
        <>
          <MyProfile />
        </>
      ) : (
        <p></p>
      )}
    </div>
  )
}

export default ProfilePage
