"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"
import {
  blockExplorerUrls,
  chains,
  rpcUrls,
  safeLaunchFactory,
} from "@/Constants/config"
import { ethers } from "ethers"
import Modal from "react-modal"

import TokenSwap from "../swap/page"
import "@/styles/allTokens.css"

export default function AllTokens(): JSX.Element {
  const [contracts, setContracts] = useState<string[]>([])
  const [deployedTokenData, setDeployedTokenData] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>("")

  const provider = new ethers.providers.JsonRpcProvider(rpcUrls["4002"]) // Using Fantom testnet for example

  const tokenFactoryContract = new ethers.Contract(
    safeLaunchFactory["4002"],
    TokenFactoryABI,
    provider
  )

  useEffect(() => {
    async function fetchDeployedTokens() {
      try {
        const totalTokens =
          await tokenFactoryContract.getDeployedSafeMemeCount()
        const tokenAddresses: string[] = [] // Explicitly declare the type as string[]
        for (let i = 0; i < totalTokens.toNumber(); i++) {
          const tokenAddress: string =
            await tokenFactoryContract.safeMemesDeployed(i)
          tokenAddresses.push(tokenAddress)
        }
        setContracts(tokenAddresses)
        fetchTokenDetails(tokenAddresses)
      } catch (error) {
        console.error("Error fetching deployed tokens:", error)
      }
    }

    fetchDeployedTokens()
  }, [])

  async function fetchTokenDetails(tokenAddresses: string[]) {
    try {
      const tokenData = await Promise.all(
        tokenAddresses.map(async (address) => {
          const tokenContract = new ethers.Contract(
            address,
            SafeMemeABI,
            provider
          )
          const [name, symbol, totalSupply, decimals, antiWhalePercentage] =
            await Promise.all([
              tokenContract.name(),
              tokenContract.symbol(),
              tokenContract.totalSupply(),
              tokenContract.decimals(),
              tokenContract.antiWhalePercentage(),
            ])

          return {
            address,
            name,
            symbol,
            supply: totalSupply.toString(), // Convert BigNumber to string
            decimals: decimals.toString(), // Convert BigNumber to string
            antiWhalePercentage: antiWhalePercentage.toString(), // Convert BigNumber to string
            chainId: 4002, // Example chainId, adjust as needed
          }
        })
      )
      setDeployedTokenData(tokenData)
      setFilteredData(tokenData)
    } catch (error) {
      console.error("Error fetching token details:", error)
    }
  }

  useEffect(() => {
    async function fetchDeployedTokens() {
      try {
        const totalTokens =
          await tokenFactoryContract.getDeployedSafeMemeCount()
        const tokenAddresses: string[] = [] // Explicitly declare the type as string[]
        for (let i = 0; i < totalTokens.toNumber(); i++) {
          const tokenAddress: string =
            await tokenFactoryContract.safeMemesDeployed(i)
          tokenAddresses.push(tokenAddress)
        }
        setContracts(tokenAddresses)
        fetchTokenDetails(tokenAddresses)
      } catch (error) {
        console.error("Error fetching deployed tokens:", error)
      }
    }

    fetchDeployedTokens()
  }, [])

  const formatNumber = (number: number, decimals: number) => {
    return (number / 10 ** decimals).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })
  }

  const openModal = (tokenAddress: string) => {
    setSelectedToken(tokenAddress)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedToken(null)
    setIsModalOpen(false)
  }

  const getBlockExplorerLink = (address: string) => {
    return `${blockExplorerUrls["4002"] || ""}${address}`
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const getBlockchainName = (chainId) => {
    const chain = chains.find((chain) => chain.id === Number(chainId))
    return chain ? chain.name : "Unknown Blockchain"
  }

  useEffect(() => {
    filterTokensByBlockchain()
  }, [selectedBlockchain, deployedTokenData])

  const filterTokensByBlockchain = () => {
    if (selectedBlockchain === "") {
      setFilteredData(deployedTokenData)
    } else {
      const filteredTokens = deployedTokenData.filter(
        (token) => getBlockchainName(token.chainId) === selectedBlockchain
      )
      setFilteredData(filteredTokens)
    }
  }

  const handleFilterChange = (e) => {
    setSelectedBlockchain(e.target.value)
  }

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      height: "85%",
      width: "90%", // Set width to 90% for better mobile responsiveness
      maxWidth: "600px",
      padding: "0px",
      borderRadius: "8px",
      background: "#fff",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      boxSizing: "border-box",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
    },
  }

  return (
    <div>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="dashboard">
            <div className="myTokensHeading">
              <h1 className="pagetitle">All Tokens Created</h1>
              <p className="subheading">
                See all the tokens created on SafeMeme Labs
              </p>
              <select
                className="filter-dropdown"
                value={selectedBlockchain}
                onChange={handleFilterChange}
              >
                <option value="">All Blockchains</option>
                {chains.map((chain) => (
                  <option key={chain.id} value={chain.name}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="token-container">
              {filteredData.length > 0 && (
                <div className="meme-container">
                  {filteredData.map((token, index: number) => (
                    <div className="meme" key={index}>
                      <div className="meme-header">
                        <h3>
                          {token.name} ({token.symbol})
                        </h3>
                        <Image
                          src="/images/logo.png"
                          alt={`${token.name} logo`}
                          width={50}
                          height={50}
                          className="token-logo"
                        />
                      </div>

                      <div className="meme-details">
                        <p>
                          <strong>Blockchain:</strong>{" "}
                          {getBlockchainName(token.chainId)}
                        </p>
                        <p>
                          <strong>Contract Address:</strong>
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
                          <strong>Max Tokens per Holder:</strong>
                          {formatNumber(
                            (Number(token.supply) * token.antiWhalePercentage) /
                              100,
                            token.decimals
                          )}
                        </p>
                      </div>

                      <button
                        className="buy-token-button"
                        onClick={() => openModal(token.address)}
                      >
                        Buy {token.symbol}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Token Swap Modal"
        style={customStyles}
      >
        <div className="token-swap-container">
          <div className="token-swap-inner">
            <TokenSwap tokenAddress={selectedToken} hideNavbar={true} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
