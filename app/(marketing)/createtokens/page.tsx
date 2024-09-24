"use client"

import { ChangeEvent, useEffect, useState } from "react"
import Link from "next/link"
import ArDB from "ardb"
import Arweave from "arweave"
import Account, { ArAccount, ArProfile } from "arweave-account"
import { ArweaveWebWallet } from "arweave-wallet-connector"
import { ethers } from "ethers"
import { toast } from "react-toastify"

import { Navbar } from "@/components/walletconnect/walletconnect"

import "./factory.css"
import "react-toastify/dist/ReactToastify.css"
import Image from "next/image"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"
import { exchangeFactory, safeLaunchFactory } from "@/Constants/config"
import { useDebounce } from "usehooks-ts"
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi"

import { capitalizeFirstLetter } from "../../../utils/capitilizeFirstLetter"
import Modal from "./Modal"

export default function Factory(): JSX.Element {
  const [name, setName] = useState<string>("")
  const [symbol, setSymbol] = useState<string>("")
  const [supply, setSupply] = useState<string>("")
  const [decimals, setDecimals] = useState<string>("18")
  const [antiWhalePercentage, setAntiWhalePercentage] = useState<string>("")
  const dName = useDebounce(name, 500)
  const dSymbol = useDebounce(symbol, 500)
  const dSupply = useDebounce(supply, 500)
  const dDecimals = useDebounce(decimals, 500)
  const dAntiWhalePercentage = useDebounce(antiWhalePercentage, 500)
  const [creationFee, setCreationFee] = useState<string>("")
  const [isClient, setIsClient] = useState(false)
  const [errorMenu, setErrorMenu] = useState(false)
  const { isConnected } = useAccount()
  const { chain } = useNetwork()

  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState("")
  const [transactionHash, setTransactionHash] = useState<string>("")
  const [arweaveWallet, setArweaveWallet] = useState<ArweaveWebWallet | null>(
    null
  )
  const [isArweaveConnected, setIsArweaveConnected] = useState(false)
  const [arProfile, setArProfile] = useState<ArProfile | null>(null)
  const [isProfileVerified, setIsProfileVerified] = useState(false)

  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  })

  const handleConnectArweave = async () => {
    try {
      const wallet = new ArweaveWebWallet({
        name: "SafeMeme Labs",
        logo: "URL to your app logo",
      })
      wallet.setUrl("https://arweave.app")
      await wallet.connect()
      setArweaveWallet(wallet)
      const address = wallet.address
      if (!address) {
        throw new Error("Arweave wallet address not found.")
      }
      setIsArweaveConnected(true)
      console.log("Arweave Wallet connected. Address:", address)
      fetchArProfile(address)
    } catch (error) {
      console.error("Error connecting Arweave wallet:", error)
      alert("Failed to connect Arweave Wallet.")
    }
  }

  const fetchArProfile = async (address: string) => {
    try {
      const account = new Account(arweave)
      const userProfile: ArAccount = await account.get(address)

      if (
        userProfile &&
        userProfile.profile &&
        userProfile.profile.handleName
      ) {
        const ardb = new ArDB(arweave)
        const transactions = await ardb
          .search("transactions")
          .from(address)
          .tag("App-Name", "SafeMemes.fun")
          .findAll()

        if (transactions.length > 0) {
          setArProfile(userProfile.profile)
          setIsProfileVerified(true)
          console.log("Arweave Profile fetched and verified successfully.")
        } else {
          setIsProfileVerified(false)
          alert(
            "Your Arweave profile exists but hasn't been created or updated on SafeMemes.fun. Please update your profile on our platform."
          )
        }
      } else {
        setIsProfileVerified(false)
        alert("No Arweave profile found. Please create one on SafeMemes.fun.")
      }
    } catch (error) {
      console.error("Error fetching Arweave profile:", error)
      alert("Failed to fetch Arweave profile.")
    }
  }

  const isMintingWalletVerified = (): boolean => {
    if (!arProfile || !arProfile.wallets || !ethAddress) return false
    return Object.values(arProfile.wallets).some(
      (walletAddress) =>
        walletAddress.toLowerCase() === ethAddress.toLowerCase()
    )
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (chain && chain.id) {
      const factoryAddress = safeLaunchFactory[chain.id] || ""
      console.log("Factory Address:", factoryAddress)

      if (!factoryAddress) {
        console.error(`Missing addresses for chain ID ${chain.id}`)
      }
    }
  }, [chain])

  const setTokenName = (e: ChangeEvent<HTMLInputElement>) =>
    setName(e.target.value)
  const setTokenSymbol = (e: ChangeEvent<HTMLInputElement>) =>
    setSymbol(e.target.value)
  const setTokenSupply = (e: ChangeEvent<HTMLInputElement>) =>
    setSupply(e.target.value)
  const setTokenDecimals = (e: ChangeEvent<HTMLInputElement>) =>
    setDecimals(e.target.value)
  const setAntiWhalePercentageInput = (e: ChangeEvent<HTMLInputElement>) =>
    setAntiWhalePercentage(e.target.value)

  const isFormFilled = (): boolean =>
    name.trim().length > 0 &&
    symbol.trim().length > 0 &&
    supply.trim().length > 0 &&
    antiWhalePercentage.trim().length > 0

  const chainId: string | number = chain ? chain.id : 250

  const { data: deployFee, error: readError } = useContractRead({
    address: safeLaunchFactory[chainId] as `0x${string}`,
    abi: TokenFactoryABI,
    functionName: "creationFee",
    enabled: isConnected, // Only fetch if connected
    onError: (error) => {
      console.error("Error fetching creation fee:", error)
    },
    onSuccess: (data) => {
      console.log("Creation fee fetched:", data)
      setCreationFee(data.toString())
    },
  })

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
    isLoading: isLoadingPrepare,
  } = usePrepareContractWrite({
    address: safeLaunchFactory[chainId] as `0x${string}`,
    abi: TokenFactoryABI,
    functionName: "deploySafeMeme",
    args: [
      dName,
      dSymbol,
      dDecimals ? BigInt(Number(dDecimals)) : BigInt(18),
      BigInt(dSupply) * BigInt(10 ** (dDecimals ? Number(dDecimals) : 18)),
      BigInt(Math.floor(Number(dAntiWhalePercentage) * 100)),
    ],
    value: deployFee,
    enabled: isConnected && isFormFilled(), //  && Boolean(deployFee)
    cacheTime: 0,
    onError: (error) => {
      console.error("Error preparing contract write:", error)
      setModalMessage("Error preparing contract write: " + error.message)
      setShowModal(true)
    },
  })

  const {
    data,
    isLoading: isLoadingWrite,
    isSuccess: isSuccessWrite,
    write,
    error,
    isError,
  } = useContractWrite(config)

  const handleDeployClick = async () => {
    if (!isArweaveConnected || !isProfileVerified) {
      alert(
        "Please connect your Arweave wallet and ensure your profile is verified before minting."
      )
      return
    }

    if (!isMintingWalletVerified()) {
      alert("The connected wallet is not verified in your Arweave profile.")
      return
    }

    if (!safeLaunchFactory[chainId] || !exchangeFactory[chainId]) {
      toast.error("Configuration error: Missing factory address.")
      return
    }

    try {
      if (write) {
        const tx = await write()
        const receipt = await tx.wait()
        const tokenAddress = receipt?.events?.[0]?.args?.token
        console.log("Token deployed at address:", tokenAddress)

        if (tokenAddress) {
          const provider = new ethers.providers.Web3Provider(window.ethereum)
          const signer = provider.getSigner()
          const tokenContract = new ethers.Contract(
            tokenAddress,
            SafeMemeABI,
            signer
          )

          const fetchedExchangeFactory = await tokenContract.exchangeFactory()
          const fetchedTokenFactory = await tokenContract.tokenFactory()
          console.log(
            "ExchangeFactory address in token:",
            fetchedExchangeFactory
          )
          console.log("TokenFactory address in token:", fetchedTokenFactory)

          if (
            fetchedExchangeFactory === exchangeFactory[chainId] &&
            fetchedTokenFactory === safeLaunchFactory[chainId]
          ) {
            toast.success("Token setup completed successfully!")
          } else {
            toast.error(
              "Token setup error: Incorrect exchangeFactory or tokenFactory address."
            )
          }
        }
      }
    } catch (error) {
      console.error("Error during deployment:", error)
    }
  }

  const toggleErrorMenuOpen = () => {
    setErrorMenu(!errorMenu)
  }

  const {
    data: useWaitData,
    isLoading: isLoadingTransaction,
    isSuccess: isSuccessTransaction,
  } = useWaitForTransaction({
    hash: data?.hash,
    onSettled(data, error) {
      if (data) {
        const tokenAddress = data.contractAddress
        setModalMessage(
          "Token successfully deployed! Go to the Dashboard to check it out! Then grab the contract address and import it into your wallet."
        )
      } else if (error) {
        setModalMessage(
          "There was an error deploying your token. Please try again."
        )
      }
    },
  })

  return (
    <>
      <div className="arweave-connection-section">
        {!isArweaveConnected ? (
          <button
            onClick={handleConnectArweave}
            className="connect-arweave-button"
          >
            Connect Arweave Wallet
          </button>
        ) : isProfileVerified ? (
          <p className="profile-status success">Arweave Profile Verified</p>
        ) : (
          <p className="profile-status error">
            No Arweave Profile Found. Please create one.
          </p>
        )}
      </div>

      {isArweaveConnected && isProfileVerified && <Navbar />}
      <Modal
        show={showModal}
        message={modalMessage}
        onClose={() => setShowModal(false)}
      />
      <div className="flex min-h-screen flex-col">
        <div>
          <div className="tokenTypeButtonsContainer">
            <div className="tokenTypeButtonContainer">
              <div className="tokenTypeButtonPopup">
                Create a standard ERC-20 token using Vyper smart contract
                language.
              </div>
            </div>
          </div>

          <div className="tokenDeployer">
            <h1 className="title">Create Your Token</h1>
            <p className="subtitle">
              Easily create and deploy your custom token
            </p>
            <div className="form">
              <div className="inputGroup">
                <label className="inputTitle">Token Name*</label>
                <input
                  onChange={setTokenName}
                  className="tokenInput"
                  placeholder="Degen"
                  value={name}
                />
              </div>
              <div className="inputGroup">
                <label className="inputTitle">Token Symbol*</label>
                <input
                  onChange={setTokenSymbol}
                  className="tokenInput"
                  placeholder="Degen"
                  value={symbol}
                />
              </div>
              <div className="inputGroup">
                <label className="inputTitle">Token Supply*</label>
                <input
                  onKeyDown={(evt) =>
                    ["e", "E", "+", "-", "."].includes(evt.key) &&
                    evt.preventDefault()
                  }
                  onChange={setTokenSupply}
                  className="tokenInput"
                  placeholder="21000000"
                  type="number"
                  value={supply}
                />
              </div>
              <div className="inputGroup hidethisButton">
                <label className="inputTitle">Decimals</label>
                <input
                  onKeyDown={(evt) =>
                    ["e", "E", "+", "-"].includes(evt.key) &&
                    evt.preventDefault()
                  }
                  onChange={setTokenDecimals}
                  className="tokenInput"
                  placeholder="18"
                  type="number"
                  value={decimals}
                />
                {!(Number(decimals) >= 0 && Number(decimals) <= 18) && (
                  <p className="error">Decimals must be from 0 to 18</p>
                )}
              </div>
              <div className="inputGroup">
                <label className="inputTitle">Anti-Whale Percentage*</label>
                <input
                  onKeyDown={(evt) =>
                    ["e", "E", "+", "-"].includes(evt.key) &&
                    evt.preventDefault()
                  }
                  onChange={setAntiWhalePercentageInput}
                  className="tokenInput"
                  placeholder="3"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="3"
                  value={antiWhalePercentage}
                />
                {!(
                  Number(antiWhalePercentage) > 0 &&
                  Number(antiWhalePercentage) <= 3
                ) && (
                  <p className="error">
                    Percentage must be greater than 0 and less than or equal to
                    3
                  </p>
                )}
              </div>
              <button
                onClick={handleDeployClick}
                className={`deployButton ${
                  isConnected &&
                  isArweaveConnected &&
                  isProfileVerified &&
                  isFormFilled() &&
                  Number(decimals) >= 0 &&
                  Number(decimals) <= 18 &&
                  Number(supply) > 0 &&
                  Number(antiWhalePercentage) > 0 &&
                  Number(antiWhalePercentage) <= 3 &&
                  !(isLoadingTransaction || isLoadingWrite)
                    ? "enabled"
                    : "disabled"
                }`}
                disabled={
                  !(
                    isConnected &&
                    isArweaveConnected &&
                    isProfileVerified &&
                    isFormFilled() &&
                    Number(decimals) >= 0 &&
                    Number(decimals) <= 18 &&
                    Number(supply) > 0 &&
                    Number(antiWhalePercentage) > 0 &&
                    Number(antiWhalePercentage) <= 3 &&
                    !(isLoadingTransaction || isLoadingWrite)
                  )
                }
              >
                {isClient
                  ? isConnected
                    ? isLoadingTransaction || isLoadingWrite
                      ? "Minting..."
                      : `Deploy (${
                          deployFee && Number(deployFee) * 10 ** -18
                        } ${chain ? chain.nativeCurrency.symbol : "Fantom"})`
                    : "Not Connected"
                  : "Loading..."}
              </button>

              <p className="inputDescription">(*) is a required field</p>
              {transactionHash &&
                toast.success(
                  "Token successfully deployed! Go to My Tokens right behind this to check it out! Then grab the contract address and import it into your wallet.",
                  {
                    toastId: transactionHash,
                    position: "top-right",
                  }
                ) &&
                ""}
              {transactionHash && (
                <Link href="/mytokens">
                  <button className="myTokensButton">My Tokens</button>
                </Link>
              )}
              {isClient && isConnected && (
                <div className="errorSection">
                  {isPrepareError ? (
                    <div
                      onClick={toggleErrorMenuOpen}
                      className="errorCollapsed"
                    >
                      <p className="errorHeader">❌ Contract Execution Error</p>
                      <Image
                        src="/assets/icons/dropdown.svg"
                        alt="dropdown"
                        width={25}
                        height={25}
                        className="errorDropdown"
                      />
                    </div>
                  ) : (
                    <div className="errorCollapsed">
                      {!isLoadingPrepare ? (
                        <p className="errorHeader">✅ All Clear</p>
                      ) : (
                        <p className="errorHeader">⏳ Loading</p>
                      )}
                    </div>
                  )}
                  {errorMenu &&
                    isPrepareError &&
                    (!isLoadingPrepare ? (
                      <p className="errorText">
                        {prepareError?.cause
                          ? capitalizeFirstLetter(prepareError?.details + ".")
                          : prepareError?.message.includes(
                              "v1: Invalid Decimals"
                            )
                          ? "v1: Invalid Decimals"
                          : capitalizeFirstLetter(prepareError?.message + ".")}
                      </p>
                    ) : (
                      <p className="errorText">Loading...</p>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
