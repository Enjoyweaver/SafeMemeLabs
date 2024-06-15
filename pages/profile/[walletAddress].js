import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/router"
import { erc20ABI } from "@/ABIs/erc20"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import { tokenLauncherABI } from "@/ABIs/tokenLauncher"
import { useContractRead, useContractReads, useNetwork } from "wagmi"

import { ChangeNetwork } from "@/components/changeNetwork/changeNetwork"
import { Navbar } from "@/components/walletconnect/walletconnect"

import {
  blockExplorerUrls,
  tokenDeployerDetails,
  tokenLauncherDetails,
} from "../../Constants/config"
import "@/styles/allTokens.css"
import TokenHoldersList from "@/APIs/tokeninfo"

import withWagmiConfig from "../../withWagmiConfig"

function ProfilePage() {
  const [isClient, setIsClient] = useState(false)
  const [tokenCount, setTokenCount] = useState(0)
  const [launchedTokenCount, setLaunchedTokenCount] = useState(0)
  const [contracts, setContracts] = useState([])
  const [launchedContracts, setLaunchedContracts] = useState([])
  const [deployedTokenData, setDeployedTokenData] = useState([])
  const [launchedTokenData, setLaunchedTokenData] = useState([])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { chain } = useNetwork()
  const router = useRouter()
  const { walletAddress } = router.query

  const chainId = chain ? chain.id : Object.keys(tokenDeployerDetails)[0]

  // Fetch deployed contracts
  const { data: deployerContracts, error: deployerContractsError } =
    useContractRead({
      address: tokenDeployerDetails[chainId],
      abi: tokenDeployerABI,
      functionName: "getTokensDeployedByUser",
      args: [walletAddress],
      enabled: !!walletAddress,
    })

  // Fetch launched contracts
  const { data: launcherContracts, error: launcherContractsError } =
    useContractRead({
      address: tokenLauncherDetails[chainId],
      abi: tokenLauncherABI,
      functionName: "getTokensDeployedByUser",
      args: [walletAddress],
      enabled: !!walletAddress,
    })

  useEffect(() => {
    if (deployerContractsError) {
      console.error("Deployer Contracts Error: ", deployerContractsError)
    }
    if (launcherContractsError) {
      console.error("Launcher Contracts Error: ", launcherContractsError)
    }

    setContracts(deployerContracts || [])
    setLaunchedContracts(launcherContracts || [])
    setTokenCount((deployerContracts || []).length)
    setLaunchedTokenCount((launcherContracts || []).length)
  }, [
    deployerContracts,
    launcherContracts,
    deployerContractsError,
    launcherContractsError,
  ])

  const deployerContractRequests = contracts
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

  const launcherContractRequests = launchedContracts
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

  const { data: deployerTokenData, error: deployerTokenDataError } =
    useContractReads({
      contracts: deployerContractRequests,
      enabled: !!deployerContractRequests?.length,
    })

  const { data: launcherTokenData, error: launcherTokenDataError } =
    useContractReads({
      contracts: launcherContractRequests,
      enabled: !!launcherContractRequests?.length,
    })

  useEffect(() => {
    if (deployerTokenDataError) {
      console.error("Deployer Token Data Error: ", deployerTokenDataError)
    }
    if (deployerTokenData) {
      console.log("Deployer Token Data: ", deployerTokenData)
      setDeployedTokenData(splitData(deployerTokenData))
    }

    if (launcherTokenDataError) {
      console.error("Launcher Token Data Error: ", launcherTokenDataError)
    }
    if (launcherTokenData) {
      console.log("Launcher Token Data: ", launcherTokenData)
      setLaunchedTokenData(splitData(launcherTokenData))
    }
  }, [
    deployerTokenData,
    deployerTokenDataError,
    launcherTokenData,
    launcherTokenDataError,
  ])

  function splitData(data) {
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

  const formatNumber = (number, decimals) => {
    return (number / 10 ** decimals).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })
  }

  const getBlockExplorerLink = (address) => {
    return `${blockExplorerUrls[chainId] || ""}${address}`
  }

  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
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
              <h1 className="pagetitle">Profile for {walletAddress}</h1>
              <p className="subheading">
                See all the tokens created by this address!
              </p>
              <p className="tokenCount">
                Number of Tokens Created: {tokenCount}
              </p>
              <p className="tokenCount">
                Number of Tokens Launched: {launchedTokenCount}
              </p>
            </div>
            {!isClient && <p className="myTokensError">Loading...</p>}
            {isClient && walletAddress && (
              <>
                <h2 className="sectionTitle">SafeMemes Created</h2>
                {contracts && contracts.length === 0 && (
                  <p className="myTokensError">No tokens available.</p>
                )}
                {contracts &&
                  contracts.length > 0 &&
                  deployedTokenData &&
                  deployedTokenData.length > 0 && (
                    <div className="meme-container">
                      {deployedTokenData.map((token, index) => (
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
                              {formatNumber(
                                Number(token.supply),
                                token.decimals
                              )}
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
                                (Number(token.supply) *
                                  token.antiWhalePercentage) /
                                  100,
                                token.decimals
                              )}
                            </p>
                          </div>
                          <TokenHoldersList
                            tokenAddress={
                              contracts[contracts.length - 1 - index]
                            }
                            chainId={chain?.id}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                <h2 className="sectionTitle">SafeMemes Launched</h2>
                {launchedContracts && launchedContracts.length === 0 && (
                  <p className="myTokensError">No launched tokens available.</p>
                )}
                {launchedContracts &&
                  launchedContracts.length > 0 &&
                  launchedTokenData &&
                  launchedTokenData.length > 0 && (
                    <div className="meme-container">
                      {launchedTokenData.map((token, index) => (
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
                              <a
                                href={getBlockExplorerLink(
                                  launchedContracts[
                                    launchedContracts.length - 1 - index
                                  ]
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {shortenAddress(
                                  launchedContracts[
                                    launchedContracts.length - 1 - index
                                  ]
                                )}
                              </a>
                            </p>
                            <p>
                              <strong>Supply:</strong>{" "}
                              {formatNumber(
                                Number(token.supply),
                                token.decimals
                              )}
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
                                (Number(token.supply) *
                                  token.antiWhalePercentage) /
                                  100,
                                token.decimals
                              )}
                            </p>
                          </div>
                          <TokenHoldersList
                            tokenAddress={
                              launchedContracts[
                                launchedContracts.length - 1 - index
                              ]
                            }
                            chainId={chain?.id}
                          />
                        </div>
                      ))}
                    </div>
                  )}
              </>
            )}
            {isClient && !walletAddress && (
              <p className="myTokensError">No Account Connected</p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default withWagmiConfig(ProfilePage)
