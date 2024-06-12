"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { erc20ABI } from "@/ABIs/erc20"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import { tokenLauncherABI } from "@/ABIs/tokenLauncher"
import Modal from "react-modal"
import { useContractRead, useContractReads, useNetwork } from "wagmi"

import { ChangeNetwork } from "@/components/changeNetwork/changeNetwork"
import { Navbar } from "@/components/walletconnect/walletconnect"

import {
  tokenDeployerDetails,
  tokenLauncherDetails,
} from "../../../Constants/config"
import TokenSwap from "../swap/page"
import "@/styles/profile.css"
import TokenHoldersList from "@/APIs/tokeninfo"

export default function AllTokens(): JSX.Element {
  const [isClient, setIsClient] = useState(false)
  const [tokenCount, setTokenCount] = useState<number>(0)
  const [launchedTokenCount, setLaunchedTokenCount] = useState<number>(0)
  const [contracts, setContracts] = useState<string[]>([])
  const [launchedContracts, setLaunchedContracts] = useState<string[]>([])
  const [deployedTokenData, setDeployedTokenData] = useState<any[]>([])
  const [launchedTokenData, setLaunchedTokenData] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined") {
      setTimeout(() => {
        Modal.setAppElement("#__next")
      }, 0)
    }
  }, [])

  const { chain } = useNetwork()

  const chainId: string | number = chain
    ? chain.id
    : Object.keys(tokenDeployerDetails)[0]

  // Fetch deployed token count
  const { data: deployerTokenCount, error: deployerTokenCountError } =
    useContractRead({
      address: tokenDeployerDetails[chainId] as `0x${string}`,
      abi: tokenDeployerABI,
      functionName: "getDeployedTokenCount",
    })

  const { data: launcherTokenCount, error: launcherTokenCountError } =
    useContractRead({
      address: tokenLauncherDetails[chainId] as `0x${string}`,
      abi: tokenLauncherABI,
      functionName: "getDeployedTokenCount",
    })

  const deployerTokenCountNumber = deployerTokenCount
    ? Number(deployerTokenCount)
    : 0
  const launcherTokenCountNumber = launcherTokenCount
    ? Number(launcherTokenCount)
    : 0

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

  const { data: deployerContracts, error: deployerContractsError } =
    useContractReads({
      contracts: deployerContractAddresses,
      enabled: deployerContractAddresses.length > 0,
    })

  const { data: launcherContracts, error: launcherContractsError } =
    useContractReads({
      contracts: launcherContractAddresses,
      enabled: launcherContractAddresses.length > 0,
    })

  useEffect(() => {
    if (deployerContractsError) {
      console.error("Deployer Contracts Error: ", deployerContractsError)
    }
    if (launcherContractsError) {
      console.error("Launcher Contracts Error: ", launcherContractsError)
    }

    if (deployerContracts && launcherContracts) {
      setContracts([
        ...deployerContracts.map((c) => c.result),
        ...launcherContracts.map((c) => c.result),
      ])
    }
  }, [
    deployerContracts,
    launcherContracts,
    deployerContractsError,
    launcherContractsError,
  ])

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

  const { data: tokenDataResult, error: tokenDataError } = useContractReads({
    contracts: contractRequests,
    enabled: !!contractRequests?.length,
  })

  useEffect(() => {
    if (tokenDataError) {
      console.error("Token Data Error: ", tokenDataError)
    }
    if (tokenDataResult) {
      console.log("Token Data: ", tokenDataResult)
      setDeployedTokenData(splitData(tokenDataResult))
      setLaunchedTokenData(splitData(tokenDataResult))
    }
  }, [tokenDataResult, tokenDataError])

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

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      height: "80%",
      width: "50%",
      maxWidth: "500px",
      padding: "0px",
      borderRadius: "8px",
      background: "#fff",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
    },
  }

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="dashboard">
            {isClient && chainId && !tokenDeployerDetails[chainId] && (
              <ChangeNetwork
                changeNetworkToChainId={250}
                dappName={"SafeMeme Labs"}
                networks={"Fantom and Degen"}
              />
            )}
            <div className="myTokensHeading">
              <h1 className="pagetitle">All Tokens Created per Blockchain</h1>
              <p className="subheading">
                See all the tokens created on SafeMeme Labs by blockchain
              </p>
            </div>
            <div className="token-container">
              {deployedTokenData.length === 0 && (
                <p>
                  Connect your wallet to choose a blockchain to view the created
                  tokens on.
                </p>
              )}
              {deployedTokenData.length > 0 && (
                <div className="meme-container">
                  {deployedTokenData.map((token, index: number) => (
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
                          <strong>Contract Address:</strong>{" "}
                          {contracts[contracts.length - 1 - index]}
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
                      <TokenHoldersList
                        tokenAddress={contracts[contracts.length - 1 - index]}
                        chainId={chain?.id}
                      />
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
          <TokenSwap tokenAddress={selectedToken} hideNavbar={true} />
          <button className="close-modal-button" onClick={closeModal}>
            Close
          </button>
        </Modal>
      )}
    </div>
  )
}
