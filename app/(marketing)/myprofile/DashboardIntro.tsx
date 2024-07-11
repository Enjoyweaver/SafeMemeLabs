import React, { useEffect, useState } from "react"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"
import { safeLaunchFactory } from "@/Constants/config"
import { ethers } from "ethers"

interface DashboardProps {
  isConnected: boolean
  userAddress: string
  provider: ethers.providers.Web3Provider | null
  chainId: number | null
}

interface NFT {
  id: string
  name: string
  image: string
}

interface Frame {
  id: string
  content: string
  likes: number
}

interface SafeMeme {
  address: string
  name: string
  symbol: string
  totalSupply: string
}

const Dashboard: React.FC<DashboardProps> = ({
  isConnected,
  userAddress,
  provider,
  chainId,
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [frames, setFrames] = useState<Frame[]>([])
  const [safeMemes, setSafeMemes] = useState<SafeMeme[]>([])

  useEffect(() => {
    if (isConnected && provider && chainId) {
      fetchNFTs()
      fetchFrames()
      fetchSafeMemes()
    }
  }, [isConnected, provider, chainId, userAddress])

  const fetchNFTs = async () => {
    // Placeholder: Replace with actual NFT fetching logic
    setNfts([
      { id: "1", name: "Cool NFT #1", image: "https://placeholder.com/150" },
      { id: "2", name: "Awesome NFT #2", image: "https://placeholder.com/150" },
    ])
  }

  const fetchFrames = async () => {
    // Placeholder: Replace with actual Frames fetching logic from Warpcast
    setFrames([
      { id: "1", content: "This is my first frame!", likes: 10 },
      { id: "2", content: "Check out my new project", likes: 25 },
    ])
  }

  const fetchSafeMemes = async () => {
    if (!provider || !chainId) return

    const factoryContract = new ethers.Contract(
      safeLaunchFactory[chainId],
      TokenFactoryABI,
      provider
    )

    const tokenAddresses = await factoryContract.getSafeMemesDeployedByUser(
      userAddress
    )

    const tokenPromises = tokenAddresses.map(async (tokenAddress: string) => {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        provider
      )
      const name = await tokenContract.name()
      const symbol = await tokenContract.symbol()
      const totalSupply = await tokenContract.totalSupply()

      return {
        address: tokenAddress,
        name,
        symbol,
        totalSupply: ethers.utils.formatEther(totalSupply),
      }
    })

    const fetchedSafeMemes = await Promise.all(tokenPromises)
    setSafeMemes(fetchedSafeMemes)
  }

  const handleSectionClick = (section: string) => {
    setActiveSection(activeSection === section ? null : section)
  }

  if (!isConnected) {
    return (
      <div className="dashboard-intro">
        <h1 className="pagetitle">Welcome to Your Dashboard</h1>
        <div className="dashboard-layout">
          {["NFTs", "Frames", "SafeMemes", "SafeLaunch"].map((section) => (
            <div key={section} className="dashboard-section inactive">
              <h2>{section}</h2>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-intro">
      <h1 className="pagetitle">Your Dashboard</h1>
      <p>Connected Address: {userAddress}</p>
      <div className="dashboard-layout">
        <div
          className={`dashboard-section ${
            activeSection === "NFTs" ? "active" : ""
          }`}
          onClick={() => handleSectionClick("NFTs")}
        >
          <h2>NFTs</h2>
          {activeSection === "NFTs" && (
            <div className="section-content">
              {nfts.map((nft) => (
                <div key={nft.id} className="nft-item">
                  <img src={nft.image} alt={nft.name} />
                  <p>{nft.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`dashboard-section ${
            activeSection === "Frames" ? "active" : ""
          }`}
          onClick={() => handleSectionClick("Frames")}
        >
          <h2>Frames</h2>
          {activeSection === "Frames" && (
            <div className="section-content">
              {frames.map((frame) => (
                <div key={frame.id} className="frame-item">
                  <p>{frame.content}</p>
                  <span>Likes: {frame.likes}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`dashboard-section ${
            activeSection === "SafeMemes" ? "active" : ""
          }`}
          onClick={() => handleSectionClick("SafeMemes")}
        >
          <h2>SafeMemes</h2>
          {activeSection === "SafeMemes" && (
            <div className="section-content">
              {safeMemes.map((safeMeme) => (
                <div key={safeMeme.address} className="safememe-item">
                  <h3>
                    {safeMeme.name} ({safeMeme.symbol})
                  </h3>
                  <p>Total Supply: {safeMeme.totalSupply}</p>
                  <p>Address: {safeMeme.address}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`dashboard-section ${
            activeSection === "SafeLaunch" ? "active" : ""
          }`}
          onClick={() => handleSectionClick("SafeLaunch")}
        >
          <h2>SafeLaunch</h2>
          {activeSection === "SafeLaunch" && (
            <div className="section-content">
              <p>SafeLaunch content will be displayed here.</p>
              <p>
                This section will link to the full SafeLaunch functionality.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
