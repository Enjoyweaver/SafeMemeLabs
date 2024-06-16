import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/router"
import { erc20ABI } from "@/ABIs/erc20"
import TokenHoldersList from "@/APIs/tokeninfo"
import { blockExplorerUrls } from "@/Constants/config"
import withWagmiConfig from "@/withWagmiConfig"

import useContractData from "@/hooks/useContractData"
import useTokenData from "@/hooks/useTokenData"
import { Navbar } from "@/components/walletconnect/walletconnect"

function ProfilePage() {
  const [isClient, setIsClient] = useState(false)
  const [tokenCount, setTokenCount] = useState(0)
  const [launchedTokenCount, setLaunchedTokenCount] = useState(0)
  const router = useRouter()
  const { walletAddress } = router.query

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { deployerContracts, launcherContracts } =
    useContractData(walletAddress)

  useEffect(() => {
    setTokenCount(deployerContracts.length)
    setLaunchedTokenCount(launcherContracts.length)
  }, [deployerContracts, launcherContracts])

  const deployerContractRequests = deployerContracts
    .map((contract) => [
      { address: contract, abi: erc20ABI, functionName: "name" },
      { address: contract, abi: erc20ABI, functionName: "symbol" },
      { address: contract, abi: erc20ABI, functionName: "totalSupply" },
      { address: contract, abi: erc20ABI, functionName: "decimals" },
      { address: contract, abi: erc20ABI, functionName: "antiWhalePercentage" },
    ])
    .flat()

  const launcherContractRequests = launcherContracts
    .map((contract) => [
      { address: contract, abi: erc20ABI, functionName: "name" },
      { address: contract, abi: erc20ABI, functionName: "symbol" },
      { address: contract, abi: erc20ABI, functionName: "totalSupply" },
      { address: contract, abi: erc20ABI, functionName: "decimals" },
      { address: contract, abi: erc20ABI, functionName: "antiWhalePercentage" },
    ])
    .flat()

  const deployedTokenData = useTokenData(deployerContractRequests)
  const launchedTokenData = useTokenData(launcherContractRequests)

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
                {deployerContracts.length === 0 && (
                  <p className="myTokensError">No tokens available.</p>
                )}
                {deployerContracts.length > 0 &&
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
                                  deployerContracts[
                                    deployerContracts.length - 1 - index
                                  ],
                                  token.chainId
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {shortenAddress(
                                  deployerContracts[
                                    deployerContracts.length - 1 - index
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
                              deployerContracts[
                                deployerContracts.length - 1 - index
                              ]
                            }
                            chainId={token.chainId}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                <h2 className="sectionTitle">SafeMemes Launched</h2>
                {launcherContracts.length === 0 && (
                  <p className="myTokensError">No launched tokens available.</p>
                )}
                {launcherContracts.length > 0 &&
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
                                  launcherContracts[
                                    launcherContracts.length - 1 - index
                                  ],
                                  token.chainId
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {shortenAddress(
                                  launcherContracts[
                                    launcherContracts.length - 1 - index
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
                              launcherContracts[
                                launcherContracts.length - 1 - index
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
