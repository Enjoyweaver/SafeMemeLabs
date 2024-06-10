"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { erc20ABI } from "@/ABIs/erc20"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import {
  useAccount,
  useContractRead,
  useContractReads,
  useNetwork,
} from "wagmi"

import { Navbar } from "@/components/walletconnect/walletconnect"

import { tokenDeployerDetails } from "../../../Constants/config"
import "@/styles/profile.css"
import DexData from "@/APIs/exchangedata"
import TokenHoldersList from "@/APIs/tokeninfo"

export default function MyTokens(): JSX.Element {
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

  const { data: contracts, error: contractsError } = useContractRead({
    address: tokenDeployerDetails[chainId] as `0x${string}`,
    abi: tokenDeployerABI,
    functionName: "getTokensDeployedByUser",
    args: [address as `0x${string}`],
    enabled: !!address,
  })

  useEffect(() => {
    if (contractsError) {
      console.error("Contracts Error: ", contractsError)
    }
    if (contracts) {
      console.log("Contracts: ", contracts)
      setTokenCount(contracts.length)
    }
  }, [contracts, contractsError])

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

  const { data: tempTokenData, error: tempTokenDataError } = useContractReads({
    contracts: contractRequests?.flat(),
    enabled: !!contractRequests?.length,
  })

  useEffect(() => {
    if (tempTokenDataError) {
      console.error("Temp Token Data Error: ", tempTokenDataError)
    }
    if (tempTokenData) {
      console.log("Temp Token Data: ", tempTokenData)
    }
  }, [tempTokenData, tempTokenDataError])

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
            </div>
            {!isClient && <p className="myTokensError">Loading...</p>}
            {isClient && isConnected && (
              <>
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
