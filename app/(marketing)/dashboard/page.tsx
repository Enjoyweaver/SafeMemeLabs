"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ExchangeABI } from "@/ABIs/SafeLaunch/Exchange"
import { ExchangeFactoryABI } from "@/ABIs/SafeLaunch/ExchangeFactory"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"
import {
  blockExplorerAddress,
  exchangeFactory,
  rpcUrls,
  safeLaunchFactory,
} from "@/Constants/config"
import { ethers } from "ethers"

import "./tokenspecs.css"
import "react-toastify/dist/ReactToastify.css"
import Image from "next/image"
import ArDB from "ardb"
import Arweave from "arweave"
import { useAccount, useNetwork } from "wagmi"

type Profile = {
  handle: string
  name: string
  avatarURL: string
  links: {
    [key: string]: string
  }
}

type TokenInfo = {
  tokenAddress: string
  tokenSymbol: string
  tokenName: string
  totalSupply: string
  tokenBPairing: string
  stage: string
  isSafeLaunchActive: boolean
  isFinalized: boolean
  factoryAddress: string
  tokenFactoryAddress: string
  exchangeFactoryAddress: string
  isInitialized: boolean
  dexAddress: string
  exchangeBalance: string
  totalSafeMemeSold: string
  totalTokenBReceived: string
}

type ExchangeInfo = {
  tokenAddress: string
  dexAddress: string
  tokenSymbol: string
  tokenName: string
  ethBalance: bigint
  tokenBalance: bigint
}

export default function Dashboard(): JSX.Element {
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [exchanges, setExchanges] = useState<ExchangeInfo[]>([])
  const [selectedChainId, setSelectedChainId] = useState("4002")
  const { isConnected } = useAccount()
  const { chain } = useNetwork()
  const [isClient, setIsClient] = useState(false)
  const [errorMenu, setErrorMenu] = useState(false)
  const [factoryDetails, setFactoryDetails] = useState({
    exchangeFactoryAddress: "",
    tokenFactoryAddress: "",
  })
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [profileCount, setProfileCount] = useState<number>(0)

  const chainNames: { [key: string]: string } = {
    "4002": "Fantom Testnet",
    "250": "Fantom",
    "137": "Polygon",
    "43114": "Avalanche",
    "30": "RSK Mainnet",
    "31": "RSK Testnet",
    "1337": "Ethereum Sepolia",
    "64165": "Sonic Testnet",
    "421613": "Arbitrum Goerli",
    "338": "Cronos Testnet",
    "80001": "Polygon Mumbai",
    "1442": "Polygon ZkEVM Testnet",
    "11155111": "Sepolia",
  }

  useEffect(() => {
    setIsClient(true)

    if (typeof window.ethereum !== "undefined") {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(web3Provider)
      const web3Signer = web3Provider.getSigner()
      setSigner(web3Signer)
    }
  }, [])

  useEffect(() => {
    if (selectedChainId) {
      fetchTokens()
      fetchExchanges()
      fetchTokenFactoryDetails().then((factoryDetails) => {
        setFactoryDetails(factoryDetails)
      })
    }
  }, [selectedChainId])

  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  })

  useEffect(() => {
    fetchAllProfiles()
    fetchProfileCount()
  }, [])

  const fetchAllProfiles = async () => {
    try {
      const ardb = new ArDB(arweave)
      const transactions = await ardb
        .search("transactions")
        .tag("App-Name", "SafeMemes.fun")
        .find()

      console.log(`Fetched ${transactions.length} transactions.`)

      if (transactions.length === 0) {
        console.warn(
          "No transactions found with the tag 'App-Name: SafeMemes.fun'."
        )
        return
      }

      const profilesMap = new Map()

      for (const tx of transactions) {
        try {
          const dataString = await arweave.transactions.getData(tx.id, {
            decode: true,
            string: true,
          })
          const data = JSON.parse(dataString)

          console.log(`Transaction ID: ${tx.id}`, data)

          if (data.handleName && data.name) {
            if (!profilesMap.has(data.handleName)) {
              profilesMap.set(data.handleName, {
                handle: data.handleName,
                name: data.name,
                avatarURL: data.avatar
                  ? `https://arweave.net/${data.avatar}`
                  : "",
                links: data.links || {},
              })
              console.log(`Added profile: ${data.handleName}`)
            }
          }
        } catch (parseError) {
          console.warn(`Failed to parse transaction ${tx.id}:`, parseError)
        }
      }

      const fetchedProfiles = Array.from(profilesMap.values())
      setProfiles(fetchedProfiles)
      console.log("Fetched profiles:", fetchedProfiles)
    } catch (error) {
      console.error("Error fetching profiles:", error)
    }
  }

  const fetchProfileCount = async () => {
    try {
      const ardb = new ArDB(arweave)
      const transactions = await ardb
        .search("transactions")
        .tag("App-Name", "SafeMemes.fun")
        .find()

      const handleNames: string[] = []

      for (const tx of transactions) {
        try {
          const txData = await arweave.transactions.getData(tx.id, {
            decode: true,
            string: true,
          })

          const profile = JSON.parse(txData)

          if (profile.handleName) {
            handleNames.push(profile.handleName)
          }
        } catch (parseError) {
          console.error(`Error parsing transaction ${tx.id}:`, parseError)
          continue
        }
      }

      const uniqueHandleNames = new Set(handleNames)
      setProfileCount(uniqueHandleNames.size)
      console.log(`Unique Profiles: ${uniqueHandleNames.size}`)
    } catch (error) {
      console.error("Error fetching unique profile count:", error)
    }
  }

  const fetchTokens = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        rpcUrls[selectedChainId]
      )
      const factoryAddress = safeLaunchFactory[selectedChainId] as `0x${string}`
      const factoryContract = new ethers.Contract(
        factoryAddress,
        TokenFactoryABI,
        provider
      )

      const count = await factoryContract.getDeployedSafeMemeCount()
      const tokenList: TokenInfo[] = []

      for (let i = 0; i < count.toNumber(); i++) {
        const tokenAddress = await factoryContract.safeMemesDeployed(i)
        const tokenContract = new ethers.Contract(
          tokenAddress,
          SafeMemeABI,
          provider
        )

        const tokenSymbol = await tokenContract.symbol()
        const tokenName = await tokenContract.name()
        const totalSupply = await tokenContract.totalSupply()
        const formattedTotalSupply = ethers.utils.formatUnits(totalSupply, 18)

        let tokenBPairing = ""
        let stage = "Not started"
        let isSafeLaunchActive = false
        let isFinalized = false
        let isInitialized = false
        let dexAddress = ""
        let exchangeBalance = "0"
        let totalSafeMemeSold = "0"
        let totalTokenBReceived = "0"

        try {
          dexAddress = await tokenContract.dexAddress()
          isInitialized = dexAddress !== ethers.constants.AddressZero

          if (isInitialized) {
            const exchangeContract = new ethers.Contract(
              dexAddress,
              ExchangeABI,
              provider
            )

            tokenBPairing = await exchangeContract.tokenBAddress()
            const currentStage = await exchangeContract.currentStage()
            stage = (currentStage.toNumber() + 1).toString()
            isSafeLaunchActive = !(await exchangeContract.safeLaunchComplete())
            isFinalized = !isSafeLaunchActive

            const balance = await tokenContract.balanceOf(dexAddress)
            exchangeBalance = ethers.utils.formatUnits(balance, 18)

            totalSafeMemeSold = ethers.utils.formatUnits(
              await exchangeContract.getsafeMemesSold(),
              18
            )
            totalTokenBReceived = ethers.utils.formatUnits(
              await exchangeContract.getReceivedtokenB(),
              18
            )
          }
        } catch (exchangeError) {
          console.warn(
            `Exchange not yet created or initialized for token ${tokenAddress}`
          )
        }

        const exchangeFactoryAddress = await tokenContract.exchangeFactory()
        const tokenFactoryAddress = await tokenContract.tokenFactory()

        tokenList.push({
          tokenAddress,
          tokenSymbol,
          tokenName,
          totalSupply: formattedTotalSupply,
          tokenBPairing,
          stage,
          isSafeLaunchActive,
          isFinalized,
          factoryAddress: exchangeFactoryAddress,
          tokenFactoryAddress,
          exchangeFactoryAddress,
          isInitialized,
          dexAddress,
          exchangeBalance,
          totalSafeMemeSold,
          totalTokenBReceived,
        })
      }

      setTokens(tokenList)
    } catch (error) {
      console.error("Error fetching tokens:", error)
    }
  }

  const fetchExchanges = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        rpcUrls[selectedChainId]
      )
      const factoryAddress = exchangeFactory[selectedChainId] as `0x${string}`
      const factoryContract = new ethers.Contract(
        factoryAddress,
        ExchangeFactoryABI,
        provider
      )

      const count = await factoryContract.tokenCount()
      const exchangeList: ExchangeInfo[] = []

      for (let i = 0; i < count.toNumber(); i++) {
        const tokenAddress = await factoryContract.id_to_token(i)
        const dexAddress = await factoryContract.getExchange(tokenAddress)
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ExchangeABI,
          provider
        )

        const tokenSymbol = await tokenContract.symbol()
        const tokenName = await tokenContract.name()
        const ethBalance = await provider.getBalance(dexAddress) // get ETH balance
        const tokenBalance = await tokenContract.balanceOf(dexAddress) // get Token balance

        exchangeList.push({
          tokenAddress,
          dexAddress,
          tokenSymbol,
          tokenName,
          ethBalance,
          tokenBalance,
        })
      }

      setExchanges(exchangeList)
    } catch (error) {
      console.error("Error fetching exchanges:", error)
    }
  }

  const toggleErrorMenuOpen = () => {
    setErrorMenu(!errorMenu)
  }

  const getExplorerLink = (address: string) => {
    return `${blockExplorerAddress[selectedChainId]}${address}`
  }

  // Calculate totals
  const totalTokens = tokens.length
  const totalTransactions = exchanges.length
  const stageCounts = {
    1: tokens.filter((token) => token.stage === "1").length,
    2: tokens.filter((token) => token.stage === "2").length,
    3: tokens.filter((token) => token.stage === "3").length,
    4: tokens.filter((token) => token.stage === "4").length,
    5: tokens.filter((token) => token.stage === "5").length,
  }

  const fetchTokenFactoryDetails = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        rpcUrls[selectedChainId]
      )
      const factoryAddress = safeLaunchFactory[selectedChainId] as `0x${string}`
      const factoryContract = new ethers.Contract(
        factoryAddress,
        TokenFactoryABI,
        provider
      )

      const exchangeFactoryAddress = await factoryContract.exchangeFactory()
      const tokenFactoryAddress = factoryAddress // TokenFactory contract's own address

      return { exchangeFactoryAddress, tokenFactoryAddress }
    } catch (error) {
      console.error("Error fetching factory details:", error)
      return { exchangeFactoryAddress: "", tokenFactoryAddress: "" }
    }
  }

  return (
    <>
      <div>
        <h1 className="title">Creator Dashboard</h1>
        <div className="profile-count">
          <p className="profile-count">
            Total Profiles Created: {profileCount}
          </p>
        </div>
        <div className="profiles-container">
          <h2>All Profiles</h2>
          {profiles.length > 0 ? (
            <table className="profiles-table">
              <thead>
                <tr>
                  <th>Handle</th>
                  <th>Name</th>
                  <th>Avatar</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile, index) => (
                  <tr key={index}>
                    <td>
                      <Link href={`/${profile.handle}`}>{profile.handle}</Link>
                    </td>
                    <td>{profile.name}</td>
                    <td>
                      {profile.avatarURL ? (
                        <Link href={`/${profile.handle}`}>
                          <Image
                            src={profile.avatarURL}
                            alt={profile.name}
                            width={50}
                            height={50}
                          />
                        </Link>
                      ) : (
                        "No Avatar"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No profiles available.</p>
          )}
        </div>
      </div>
    </>
  )
}
