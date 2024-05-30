"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import {
  erc20ABI,
  useAccount,
  useContractRead,
  useContractReads,
  useNetwork,
} from "wagmi"

import { tokenDeployerDetails } from "../../../Constants/config"
import "@/styles/dashboard.css"
// import Bubbles from "@/components/bubbles"
import TokenHoldersList from "@/components/tokenholderslist"

import styles from "./page.module.css"

const Dashboard = () => {
  const [isClient, setIsClient] = useState(false)
  const [tokenCount, setTokenCount] = useState<number>(0)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const chainId: string | number = chain
    ? chain.id
    : Object.keys(tokenDeployerDetails)[0]

  const { data: contracts } = useContractRead({
    address: tokenDeployerDetails[chainId] as `0x${string}`,
    abi: tokenDeployerABI,
    functionName: "getTokensDeployedByUser",
    args: [address as `0x${string}`],
    enabled: !!address,
  })

  useEffect(() => {
    if (contracts) {
      setTokenCount(contracts.length)
    }
  }, [contracts])

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

  const { data: tempTokenData } = useContractReads({
    contracts: contractRequests?.flat(),
    enabled: !!contractRequests?.length,
  })

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

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="dashboard">
          <section>
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
                walletAddress="0x14E3C9107b16AF020E4F2B5971CC19C6DFc8F15B"
                chainName="fantom-mainnet"
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
                walletAddress="0x54B051d102c19c1Cc12a391b0eefCD7eeb64CeDA"
                chainName="fantom-mainnet"
              />
            </div>
          </section>

          <section>
            <h2>Memes you created using SafeMemes</h2>
            <ul>
              {isClient &&
                isConnected &&
                contracts &&
                contracts.length === 0 && <p>No tokens available.</p>}
              {isClient &&
                isConnected &&
                contracts &&
                contracts.length > 0 &&
                tempTokenData &&
                tempTokenData.length > 0 &&
                splitData(tempTokenData)
                  .reverse()
                  .map((token, index: number) => (
                    <li key={index}>
                      <p>
                        {token.name} ({token.symbol})
                      </p>
                      <p>Contract Address: {contracts[index]}</p>
                      <p>
                        Supply: {Number(token.supply) / 10 ** token.decimals}
                      </p>
                      <p>Decimals: {token.decimals}</p>
                      <p>Anti-Whale Percentage: {token.antiWhalePercentage}%</p>
                    </li>
                  ))}
              {!isClient && <p>Loading...</p>}
              {isClient && !isConnected && <p>No Account Connected</p>}
            </ul>
          </section>

          <section>
            <h2>Memes we created using our tech stack</h2>
            <ul>
              <li>Example Tech Meme 1</li>
              <li>Example Tech Meme 2</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
