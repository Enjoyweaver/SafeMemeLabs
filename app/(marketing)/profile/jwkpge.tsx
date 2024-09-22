"use client"

import React, { useEffect, useState } from "react"
import Arweave from "arweave"
import Account, { ArAccount, ArProfile } from "arweave-account"
import { ArweaveWebWallet } from "arweave-wallet-connector"

import "./styles.css"

interface ProfileData {
  handleName?: string
  name?: string
  bio?: string
  avatar?: string
  avatarURL?: string
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
    [key: string]: string // Dynamic keys for different wallet types
  }
}

interface WalletInfo {
  address: string
  jwk: any | null // JWK is null if the wallet is connected via Arweave Web Wallet
}

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
  const [arweaveWallet, setArweaveWallet] = useState<ArweaveWebWallet | null>(
    null
  )
  const [isConnected, setIsConnected] = useState(false)
  const [existingWallets, setExistingWallets] = useState<WalletInfo[]>([])
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [showJwkModal, setShowJwkModal] = useState(false)
  const [currentJwk, setCurrentJwk] = useState<any>(null)

  // New state variables for managing ArProfiles
  const [arProfiles, setArProfiles] = useState<WalletInfo[]>([])
  const [selectedProfile, setSelectedProfile] = useState<WalletInfo | null>(
    null
  )

  const arweave = Arweave.init({})

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

  useEffect(() => {
    const connectAccount = async () => {
      if (walletInfo?.jwk) {
        try {
          await account.connect(walletInfo.jwk)
        } catch (error) {
          console.error("Error connecting account with JWK:", error)
          alert("Failed to connect account with the selected wallet.")
        }
      } else {
        try {
          await account.connect()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletInfo, isConnected])

  // Function to fetch all ArProfiles associated with an ArAccount
  const fetchAllArProfiles = async (address: string) => {
    try {
      const arAccount: ArAccount = await account.get(address)
      const profiles: WalletInfo[] = []

      // Main profile (connected wallet)
      profiles.push({ address: arAccount.addr, jwk: walletInfo?.jwk || null })

      // Additional profiles from the wallets object
      if (arAccount.profile.wallets) {
        for (const [key, addr] of Object.entries(arAccount.profile.wallets)) {
          profiles.push({ address: addr, jwk: null }) // Assuming additional profiles don't have JWKs
        }
      }

      setArProfiles(profiles)
      setSelectedProfile(profiles[0] || null) // Default to the main profile
      if (profiles[0]) {
        fetchProfileData(profiles[0].address, profiles[0].jwk)
      }
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
      setWalletInfo({ address, jwk: null })
      setIsConnected(true)
      // fetchProfileData(address, null) will be called in useEffect after connection
    } catch (error) {
      console.error("Error connecting wallet:", error)
      alert("Failed to connect Arweave.app Wallet.")
    }
  }

  const handleInitializeProfile = async () => {
    try {
      // Disconnect any existing Arweave Web Wallet
      if (arweaveWallet) {
        await arweaveWallet.disconnect()
        setArweaveWallet(null)
      }

      // Generate a new JWK (JSON Wallet Key)
      const jwk = await arweave.wallets.generate()
      const address = await arweave.wallets.jwkToAddress(jwk)

      // Create a new wallet object
      const newWallet: WalletInfo = { address, jwk }
      setWalletInfo(newWallet)
      setIsConnected(true)

      // Update existing wallets in state and localStorage
      const updatedWallets = [...existingWallets, newWallet]
      setExistingWallets(updatedWallets)
      localStorage.setItem("wallets", JSON.stringify(updatedWallets))

      // Connect the Account instance with the new JWK for signing transactions
      await account.connect(jwk)

      // Initialize profile data for the new wallet
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

      // Display the JWK modal for user backup
      setCurrentJwk(jwk)
      setShowJwkModal(true)

      // Trigger the download of the JWK for user backup
      downloadJwk(jwk)
    } catch (error) {
      console.error("Error initializing profile:", error)
      alert("Failed to initialize new profile.")
    }
  }

  const handleCreateNewProfile = async () => {
    try {
      if (!walletInfo) {
        alert("No ArAccount connected.")
        return
      }

      // Generate a new JWK (JSON Wallet Key)
      const newJwk = await arweave.wallets.generate()
      const newAddress = await arweave.wallets.jwkToAddress(newJwk)

      // Create a new WalletInfo object
      const newProfile: WalletInfo = { address: newAddress, jwk: newJwk }

      // Update ArAccount's profile to include the new wallet address
      const arAccount: ArAccount = await account.get(walletInfo.address)
      arAccount.profile.wallets = {
        ...(arAccount.profile.wallets || {}),
        [`profile_${newAddress.substring(0, 8)}`]: newAddress, // Unique key for each profile
      }

      // Update the profile on Arweave
      await account.connect(walletInfo.jwk)
      await account.updateProfile(arAccount.profile)

      // Update local state and storage
      setArProfiles((prev) => [...prev, newProfile])
      setExistingWallets((prev) => [...prev, newProfile])
      localStorage.setItem(
        "wallets",
        JSON.stringify([...existingWallets, newProfile])
      )

      // Optionally, set the new profile as selected
      setSelectedProfile(newProfile)
      fetchProfileData(newProfile.address, newProfile.jwk)

      // Display the JWK modal for user backup
      setCurrentJwk(newJwk)
      setShowJwkModal(true)

      // Trigger the download of the new JWK for user backup
      downloadJwk(newJwk)

      alert("New ArProfile created successfully!")
    } catch (error) {
      console.error("Error creating new ArProfile:", error)
      alert("Failed to create new ArProfile.")
    }
  }

  const downloadJwk = (jwk: any) => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jwk))
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute(
      "download",
      `arweave-key-${walletInfo?.address}.json`
    )
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  const handleModalClose = () => {
    setShowJwkModal(false)
    setCurrentJwk(null)
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
    setArProfiles([])
    setSelectedProfile(null)
  }

  const handleWalletClick = async (wallet: WalletInfo) => {
    try {
      if (wallet.jwk) {
        // Disconnect any existing Arweave Web Wallet
        if (arweaveWallet) {
          await arweaveWallet.disconnect()
          setArweaveWallet(null)
        }
        // Set the selected wallet information
        setWalletInfo(wallet)
        setIsConnected(true)
      } else {
        // Connect to Arweave Web Wallet if the selected wallet doesn't have a JWK
        await handleConnectWallet()
        return
      }
      // Fetch profile data for the selected wallet will be handled in useEffect
    } catch (error) {
      console.error("Error selecting wallet:", error)
      alert("Failed to select wallet.")
    }
  }

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
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
            // Upload using Arweave Web Wallet
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
            // Upload using local JWK
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

      reader.readAsArrayBuffer(selectedImage)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error uploading image.")
    }
  }

  const handleSaveProfile = async () => {
    try {
      const activeAddress = selectedProfile?.address
      if (!activeAddress) {
        alert("No wallet address found.")
        return
      }

      const user: ArAccount = await account.get(activeAddress)
      user.profile.handleName =
        profileData.handleName || user.profile.handleName
      user.profile.bio = profileData.bio || user.profile.bio
      user.profile.name = profileData.name || user.profile.name
      user.profile.email = profileData.email || user.profile.email
      user.profile.links = profileData.links || user.profile.links
      user.profile.wallets = profileData.wallets || user.profile.wallets
      user.profile.avatar = profileData.avatar || user.profile.avatar
      user.profile.avatarURL = profileData.avatarURL || user.profile.avatarURL

      // Connect the Account instance with the correct key
      if (selectedProfile?.jwk) {
        await account.connect(selectedProfile.jwk)
      } else {
        await account.connect()
      }

      // Update the profile on Arweave
      await account.updateProfile(user.profile)
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile.")
    }
  }

  const fetchProfileData = async (address: string, jwk: any | null) => {
    try {
      const profile = await account.get(address)
      if (profile && profile.profile) {
        setProfileData(profile.profile)
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
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-section">
        <h2>Your Profile</h2>
        {isConnected && selectedProfile ? (
          <>
            {/* Profile Selector */}
            <div className="profile-selector">
              <label htmlFor="profile-select">Select Profile:</label>
              <select
                id="profile-select"
                value={selectedProfile.address}
                onChange={(e) => {
                  const selected = arProfiles.find(
                    (profile) => profile.address === e.target.value
                  )
                  if (selected) {
                    setSelectedProfile(selected)
                    fetchProfileData(selected.address, selected.jwk)
                  }
                }}
              >
                {arProfiles.map((profile) => (
                  <option key={profile.address} value={profile.address}>
                    {profile.address}
                    {profile.jwk ? " (Local Wallet)" : " (Connected Wallet)"}
                  </option>
                ))}
              </select>
            </div>

            {/* Button to Create New ArProfile */}
            <div className="create-profile">
              <button onClick={handleCreateNewProfile}>
                Create New ArProfile
              </button>
            </div>

            {/* Profile Image */}
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

            {/* Profile Fields */}
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

            {/* Social Links */}
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
              {/* Repeat similar inputs for other social links as needed */}
            </div>

            {/* Wallets (Crosschain Addresses) */}
            <div className="profile-wallets">
              <h3>Wallet Addresses</h3>
              {profileData.wallets &&
              Object.keys(profileData.wallets).length > 0 ? (
                <ul>
                  {Object.entries(profileData.wallets).map(
                    ([type, address]) => (
                      <li key={type}>
                        <strong>{type.toUpperCase()}:</strong> {address}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p>No wallet addresses added.</p>
              )}
            </div>

            {/* Save and Disconnect Buttons */}
            <button onClick={handleSaveProfile}>Save Profile</button>
            <button onClick={handleDisconnect}>Disconnect</button>
          </>
        ) : (
          <p>Please connect your wallet to create or view your profile.</p>
        )}
      </div>

      {/* Login Section */}
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
                      <button onClick={() => handleWalletClick(wallet)}>
                        {wallet.address}
                        {wallet.jwk ? " (Local Wallet)" : " (Connected Wallet)"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* JWK Modal */}
      {showJwkModal && currentJwk && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Backup Your Private Key</h2>
            <p>
              Please securely back up your private key. This is the only way to
              access your wallet.
            </p>
            <textarea
              readOnly
              value={JSON.stringify(currentJwk, null, 2)}
              rows={10}
              cols={50}
            />
            <p>
              <strong>Important:</strong> Do not share this key with anyone. If
              you lose it, you will lose access to your wallet.
            </p>
            <button onClick={handleModalClose}>I have backed up my key</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
