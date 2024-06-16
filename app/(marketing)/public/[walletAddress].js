// app/profile/[walletAddress].js
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { erc20ABI } from "@/ABIs/erc20"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import { tokenLauncherABI } from "@/ABIs/tokenLauncher"
import TokenHoldersList from "@/APIs/tokeninfo"
import {
  blockExplorerUrls,
  tokenDeployerDetails,
  tokenLauncherDetails,
} from "@/Constants/config"
import withWagmiConfig from "@/withWagmiConfig"
import { useContractRead, useContractReads } from "wagmi"

import { Navbar } from "@/components/walletconnect/walletconnect"

function ProfilePage() {
  const [isClient, setIsClient] = useState(false)
  const [tokenCount, setTokenCount] = useState(0)
  const [launchedTokenCount, setLaunchedTokenCount] = useState(0)
  const [contracts, setContracts] = useState([])
  const [launchedContracts, setLaunchedContracts] = useState([])
  const [deployedTokenData, setDeployedTokenData] = useState([])
  const [launchedTokenData, setLaunchedTokenData] = useState([])

  const router = useRouter()
  const { walletAddress } = router.query
  const defaultChainId = 250 // Default to a specific chain ID

  useEffect(() => {
    setIsClient(true)
  }, [])

  const {
    data: deployerContracts,
    error: deployerContractsError,
    refetch: refetchDeployerContracts,
  } = useContractRead({
    address: tokenDeployerDetails[defaultChainId],
    abi: tokenDeployerABI,
    functionName: "getTokensDeployedByUser",
    args: [walletAddress],
    enabled: !!walletAddress,
  })

  const {
    data: launcherContracts,
    error: launcherContractsError,
    refetch: refetchLauncherContracts,
  } = useContractRead({
    address: tokenLauncherDetails[defaultChainId],
    abi: tokenLauncherABI,
    functionName: "getTokensDeployedByUser",
    args: [walletAddress],
    enabled: !!walletAddress,
  })

  useEffect(() => {
    if (walletAddress) {
      refetchDeployerContracts()
      refetchLauncherContracts()
    }
  }, [walletAddress, refetchDeployerContracts, refetchLauncherContracts])

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
    .map((contract) => [
      { address: contract, abi: erc20ABI, functionName: "name" },
      { address: contract, abi: erc20ABI, functionName: "symbol" },
      { address: contract, abi: erc20ABI, functionName: "totalSupply" },
      { address: contract, abi: erc20ABI, functionName: "decimals" },
      { address: contract, abi: erc20ABI, functionName: "antiWhalePercentage" },
    ])
    .flat()

  const launcherContractRequests = launchedContracts
    .map((contract) => [
      { address: contract, abi: erc20ABI, functionName: "name" },
      { address: contract, abi: erc20ABI, functionName: "symbol" },
      { address: contract, abi: erc20ABI, functionName: "totalSupply" },
      { address: contract, abi: erc20ABI, functionName: "decimals" },
      { address: contract, abi: erc20ABI, functionName: "antiWhalePercentage" },
    ])
    .flat()

  const {
    data: deployerTokenData,
    error: deployerTokenDataError,
    refetch: refetchDeployerTokenData,
  } = useContractReads({
    contracts: deployerContractRequests,
    enabled: contracts.length > 0,
  })

  const {
    data: launcherTokenData,
    error: launcherTokenDataError,
    refetch: refetchLauncherTokenData,
  } = useContractReads({
    contracts: launcherContractRequests,
    enabled: launchedContracts.length > 0,
  })

  useEffect(() => {
    if (contracts.length > 0) {
      refetchDeployerTokenData()
    }
  }, [contracts, refetchDeployerTokenData])

  useEffect(() => {
    if (launchedContracts.length > 0) {
      refetchLauncherTokenData()
    }
  }, [launchedContracts, refetchLauncherTokenData])

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
    return namedData.reverse()
  }

  const formatNumber = (number, decimals) => {
    return (number / 10 ** decimals).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })
  }

  const getBlockExplorerLink = (address) => {
    return `${blockExplorerUrls[defaultChainId] || ""}${address}`
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
            {isClient && !tokenDeployerDetails[defaultChainId] && (
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
                              src="/images/logo.png"
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
                            chainId={defaultChainId}
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
                              src="/images/logo.png"
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
                            chainId={defaultChainId}
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
