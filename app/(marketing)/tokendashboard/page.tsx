"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { erc20ABI } from "@/ABIs/erc20"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import {
  useAccount,
  useContractRead,
  useContractReads,
  useNetwork,
} from "wagmi"

import { tokenDeployerDetails } from "../../../Constants/config"
import "@/styles/dashboard.css"
import TokenHoldersList from "@/components/tokenholderslist"

const Dashboard = () => {
  const [isClient, setIsClient] = useState(false)
  const [tokenCount, setTokenCount] = useState<number>(0)
  const [selectedTab, setSelectedTab] = useState("competitors")

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const chainId: string | number = chain
    ? chain.id
    : Object.keys(tokenDeployerDetails)[0]

  const { data: contracts, error: contractsError } = useContractRead({
    address: tokenDeployerDetails[chainId] as `0x${string}`,
    abi: tokenDeployerABI,
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
    for (let i = 0; i < data.length; i += 5) {
      groupedData.push(data.slice(i, i + 5))
    }
    for (let i = 0; i < groupedData.length; i++) {
      namedData.push({
        name: groupedData[i][0].result,
        symbol: groupedData[i][1].result,
        supply: groupedData[i][2].result,
        decimals: groupedData[i][3].result,
        antiWhalePercentage: groupedData[i][4].result,
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
          <h3>Safememe</h3>
          <Image
            src="/images/logo.png"
            alt="Bubbles"
            width={120}
            height={120}
            className="meme-image"
          />
        </div>
        <TokenHoldersList
          tokenAddress="0x14E3C9107b16AF020E4F2B5971CC19C6DFc8F15B"
          chainId={250}
        />
      </div>
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
        <TokenHoldersList
          tokenAddress="0x54B051d102c19c1Cc12a391b0eefCD7eeb64CeDA"
          chainId={250}
        />
      </div>
    </>
  )

  const renderUserMemes = () => (
    <>
      <h1 className="pagetitle">Memes you created using SafeMemes</h1>
      {isClient && isConnected && contracts && contracts.length === 0 && (
        <p>No tokens available.</p>
      )}
      {isClient &&
        isConnected &&
        contracts &&
        contracts.length > 0 &&
        tempTokenData &&
        tempTokenData.length > 0 &&
        splitData(tempTokenData).map((token, index: number) => (
          <div className="meme" key={index}>
            <div className="meme-header">
              <h3>
                {token.name} ({token.symbol})
              </h3>
              <Image
                src="/images/logo.png" // You can dynamically set the logo URL if available
                alt={`${token.name} logo`}
                width={50}
                height={50}
                className="token-logo"
              />
            </div>

            <div className="meme-details">
              <p>
                <strong>Contract Address:</strong> {contracts[index]}
              </p>
              <p>
                <strong>Supply:</strong>{" "}
                {formatNumber(Number(token.supply), token.decimals)}
              </p>
              <p>
                <strong>Decimals:</strong> {token.decimals}
              </p>
              <p>
                <strong>Anti-Whale Percentage:</strong>{" "}
                {token.antiWhalePercentage}%
              </p>
              <p>
                <strong>Max Tokens per Holder:</strong>{" "}
                {formatNumber(
                  (Number(token.supply) * token.antiWhalePercentage) / 100,
                  token.decimals
                )}
              </p>
            </div>
            <TokenHoldersList
              tokenAddress={contracts[index]}
              chainId={chain?.id}
            />
          </div>
        ))}
      {!isClient && <p>Loading...</p>}
      {isClient && !isConnected && <p>No Account Connected</p>}
    </>
  )

  const renderTechStackMemes = () => (
    <>
      <h2>
        Once we develop our own exchange, we will be using our token generator
        to create safe memes that are deployed on our own exchange. If you're
        interested in helping us develop our exchange, please reach out.
      </h2>
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
              className={selectedTab === "user" ? "active" : ""}
              onClick={() => setSelectedTab("user")}
            >
              Your Memes
              {selectedTab === "user" && <div className="tab-indicator"></div>}
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
            {selectedTab === "user" && renderUserMemes()}
            {selectedTab === "tech" && renderTechStackMemes()}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
