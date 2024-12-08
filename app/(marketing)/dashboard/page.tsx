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
  links: { [key: string]: string }
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

  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  })

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

  useEffect(() => {
    fetchAllProfiles()
    fetchProfileCount()
  }, [])

  const fetchAllProfiles = async () => {
    try {
      const ardb = new ArDB(arweave)
      // Increase limit to try to get all transactions in one go if small enough
      // Otherwise, we'll implement pagination
      let allTxs: any[] = []
      let res = await ardb
        .search("transactions")
        .tag("App-Name", "SafeMemes.fun")
        .limit(1000)
        .find()

      allTxs = allTxs.concat(res)

      // Check if there's pagination needed
      while (res && res.length === 1000) {
        // Attempt to paginate
        ardb.cursor(res[res.length - 1].id)
        res = await ardb.next()
        if (res && res.length > 0) {
          allTxs = allTxs.concat(res)
        }
      }

      console.log(
        `Fetched ${allTxs.length} transactions (potentially paginated).`
      )

      if (allTxs.length === 0) {
        console.warn(
          "No transactions found with the tag 'App-Name: SafeMemes.fun'."
        )
        return
      }

      const profilesMap = new Map<string, Profile>()

      // To handle troublesome transactions, we might try multiple attempts
      for (const tx of allTxs) {
        let txData: string | null = null
        try {
          txData = await loadTransactionData(arweave, tx.id)
        } catch (err) {
          console.warn(
            `Failed to load data for transaction ${tx.id} on first attempt:`,
            err
          )
          // Optional: Retry logic if desired
          try {
            txData = await loadTransactionData(arweave, tx.id)
          } catch (retryErr) {
            console.warn(`Second attempt failed for ${tx.id}:`, retryErr)
          }
        }

        if (!txData) {
          console.warn(`Skipping transaction ${tx.id} due to no data.`)
          continue
        }

        let data: any
        try {
          data = JSON.parse(txData)
        } catch (parseError) {
          console.warn(`Failed to parse JSON for ${tx.id}:`, parseError)
          continue
        }

        const profileData = data.profile || data
        const handleName = profileData.handleName
        const name = profileData.name

        // If handleName is missing, we skip, but log it for debugging
        if (!handleName) {
          console.log(`Transaction ${tx.id} has no handleName, skipping.`)
          continue
        }

        // If name is missing, we can still display the profile by just using the handle
        const displayName = name || "Unnamed"

        // If we already have this handleName, we won't overwrite it,
        // assuming the first found is the original creation.
        // If you want to update profiles with the latest transaction, change logic here.
        if (!profilesMap.has(handleName)) {
          profilesMap.set(handleName, {
            handle: handleName,
            name: displayName,
            avatarURL: profileData.avatar
              ? `https://arweave.net/${profileData.avatar}`
              : "",
            links: profileData.links || {},
          })
          console.log(`Added/Updated profile: ${handleName}`)
        }
      }

      const fetchedProfiles = Array.from(profilesMap.values())

      // Sort by handle for consistent display
      fetchedProfiles.sort((a, b) => a.handle.localeCompare(b.handle))

      setProfiles(fetchedProfiles)
      console.log("Fetched profiles:", fetchedProfiles)
    } catch (error) {
      console.error("Error fetching profiles:", error)
    }
  }

  // A helper function to load transaction data robustly
  async function loadTransactionData(
    arweave: Arweave,
    txId: string
  ): Promise<string> {
    try {
      // Attempt direct fetch
      return await arweave.transactions.getData(txId, {
        decode: true,
        string: true,
      })
    } catch (err) {
      console.warn(
        `Error fetching data from ${txId} directly, trying gateway fallback:`,
        err
      )
      // We can implement other gateways or strategies here if needed
      throw err
    }
  }

  const fetchProfileCount = async () => {
    try {
      const ardb = new ArDB(arweave)
      let allTxs: any[] = []
      let res = await ardb
        .search("transactions")
        .tag("App-Name", "SafeMemes.fun")
        .limit(1000)
        .find()

      allTxs = allTxs.concat(res)

      while (res && res.length === 1000) {
        ardb.cursor(res[res.length - 1].id)
        res = await ardb.next()
        if (res && res.length > 0) {
          allTxs = allTxs.concat(res)
        }
      }

      console.log(`Fetched ${allTxs.length} transactions for counting.`)

      const handleNames: string[] = []

      for (const tx of allTxs) {
        let txData: string | null = null
        try {
          txData = await loadTransactionData(arweave, tx.id)
        } catch (err) {
          console.warn(`Failed to load data for counting from ${tx.id}:`, err)
          continue
        }

        if (!txData) continue

        let parsedData: any
        try {
          parsedData = JSON.parse(txData)
        } catch (parseErr) {
          console.error(`Error parsing transaction ${tx.id}:`, parseErr)
          continue
        }

        const profileData = parsedData.profile || parsedData
        if (profileData.handleName) {
          handleNames.push(profileData.handleName)
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
            `Exchange not initialized for token ${tokenAddress}:`,
            exchangeError
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
        const ethBalance = await provider.getBalance(dexAddress)
        const tokenBalance = await tokenContract.balanceOf(dexAddress)

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
      const tokenFactoryAddress = factoryAddress

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
