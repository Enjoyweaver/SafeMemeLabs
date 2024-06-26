"use client"

import { useEffect, useState } from "react"
import { safeMemeABI } from "@/ABIs/vyper/safeMeme"
import { safeSaleABI } from "@/ABIs/vyper/safeSale"
import { tokenFactoryABI } from "@/ABIs/vyper/tokenFactory"
import { ethers } from "ethers"
import { useAccount, useNetwork } from "wagmi"

import { ChangeNetwork } from "@/components/changeNetwork/changeNetwork"
import { Navbar } from "@/components/walletconnect/walletconnect"

import {
  SafeSaleAddress,
  blockExplorerAddress,
  tokenVyperDetails,
} from "../../../Constants/config"
import "@/styles/allTokens.css"

export default function SafeLaunch(): JSX.Element {
  const [isClient, setIsClient] = useState(false)
  const [deployedTokenData, setDeployedTokenData] = useState<any[]>([])
  const [fetchingError, setFetchingError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const chainId: string | number = chain
    ? chain.id
    : Object.keys(tokenVyperDetails)[0]

  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const tokenFactoryContract = new ethers.Contract(
    tokenVyperDetails[chainId] as `0x${string}`,
    tokenFactoryABI,
    provider
  )

  const getAllTokens = async () => {
    try {
      const tokenCount = await tokenFactoryContract.getDeployedTokenCount({
        gasLimit: ethers.utils.hexlify(1000000),
      })
      console.log(`Token count: ${tokenCount}`)
      const allTokens = []
      for (let i = 0; i < tokenCount; i++) {
        const tokenAddress = await tokenFactoryContract.tokensDeployed(i, {
          gasLimit: ethers.utils.hexlify(1000000),
        })
        allTokens.push(tokenAddress)
      }
      return allTokens
    } catch (error) {
      console.error("Error fetching all tokens: ", error)
      return []
    }
  }

  const getUserTokens = async (userAddress) => {
    try {
      const userTokens = await tokenFactoryContract.getTokensDeployedByUser(
        userAddress,
        {
          gasLimit: ethers.utils.hexlify(1000000),
        }
      )
      console.log("Fetched User Tokens:", userTokens)
      return userTokens
    } catch (error) {
      console.error("Error fetching user tokens: ", error)
      return []
    }
  }

  const getTokenDetails = async (tokenAddress) => {
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        safeMemeABI,
        provider
      )
      const [name, symbol, totalSupply, owner, decimals, antiWhalePercentage] =
        await Promise.all([
          tokenContract.name(),
          tokenContract.symbol(),
          tokenContract.totalSupply(),
          tokenContract.owner(),
          tokenContract.decimals(),
          tokenContract.antiWhalePercentage(),
        ])
      return {
        address: tokenAddress,
        name,
        symbol,
        totalSupply,
        owner,
        decimals,
        antiWhalePercentage,
      }
    } catch (error) {
      console.error(`Error fetching details for token ${tokenAddress}:`, error)
      return null
    }
  }

  const getStageDetails = async (tokenAddress) => {
    try {
      const safeSaleContract = new ethers.Contract(
        SafeSaleAddress[chainId] as `0x${string}`,
        safeSaleABI,
        provider
      )

      const stageDetails = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          safeSaleContract.getStageDetails(tokenAddress, i)
        )
      )

      return stageDetails
    } catch (error) {
      console.error(
        `Error fetching stage details for token ${tokenAddress}:`,
        error
      )
      return []
    }
  }

  useEffect(() => {
    const fetchAllTokenData = async () => {
      try {
        const allTokens = await getAllTokens()
        console.log("All Tokens:", allTokens)
        if (!allTokens || allTokens.length === 0) {
          console.error("allTokens is undefined, null, or empty.")
          return
        }

        const userTokens = await getUserTokens(address)
        console.log("User Tokens:", userTokens)
        if (!userTokens) {
          console.error("userTokens is undefined or null.")
          return
        }

        const tokenData = await Promise.all(
          allTokens.map(async (tokenAddress) => {
            const details = await getTokenDetails(tokenAddress)
            const stages = await getStageDetails(tokenAddress)
            return { ...details, stages }
          })
        )

        console.log("Token Data:", tokenData)
        if (!tokenData) {
          console.error("tokenData is undefined or null.")
          return
        }

        const userTokenAddresses = new Set(
          userTokens.map((token) => token.toLowerCase())
        )
        const deployedTokenData = tokenData
          .filter((token): token is NonNullable<typeof token> => token !== null)
          .map((token) => ({
            ...token,
            isUserToken: userTokenAddresses.has(token.address.toLowerCase()),
          }))
        setDeployedTokenData(deployedTokenData)
        console.log("Deployed Token Data:", deployedTokenData)
      } catch (error) {
        console.error("Error fetching token data: ", error)
      }
    }

    if (isClient && isConnected) {
      fetchAllTokenData()
    }
  }, [isClient, isConnected, chainId, address])

  const formatNumber = (number: ethers.BigNumber, decimals: number) => {
    return ethers.utils.formatUnits(number, decimals)
  }

  const getBlockExplorerLink = (address: string) => {
    return `${blockExplorerAddress[chainId] || ""}${address}`
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const calculateStageProgress = (stage) => {
    const { tokenBAccepted, tokenBRequired } = stage
    return (tokenBAccepted / tokenBRequired) * 100
  }

  const toggleDarkMode = () => {
    document.body.classList.toggle("dark-mode")
  }

  useEffect(() => {
    // Optionally, you can set dark mode based on a condition
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (isDarkMode) {
      document.body.classList.add("dark-mode")
    }
  }, [])

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <button onClick={toggleDarkMode}>Toggle Dark Mode</button>
        <main className="flex-1">
          <div className="dashboard">
            {isClient && chainId && !tokenVyperDetails[chainId] && (
              <ChangeNetwork
                changeNetworkToChainId={250}
                dappName={"SafeLaunch"}
                networks={"Fantom and Degen"}
              />
            )}
            <div className="myTokensHeading">
              <h1 className="pagetitle">SafeLaunch</h1>
              <p className="subheading">See all the tokens created!</p>
            </div>
            {!isClient && <p className="myTokensError">Loading...</p>}
            {isClient && isConnected && (
              <>
                <h2 className="sectionTitle">All SafeMemes</h2>
                {deployedTokenData.length === 0 && (
                  <p className="myTokensError">No tokens available.</p>
                )}
                {deployedTokenData.length > 0 && (
                  <div className="meme-container">
                    {deployedTokenData.map((token, index: number) => (
                      <div
                        className={`meme ${
                          token.isUserToken ? "user-token" : ""
                        }`}
                        key={index}
                      >
                        <div className="meme-header">
                          <h3>
                            {token.name
                              ? `${token.name} (${token.symbol})`
                              : "Token"}
                          </h3>
                          {token.isUserToken && (
                            <span className="user-token-badge">Your Token</span>
                          )}
                        </div>
                        <div className="meme-details">
                          <p>
                            <strong>Contract Address:</strong>{" "}
                            <a
                              href={getBlockExplorerLink(token.address)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {shortenAddress(token.address)}
                            </a>
                          </p>
                          <p>
                            <strong>Supply:</strong>{" "}
                            {token.totalSupply
                              ? formatNumber(token.totalSupply, token.decimals)
                              : "N/A"}
                          </p>
                          <p>
                            <strong>Anti-Whale Percentage:</strong>{" "}
                            {token.antiWhalePercentage
                              ? `${token.antiWhalePercentage}%`
                              : "N/A"}
                          </p>
                          <div className="stages-container">
                            {token.stages.map((stage, stageIndex) => (
                              <div className="stage" key={stageIndex}>
                                <h4>Stage {stageIndex + 1}</h4>
                                <p>
                                  <strong>Price:</strong>{" "}
                                  {ethers.utils.formatUnits(
                                    stage[0],
                                    token.decimals
                                  )}{" "}
                                  Token B
                                </p>
                                <p>
                                  <strong>Token Amount:</strong>{" "}
                                  {formatNumber(stage[1], token.decimals)}
                                </p>
                                <p>
                                  <strong>Token B Required:</strong>{" "}
                                  {formatNumber(stage[2], token.decimals)}
                                </p>
                                <p>
                                  <strong>Token B Accepted:</strong>{" "}
                                  {formatNumber(stage[3], token.decimals)}
                                </p>
                                <div className="progress-bar">
                                  <div
                                    className="progress"
                                    style={{
                                      width: `${calculateStageProgress(
                                        stage
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {isClient && !isConnected && (
              <p className="myTokensError">No Account Connected</p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
