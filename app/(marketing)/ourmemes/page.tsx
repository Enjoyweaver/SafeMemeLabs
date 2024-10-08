"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"
import { erc20ABI } from "@/ABIs/erc20"
import {
  useAccount,
  useContractRead,
  useContractReads,
  useNetwork,
} from "wagmi"

import { safeLaunchFactory } from "../../../Constants/config"
import "@/styles/dashboard.css"
import TokenHoldersList from "@/APIs/tokeninfo"

const Dashboard = () => {
  const [isClient, setIsClient] = useState(false)
  const [tokenCount, setTokenCount] = useState<number>(0)
  const [selectedTab, setSelectedTab] = useState("competitors")
  const [phasedTokens, setPhasedTokens] = useState([]) // State to store phased tokens
  const [pairs, setPairs] = useState([]) // State to store pairs

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const chainId: string | number = chain
    ? chain.id
    : Object.keys(safeLaunchFactory)[0]

  const { data: contracts, error: contractsError } = useContractRead({
    address: safeLaunchFactory[chainId] as `0x${string}`,
    abi: TokenFactoryABI,
    functionName: "getTokensDeployedByUser",
    args: [address as `0x${string}`],
    enabled: !!address,
  })

  useEffect(() => {
    if (contractsError) {
      console.error("Contracts Error: ", contractsError)
    }
    if (contracts) {
      console.log("Contracts: ", contracts)
      setTokenCount(contracts.length)
    }
  }, [contracts, contractsError])

  const contractRequests = contracts?.map((contract) => [
    {
      address: contract,
      abi: erc20ABI,
      functionName: "name",
    },
    {
      address: contract,
      abi: erc20ABI,
      functionName: "symbol",
    },
    {
      address: contract,
      abi: erc20ABI,
      functionName: "totalSupply",
    },
    {
      address: contract,
      abi: erc20ABI,
      functionName: "decimals",
    },
    {
      address: contract,
      abi: erc20ABI,
      functionName: "antiWhalePercentage",
    },
    {
      address: contract,
      abi: erc20ABI,
      functionName: "lockedSupply",
    },
  ])

  const { data: tempTokenData, error: tempTokenDataError } = useContractReads({
    contracts: contractRequests?.flat(),
    enabled: !!contractRequests?.length,
  })

  useEffect(() => {
    if (tempTokenDataError) {
      console.error("Temp Token Data Error: ", tempTokenDataError)
    }
    if (tempTokenData) {
      console.log("Temp Token Data: ", tempTokenData)
    }
  }, [tempTokenData, tempTokenDataError])

  function splitData(data: any) {
    const groupedData = []
    const namedData = []
    for (let i = 0; i < data.length; i += 6) {
      groupedData.push(data.slice(i, i + 6))
    }
    for (let i = 0; i < groupedData.length; i++) {
      namedData.push({
        name: groupedData[i][0].result,
        symbol: groupedData[i][1].result,
        supply: groupedData[i][2].result,
        decimals: groupedData[i][3].result,
        antiWhalePercentage: groupedData[i][4].result,
        lockedSupply: groupedData[i][5].result,
      })
    }
    return namedData
  }

  const formatNumber = (number: number, decimals: number) => {
    return (number / 10 ** decimals).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })
  }

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
            {selectedTab === "competitors" && renderCompetitorsMemes()}
            {selectedTab === "tech" && renderTechStackMemes()}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
