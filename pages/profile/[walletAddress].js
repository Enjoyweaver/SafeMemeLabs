import { useEffect, useState } from "react"
import Image from "next/image"
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
import { useContractReads } from "wagmi"

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

  useEffect(() => {
    setIsClient(true)
    console.log("Router Query: ", router.query)
    console.log("Wallet Address: ", walletAddress)
  }, [router.query, walletAddress])

  useEffect(() => {
    if (walletAddress) {
      fetchAllContracts(walletAddress)
    }
  }, [walletAddress])

  const fetchAllContracts = async (walletAddress) => {
    let allDeployerContracts = []
    let allLauncherContracts = []
    for (const chainId in tokenDeployerDetails) {
      const deployerResult = await fetchContractRead({
        address: tokenDeployerDetails[chainId],
        abi: tokenDeployerABI,
        functionName: "getTokensDeployedByUser",
        args: [walletAddress],
      })
      console.log(`Deployer contracts on chain ${chainId}:`, deployerResult)
      allDeployerContracts = allDeployerContracts.concat(deployerResult)

      const launcherResult = await fetchContractRead({
        address: tokenLauncherDetails[chainId],
        abi: tokenLauncherABI,
        functionName: "getTokensDeployedByUser",
        args: [walletAddress],
      })
      console.log(`Launcher contracts on chain ${chainId}:`, launcherResult)
      allLauncherContracts = allLauncherContracts.concat(launcherResult)
    }
    console.log("All Deployer Contracts:", allDeployerContracts)
    console.log("All Launcher Contracts:", allLauncherContracts)

    setContracts(allDeployerContracts)
    setLaunchedContracts(allLauncherContracts)
    setTokenCount(allDeployerContracts.length)
    setLaunchedTokenCount(allLauncherContracts.length)

    const deployerContractRequests = allDeployerContracts
      .map((contract) => [
        { address: contract, abi: erc20ABI, functionName: "name" },
        { address: contract, abi: erc20ABI, functionName: "symbol" },
        { address: contract, abi: erc20ABI, functionName: "totalSupply" },
        { address: contract, abi: erc20ABI, functionName: "decimals" },
        {
          address: contract,
          abi: erc20ABI,
          functionName: "antiWhalePercentage",
        },
      ])
      .flat()

    const launcherContractRequests = allLauncherContracts
      .map((contract) => [
        { address: contract, abi: erc20ABI, functionName: "name" },
        { address: contract, abi: erc20ABI, functionName: "symbol" },
        { address: contract, abi: erc20ABI, functionName: "totalSupply" },
        { address: contract, abi: erc20ABI, functionName: "decimals" },
        {
          address: contract,
          abi: erc20ABI,
          functionName: "antiWhalePercentage",
        },
      ])
      .flat()

    console.log("Deployer Contract Requests:", deployerContractRequests)
    console.log("Launcher Contract Requests:", launcherContractRequests)

    fetchTokenData(deployerContractRequests, setDeployedTokenData)
    fetchTokenData(launcherContractRequests, setLaunchedTokenData)
  }

  const fetchContractRead = async ({ address, abi, functionName, args }) => {
    try {
      const result = await useContractRead({ address, abi, functionName, args })
      console.log(`Result for ${functionName} with args ${args}:`, result)
      return result.data
    } catch (error) {
      console.error("Contract Read Error: ", error)
      return []
    }
  }

  const fetchTokenData = async (contractRequests, setTokenData) => {
    try {
      const result = await useContractReads({
        contracts: contractRequests,
        enabled: contractRequests.length > 0,
      })
      console.log("Token Data Result:", result)
      setTokenData(splitData(result.data))
    } catch (error) {
      console.error("Token Data Error: ", error)
      setTokenData([])
    }
  }

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

  const getBlockExplorerLink = (address, chainId) => {
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
                                  contracts[contracts.length - 1 - index],
                                  token.chainId
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
                            chainId={token.chainId}
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
                                  ],
                                  token.chainId
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
                            chainId={token.chainId}
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
