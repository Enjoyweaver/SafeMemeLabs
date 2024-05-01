"use client"

import { useEffect, useState } from "react"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import { useIsMounted } from "usehooks-ts"
import {
  erc20ABI,
  useAccount,
  useContractRead,
  useContractReads,
  useNetwork,
} from "wagmi"

import { ChangeNetwork } from "@/components/changeNetwork/changeNetwork"

import { tokenDeployerDetails } from "../../../Constants/config"
import styles from "./page.module.css"

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

  const { data: contracts } = useContractRead({
    address: tokenDeployerDetails[chainId] as `0x${string}`,
    abi: tokenDeployerABI,
    functionName: "getTokensDeployedByUser",
    args: [address as `0x${string}`],
  })

  useEffect(() => {
    if (contracts) {
      setTokenCount(contracts.length)
    }
  }, [contracts])

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
  ])

  const { data: tempTokenData } = useContractReads({
    contracts: contractRequests?.flat(),
  })

  function splitData(data: any) {
    console.log(data)
    const groupedData = []
    const namedData = []
    for (let i = 0; i < data.length; i += 4) {
      groupedData.push(data.slice(i, i + 4))
    }
    for (let i = 0; i < groupedData.length; i++) {
      namedData.push({
        name: groupedData[i][0].result,
        symbol: groupedData[i][1].result,
        supply: groupedData[i][2].result,
        decimals: groupedData[i][3].result,
      })
    }
    return namedData
  }

  return (
    <div className={styles.myTokens}>
      {isClient && chainId && !tokenDeployerDetails[chainId] && (
        <ChangeNetwork
          changeNetworkToChainId={250}
          dappName={"SafeMeme Labs"}
          networks={"Fantom and Degen"}
        />
      )}
      <div className={styles.myTokensHeading}>
        <p className={styles.heading}>My Tokens</p>
        <p className={styles.subheading}>
          See all the tokens you have created!
        </p>
        <p className={styles.tokenCount}>
          Number of Tokens Created: {tokenCount}
        </p>
      </div>
      {/* Render token list */}
      {!isClient && <p className={styles.myTokensError}>Loading...</p>}
      {isClient && isConnected && (
        <>
          {contracts && contracts.length === 0 && (
            <p className={styles.myTokensError}>No tokens available.</p>
          )}
          {contracts &&
            contracts.length > 0 &&
            tempTokenData &&
            tempTokenData.length > 0 &&
            splitData(tempTokenData)
              .reverse()
              .map((token, index: number) => (
                <div key={index} className={styles.token}>
                  <p className={styles.tokenName}>
                    {token.name} ({token.symbol})
                  </p>
                  <p>Contract Address: {contracts[index]}</p>
                  <p>Supply: {Number(token.supply) / 10 ** token.decimals}</p>
                  <p>Decimals: {token.decimals}</p>
                </div>
              ))}
        </>
      )}
      {isClient && !isConnected && (
        <p className={styles.myTokensError}>No Account Connected</p>
      )}
    </div>
  )
}
