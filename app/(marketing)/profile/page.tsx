"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { erc20ABI } from "@/ABIs/erc20"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import { tokenLauncherABI } from "@/ABIs/tokenLauncher"
import {
  useAccount,
  useContractRead,
  useContractReads,
  useNetwork,
} from "wagmi"

import { ChangeNetwork } from "@/components/changeNetwork/changeNetwork"
import { Navbar } from "@/components/walletconnect/walletconnect"

import {
  lockerDetails,
  managerDetails,
  tokenDeployerDetails,
  tokenLauncherDetails,
} from "../../../Constants/config"
import "@/styles/profile.css"
import DexData from "@/APIs/exchangedata"
import TokenHoldersList from "@/APIs/tokeninfo"

export default function MyTokens(): JSX.Element {
  const [isClient, setIsClient] = useState(false)
  const [tokenCount, setTokenCount] = useState<number>(0)
  const [launchedTokenCount, setLaunchedTokenCount] = useState<number>(0)
  const [contracts, setContracts] = useState<string[]>([])
  const [launchedContracts, setLaunchedContracts] = useState<string[]>([])
  const [launchedTokenData, setLaunchedTokenData] = useState<any[]>([])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const chainId: string | number = chain
    ? chain.id
    : Object.keys(tokenDeployerDetails)[0]

  const { data: deployerContracts, error: deployerContractsError } =
    useContractRead({
      address: tokenDeployerDetails[chainId] as `0x${string}`,
      abi: tokenDeployerABI,
      functionName: "getTokensDeployedByUser",
      args: [address as `0x${string}`],
      enabled: !!address,
    })

  const { data: launcherContracts, error: launcherContractsError } =
    useContractRead({
      address: tokenLauncherDetails[chainId] as `0x${string}`,
      abi: tokenLauncherABI,
      functionName: "getTokensDeployedByUser",
      args: [address as `0x${string}`],
      enabled: !!address,
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

  const { data: tempTokenData, error: tempTokenDataError } = useContractReads({
    contracts: deployerContractRequests,
    enabled: !!deployerContractRequests?.length,
  })

  useEffect(() => {
    if (tempTokenDataError) {
      console.error("Temp Token Data Error: ", tempTokenDataError)
    }
    if (tempTokenData) {
      console.log("Temp Token Data: ", tempTokenData)
    }
  }, [tempTokenData, tempTokenDataError])

  useEffect(() => {
    if (launcherContracts && launcherContracts.length > 0) {
      const fetchLaunchedTokenData = async () => {
        const tokenData = []
        for (const contract of launcherContracts) {
          const name = await fetchTokenData(contract, "name")
          const symbol = await fetchTokenData(contract, "symbol")
          const totalSupply = await fetchTokenData(contract, "totalSupply")
          const decimals = await fetchTokenData(contract, "decimals")
          const antiWhalePercentage = await fetchTokenData(
            contract,
            "antiWhalePercentage"
          )

          tokenData.push({
            contract,
            name,
            symbol,
            totalSupply,
            decimals,
            antiWhalePercentage,
          })
        }
        setLaunchedTokenData(tokenData)
      }
      fetchLaunchedTokenData()
    }
  }, [launcherContracts])

  const fetchTokenData = async (contractAddress, functionName) => {
    const { data, error } = await useContractRead({
      address: contractAddress as `0x${string}`,
      abi: erc20ABI,
      functionName,
    })
    if (error) {
      console.error(`Error fetching ${functionName}: `, error)
    }
    return data
  }

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
              <h1 className="pagetitle">My Profile</h1>
              <p className="subheading">See all the tokens you have created!</p>
              <p className="tokenCount">
                Number of Tokens Created: {tokenCount}
              </p>
              <p className="tokenCount">
                Number of Tokens Launched: {launchedTokenCount}
              </p>
            </div>
            {!isClient && <p className="myTokensError">Loading...</p>}
            {isClient && isConnected && (
              <>
                <h2 className="sectionTitle">SafeMemes Created</h2>
                {contracts && contracts.length === 0 && (
                  <p className="myTokensError">No tokens available.</p>
                )}
                {contracts &&
                  contracts.length > 0 &&
                  tempTokenData &&
                  tempTokenData.length > 0 && (
                    <div className="meme-container">
                      {splitData(tempTokenData).map((token, index: number) => (
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
                          <DexData
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
                      {launchedTokenData.map((token, index: number) => (
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
                              {token.contract}
                            </p>
                            <p>
                              <strong>Supply:</strong>{" "}
                              {formatNumber(
                                Number(token.totalSupply),
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
                              <strong>Locker Address:</strong>{" "}
                              {lockerDetails[chainId]}
                            </p>
                            <p>
                              <strong>Manager Address:</strong>{" "}
                              {managerDetails[chainId]}
                            </p>
                          </div>
                          <TokenHoldersList
                            tokenAddress={token.contract}
                            chainId={chain?.id}
                          />
                          <DexData
                            tokenAddress={token.contract}
                            chainId={chain?.id}
                          />
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
