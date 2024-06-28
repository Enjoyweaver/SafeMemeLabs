"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { erc20ABI } from "@/ABIs/erc20"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import { tokenLauncherABI } from "@/ABIs/tokenLauncher"
import { tokenFactoryABI } from "@/ABIs/vyper/tokenFactory"
import Modal from "react-modal"
import { useContractRead, useContractReads, useNetwork } from "wagmi"

import {
  blockExplorerUrls,
  chains,
  tokenDeployerDetails,
  tokenLauncherDetails,
  tokenVyperDetails,
} from "../../../Constants/config"
import TokenSwap from "../swap/page"
import "@/styles/allTokens.css"

export default function AllTokens(): JSX.Element {
  const [isClient, setIsClient] = useState(false)
  const [contracts, setContracts] = useState<string[]>([])
  const [deployedTokenData, setDeployedTokenData] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>("")

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined") {
      const appElement = document.querySelector("#__next")
      if (appElement) {
        Modal.setAppElement(appElement)
      }
    }
  }, [])

  const { chain } = useNetwork()
  const chainId: string | number = chain
    ? chain.id
    : Object.keys(tokenDeployerDetails)[0]

  // Fetch deployed token count
  const { data: deployerTokenCount } = useContractRead({
    address: tokenDeployerDetails[chainId] as `0x${string}`,
    abi: tokenDeployerABI,
    functionName: "getDeployedTokenCount",
  })

  const { data: launcherTokenCount } = useContractRead({
    address: tokenLauncherDetails[chainId] as `0x${string}`,
    abi: tokenLauncherABI,
    functionName: "getDeployedTokenCount",
  })

  const { data: vyperTokenCount } = useContractRead({
    address: tokenVyperDetails[chainId] as `0x${string}`,
    abi: tokenFactoryABI,
    functionName: "getDeployedTokenCount",
  })

  const deployerTokenCountNumber = deployerTokenCount
    ? Number(deployerTokenCount)
    : 0
  const launcherTokenCountNumber = launcherTokenCount
    ? Number(launcherTokenCount)
    : 0
  const vyperTokenCountNumber = vyperTokenCount ? Number(vyperTokenCount) : 0

  const deployerContractAddresses = Array.from(
    { length: deployerTokenCountNumber },
    (_, i) => ({
      address: tokenDeployerDetails[chainId] as `0x${string}`,
      abi: tokenDeployerABI,
      functionName: "tokensDeployed",
      args: [i],
    })
  )

  const launcherContractAddresses = Array.from(
    { length: launcherTokenCountNumber },
    (_, i) => ({
      address: tokenLauncherDetails[chainId] as `0x${string}`,
      abi: tokenLauncherABI,
      functionName: "tokensDeployed",
      args: [i],
    })
  )

  const vyperContractAddresses = Array.from(
    { length: vyperTokenCountNumber },
    (_, i) => ({
      address: tokenLauncherDetails[chainId] as `0x${string}`,
      abi: tokenLauncherABI,
      functionName: "tokensDeployed",
      args: [i],
    })
  )

  const { data: deployerContracts } = useContractReads({
    contracts: deployerContractAddresses,
    enabled: deployerContractAddresses.length > 0,
  })

  const { data: launcherContracts } = useContractReads({
    contracts: launcherContractAddresses,
    enabled: launcherContractAddresses.length > 0,
  })

  useEffect(() => {
    if (deployerContracts && launcherContracts) {
      setContracts([
        ...deployerContracts.map((c) => c.result),
        ...launcherContracts.map((c) => c.result),
      ])
    }
  }, [deployerContracts, launcherContracts])

  const contractRequests = contracts
    ?.map((contract) => [
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
    .flat()

  const { data: tokenDataResult } = useContractReads({
    contracts: contractRequests,
    enabled: !!contractRequests?.length,
  })

  useEffect(() => {
    if (tokenDataResult) {
      const splitTokens = splitData(tokenDataResult)
      setDeployedTokenData(splitTokens)
      setFilteredData(splitTokens)
    }
  }, [tokenDataResult])

  useEffect(() => {
    if (selectedBlockchain) {
      filterTokensByBlockchain()
    } else {
      setFilteredData(deployedTokenData)
    }
  }, [selectedBlockchain, deployedTokenData])

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
        chainId: chainId, // Add chainId to each token data object
      })
    }
    return namedData.reverse() // Reverse the namedData to match the reverse order display
  }

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
    return `${blockExplorerUrls[chainId] || ""}${address}`
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  const getBlockchainName = (chainId) => {
    const chain = chains.find((chain) => chain.id === Number(chainId))
    return chain ? chain.name : "Unknown Blockchain"
  }

  const filterTokensByBlockchain = () => {
    const filteredTokens = deployedTokenData.filter(
      (token) => getBlockchainName(token.chainId) === selectedBlockchain
    )
    setFilteredData(filteredTokens)
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
                          <strong>Contract Address:</strong>{" "}
                          <a
                            href={getBlockExplorerLink(
                              contracts[contracts.length - 1 - index]
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {shortenAddress(
                              contracts[contracts.length - 1 - index]
                            )}
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
                          <strong>Max Tokens per Holder:</strong>{" "}
                          {formatNumber(
                            (Number(token.supply) * token.antiWhalePercentage) /
                              100,
                            token.decimals
                          )}
                        </p>
                      </div>

                      <button
                        className="buy-token-button"
                        onClick={() =>
                          openModal(contracts[contracts.length - 1 - index])
                        }
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
      {isClient && (
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
      )}
    </div>
  )
}
