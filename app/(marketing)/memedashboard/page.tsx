"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

import "@/styles/dashboard.css"
import TokenHoldersList from "@/APIs/tokeninfo"

import AllTokens from "../alltokens/page"

// Import the AllTokens component

const Dashboard = () => {
  const [isClient, setIsClient] = useState(false)
  const [selectedTab, setSelectedTab] = useState("all")
  const [phasedTokens, setPhasedTokens] = useState([]) // State to store phased tokens
  const [pairs, setPairs] = useState([]) // State to store pairs

  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatNumber = (number: number, decimals: number) => {
    return (number / 10 ** decimals).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })
  }

  const renderAllMemes = () => <AllTokens /> // Render the AllTokens component

  const renderCompetitorsMemes = () => (
    <>
      <h1 className="pagetitle">
        Memes we created on our competitors' websites
      </h1>
      <div className="meme">
        <div className="meme-header">
          <h3>Bubbles</h3>
          <Image
            src="/images/bubbles.jpg"
            alt="Bubbles"
            width={120}
            height={120}
            className="meme-image"
          />
        </div>
        <div className="meme-info-container">
          <div className="meme-info">
            <Image
              src="/images/memebox.jpg"
              alt="MemeBox.Fi"
              width={120}
              height={120}
              className="meme-image"
            />
            <h3>MemeBox.Fi</h3>
            <p>
              We created Bubbles on <a href="https://memebox.fi">MemeBox.Fi</a>.
              Check out their{" "}
              <a href="https://twitter.com/MemeboxFi">Twitter</a>.
            </p>
          </div>
          <div className="transaction-summary">
            <TokenHoldersList
              tokenAddress="0x54B051d102c19c1Cc12a391b0eefCD7eeb64CeDA"
              chainId={250}
            />
          </div>
        </div>
      </div>
    </>
  )

  const renderTechStackMemes = () => (
    <>
      <h2>
        Once we develop our own exchange, we will be using our token generator
        to create safe memes that are deployed on our own exchange. If you're
        interested in helping us develop our exchange, please reach out.
      </h2>
      <div className="phased-tokens-section">
        <h2 className="section-title">Available Tokens by Phases</h2>
        {phasedTokens.map((token, index) => (
          <div key={index} className="phased-token-card">
            <p>
              <strong>Name:</strong> {token.name}
            </p>
            <p>
              <strong>Symbol:</strong> {token.symbol}
            </p>
            <p>
              <strong>Total Supply:</strong>{" "}
              {formatNumber(token.totalSupply, token.decimals)}
            </p>
            <p>
              <strong>Decimals:</strong> {token.decimals}
            </p>
          </div>
        ))}
      </div>
      <div className="pairs-section">
        <h2 className="section-title">Available Pairs</h2>
        {pairs.map((pair, index) => (
          <div key={index} className="pair-card">
            <p>
              <strong>Pair Address:</strong> {pair.pairAddress}
            </p>
            <p>
              <strong>Token 0:</strong> {pair.token0.name}
            </p>
            <p>
              <strong>Token 1:</strong> {pair.token1.name}
            </p>
          </div>
        ))}
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="dashboard">
          <div className="tabs">
            <button
              className={selectedTab === "all" ? "active" : ""}
              onClick={() => setSelectedTab("all")}
            >
              All Memes
              {selectedTab === "all" && <div className="tab-indicator"></div>}
            </button>
            <button
              className={selectedTab === "competitors" ? "active" : ""}
              onClick={() => setSelectedTab("competitors")}
            >
              Competitors' Memes
              {selectedTab === "competitors" && (
                <div className="tab-indicator"></div>
              )}
            </button>
            <button
              className={selectedTab === "tech" ? "active" : ""}
              onClick={() => setSelectedTab("tech")}
            >
              Our Memes
              {selectedTab === "tech" && <div className="tab-indicator"></div>}
            </button>
          </div>

          <div className="content">
            {selectedTab === "all" && renderAllMemes()}
            {selectedTab === "competitors" && renderCompetitorsMemes()}
            {selectedTab === "tech" && renderTechStackMemes()}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
