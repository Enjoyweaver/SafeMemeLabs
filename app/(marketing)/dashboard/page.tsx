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

      const profilesData: Profile[] = []

      for (const tx of transactions) {
        try {
          const dataString = await arweave.transactions.getData(tx.id, {
            decode: true,
            string: true,
          })
          const data = JSON.parse(dataString)

          if (data.handleName && data.name && data.avatar) {
            profilesData.push({
              handle: data.handleName,
              name: data.name,
              avatarURL: `https://arweave.net/${data.avatar}`,
              links: data.links || {},
            })
          } else {
            console.warn(
              `Transaction ${tx.id} is missing required fields. HandleName: ${data.handleName}, Name: ${data.name}, Avatar: ${data.avatar}`
            )
          }
        } catch (parseError) {
          console.warn(`Failed to parse transaction ${tx.id}:`, parseError)
          continue
        }
      }

      setProfiles(profilesData)
      console.log("Fetched profiles:", profilesData)
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

      setProfileCount(transactions.length)
      console.log(`Total Profiles: ${transactions.length}`)
    } catch (error) {
      console.error("Error fetching profile count:", error)
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
      <div className="flex min-h-screen flex-col">
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
                        <Link href={`/${profile.handle}`}>
                          {profile.handle}
                        </Link>
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
          <div className="form">
            <div className="inputGroup">
              <label className="inputTitle">Select Blockchain:</label>
              <select
                id="chain-select"
                value={selectedChainId}
                onChange={(e) => setSelectedChainId(e.target.value)}
                className="tokenInput"
              >
                {Object.keys(rpcUrls).map((chainId) => (
                  <option key={chainId} value={chainId}>
                    {chainNames[chainId] || chainId}
                  </option>
                ))}
              </select>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="table-header">Total Tokens Created</th>
                    <th className="table-header">Stage 1 Tokens</th>
                    <th className="table-header">Stage 2 Tokens</th>
                    <th className="table-header">Stage 3 Tokens</th>
                    <th className="table-header">Stage 4 Tokens</th>
                    <th className="table-header">Stage 5 Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{totalTokens}</td>
                    <td>{stageCounts[1]}</td>
                    <td>{stageCounts[2]}</td>
                    <td>{stageCounts[3]}</td>
                    <td>{stageCounts[4]}</td>
                    <td>{stageCounts[5]}</td>
                  </tr>
                  <tr>
                    <td colSpan={6}>
                      <strong>TokenFactory Address:</strong>{" "}
                      <Link
                        href={getExplorerLink(
                          factoryDetails.tokenFactoryAddress
                        )}
                        target="_blank"
                      >
                        {factoryDetails.tokenFactoryAddress.slice(0, 6)}...
                        {factoryDetails.tokenFactoryAddress.slice(-4)}
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={6}>
                      <strong>ExchangeFactory Address:</strong>{" "}
                      <Link
                        href={getExplorerLink(
                          factoryDetails.exchangeFactoryAddress
                        )}
                        target="_blank"
                      >
                        {factoryDetails.exchangeFactoryAddress.slice(0, 6)}...
                        {factoryDetails.exchangeFactoryAddress.slice(-4)}
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="token-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="table-header">Token Name</th>
                    <th className="table-header">Token Symbol</th>
                    <th className="table-header">Token Address</th>
                    <th className="table-header">Total Supply</th>
                    <th className="table-header narrow-column">
                      SafeLaunch Initialized
                    </th>
                    <th className="table-header">Token B Pairing</th>
                    <th className="table-header narrow-column">Stage</th>
                    <th className="table-header narrow-column">DEX Address</th>
                    <th className="table-header narrow-column">
                      DEX SafeMeme Balance
                    </th>
                    <th className="table-header narrow-column">
                      Total Token A Sold
                    </th>
                    <th className="table-header narrow-column">
                      Total Token B Received
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token, index) => (
                    <tr key={index}>
                      <td>
                        <Link
                          href={`/tokendata?tokenAddress=${token.tokenAddress}`}
                        >
                          <span className="token-name-link">
                            {token.tokenName}
                          </span>
                        </Link>
                      </td>
                      <td>{token.tokenSymbol}</td>
                      <td>
                        <Link
                          href={getExplorerLink(token.tokenAddress)}
                          target="_blank"
                        >
                          {token.tokenAddress.slice(0, 6)}...
                          {token.tokenAddress.slice(-4)}
                        </Link>
                      </td>
                      <td>{token.totalSupply.toString()}</td>
                      <td className="narrow-column">
                        {token.isInitialized ? "Yes" : "No"}
                      </td>
                      <td>
                        {token.tokenBPairing ? (
                          <Link
                            href={getExplorerLink(token.tokenBPairing)}
                            target="_blank"
                          >
                            {token.tokenBPairing.slice(0, 6)}...
                            {token.tokenBPairing.slice(-4)}
                          </Link>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="narrow-column">{token.stage}</td>
                      <td className="narrow-column">
                        <Link
                          href={getExplorerLink(token.dexAddress)}
                          target="_blank"
                        >
                          {token.dexAddress.slice(0, 6)}...
                          {token.dexAddress.slice(-4)}
                        </Link>
                      </td>
                      <td className="narrow-column">
                        {parseFloat(token.exchangeBalance).toFixed(2)}
                      </td>
                      <td className="narrow-column">
                        {parseFloat(token.totalSafeMemeSold).toFixed(2)}
                      </td>
                      <td className="narrow-column">
                        {parseFloat(token.totalTokenBReceived).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
