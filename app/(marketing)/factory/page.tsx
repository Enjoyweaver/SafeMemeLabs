"use client"

import { ChangeEvent, useEffect, useState } from "react"
import Link from "next/link"
import { ClaimABI } from "@/ABIs/ClaimABI"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import { tokenLauncherABI } from "@/ABIs/tokenLauncher"
import { toast } from "react-toastify"

import { Navbar } from "@/components/walletconnect/walletconnect"

import "./factory.css"
import "react-toastify/dist/ReactToastify.css"
import Image from "next/image"
import {
  tokenBOptions,
  tokenClaimDetails,
  tokenDeployerDetails,
  tokenLauncherDetails,
} from "@/Constants/config"
import { useDebounce } from "usehooks-ts"
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi"

import { ChangeNetwork } from "@/components/changeNetwork/changeNetwork"

import { capitalizeFirstLetter } from "../../../utils/capitilizeFirstLetter"
import Modal from "./Modal"

export default function Factory(): JSX.Element {
  const [tokenType, setTokenType] = useState<string>("safeMemeToken")
  const [name, setName] = useState<string>("")
  const [symbol, setSymbol] = useState<string>("")
  const [supply, setSupply] = useState<string>("")
  const [decimals, setDecimals] = useState<string>("")
  const [antiWhalePercentage, setAntiWhalePercentage] = useState<string>("")
  const [selectedTokenB, setSelectedTokenB] = useState<string>("")
  const [tokenLauncher, setTokenLauncher] = useState<string>("")
  const [contractURI, setContractURI] = useState<string>("")
  const [trustedForwarders, setTrustedForwarders] = useState<string>("")
  const [saleRecipient, setSaleRecipient] = useState<string>("")
  const [platformFeeRecipient, setPlatformFeeRecipient] = useState<string>("")
  const [platformFeeBps, setPlatformFeeBps] = useState<string>("")
  const [maxTotalSupply, setMaxTotalSupply] = useState<string>("")

  const dName = useDebounce(name, 500)
  const dSymbol = useDebounce(symbol, 500)
  const dSupply = useDebounce(supply, 500)
  const dDecimals = useDebounce(decimals, 500)
  const dAntiWhalePercentage = useDebounce(antiWhalePercentage, 500)
  const dSelectedTokenB = useDebounce(selectedTokenB, 500)
  const dTokenLauncher = useDebounce(tokenLauncher, 500)
  const dContractURI = useDebounce(contractURI, 500)
  const dTrustedForwarders = useDebounce(trustedForwarders, 500)
  const dSaleRecipient = useDebounce(saleRecipient, 500)
  const dPlatformFeeRecipient = useDebounce(platformFeeRecipient, 500)
  const dPlatformFeeBps = useDebounce(platformFeeBps, 500)
  const dMaxTotalSupply = useDebounce(maxTotalSupply, 500)

  const [isClient, setIsClient] = useState(false)
  const [errorMenu, setErrorMenu] = useState(false)
  const { isConnected } = useAccount()
  const { chain } = useNetwork()

  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState("")

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (chain && chain.id) {
      const launcherAddress = tokenLauncherDetails[chain.id] || ""
      const deployerAddress = tokenDeployerDetails[chain.id] || ""
      const claimAddress = tokenClaimDetails[chain.id] || ""

      console.log("Chain ID:", chain.id)
      console.log("Launcher Address:", launcherAddress)
      console.log("Deployer Address:", deployerAddress)
      console.log("Claim Address:", claimAddress)

      if (!launcherAddress) {
        console.error(`Missing launcher address for chain ID ${chain.id}`)
      }
      if (!deployerAddress) {
        console.error(`Missing deployer address for chain ID ${chain.id}`)
      }
      if (!claimAddress) {
        console.error(`Missing claim address for chain ID ${chain.id}`)
      }

      setTokenLauncher(launcherAddress)
      setSelectedTokenB(tokenBOptions[chain.id]?.[0]?.address || "")
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
  const setTokenBAddress = (e: ChangeEvent<HTMLSelectElement>) =>
    setSelectedTokenB(e.target.value)
  const setContractURIInput = (e: ChangeEvent<HTMLInputElement>) =>
    setContractURI(e.target.value)
  const setTrustedForwardersInput = (e: ChangeEvent<HTMLInputElement>) =>
    setTrustedForwarders(e.target.value)
  const setSaleRecipientInput = (e: ChangeEvent<HTMLInputElement>) =>
    setSaleRecipient(e.target.value)
  const setPlatformFeeRecipientInput = (e: ChangeEvent<HTMLInputElement>) =>
    setPlatformFeeRecipient(e.target.value)
  const setPlatformFeeBpsInput = (e: ChangeEvent<HTMLInputElement>) =>
    setPlatformFeeBps(e.target.value)
  const setMaxTotalSupplyInput = (e: ChangeEvent<HTMLInputElement>) =>
    setMaxTotalSupply(e.target.value)

  const isFormFilled = (): boolean =>
    name.trim().length > 0 &&
    symbol.trim().length > 0 &&
    (tokenType === "safeMemeToken" ||
      (tokenType === "safeMemeTokenLaunched" &&
        selectedTokenB.trim().length > 0) ||
      (tokenType === "safeMemeClaim" &&
        contractURI.trim().length > 0 &&
        saleRecipient.trim().length > 0 &&
        platformFeeRecipient.trim().length > 0 &&
        platformFeeBps.trim().length > 0 &&
        maxTotalSupply.trim().length > 0))

  const chainId: string | number = chain ? chain.id : 250

  const { data: deployFee, error: readError } = useContractRead({
    address:
      tokenType === "safeMemeTokenLaunched"
        ? (tokenLauncherDetails[chainId] as `0x${string}`)
        : tokenType === "safeMemeClaim"
        ? (tokenClaimDetails[chainId] as `0x${string}`)
        : (tokenDeployerDetails[chainId] as `0x${string}`),
    abi:
      tokenType === "safeMemeTokenLaunched"
        ? tokenLauncherABI
        : tokenType === "safeMemeClaim"
        ? ClaimABI
        : tokenDeployerABI,
    functionName: "creationFee",
    onError: (error) => {
      console.error("Error fetching creation fee:", error)
    },
    onSuccess: (data) => {
      console.log("Creation fee fetched:", data)
    },
  })

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
    isLoading: isLoadingPrepare,
  } = usePrepareContractWrite({
    address:
      tokenType === "safeMemeTokenLaunched"
        ? (tokenLauncherDetails[chainId] as `0x${string}`)
        : tokenType === "safeMemeClaim"
        ? (tokenClaimDetails[chainId] as `0x${string}`)
        : (tokenDeployerDetails[chainId] as `0x${string}`),
    abi:
      tokenType === "safeMemeTokenLaunched"
        ? tokenLauncherABI
        : tokenType === "safeMemeClaim"
        ? ClaimABI
        : tokenDeployerABI,
    functionName: "deployToken",
    args:
      tokenType === "safeMemeTokenLaunched"
        ? [
            dSymbol,
            dName,
            dDecimals ? Number(dDecimals) : 18,
            BigInt(dSupply),
            Number(dAntiWhalePercentage),
            dSelectedTokenB, // Include TokenB address
          ]
        : tokenType === "safeMemeClaim"
        ? [
            dName,
            dSymbol,
            dContractURI,
            dTrustedForwarders.split(",").map((addr) => addr.trim()), // Ensure addresses are trimmed and split correctly
            dSaleRecipient,
            dPlatformFeeRecipient,
            BigInt(dPlatformFeeBps), // Ensure this is BigInt if needed
            BigInt(dMaxTotalSupply),
          ]
        : [
            dSymbol,
            dName,
            dDecimals ? Number(dDecimals) : 18,
            BigInt(dSupply),
            Number(dAntiWhalePercentage),
          ],
    value: deployFee,
    cacheTime: 0,
  })

  useEffect(() => {
    if (prepareError) {
      console.error("Error preparing contract write:", prepareError)
    }
    console.log("Config prepared:", config)
  }, [prepareError, config])

  useEffect(() => {
    if (prepareError) {
      console.error("Error preparing contract write:", prepareError)
    }
    console.log("Config prepared:", config)
  }, [prepareError, config])

  const {
    data,
    isLoading: isLoadingWrite,
    isSuccess: isSuccessWrite,
    write,
    error,
    isError,
  } = useContractWrite(config)

  useEffect(() => {
    if (error) {
      console.error("Error writing contract:", error)
    }
  }, [error])

  const {
    data: useWaitData,
    isLoading: isLoadingTransaction,
    isSuccess: isSuccessTransaction,
  } = useWaitForTransaction({
    hash: data?.hash,
    onSettled(data, error) {
      if (data) {
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

  const handleDeployClick = () => {
    if (
      tokenType === "safeMemeTokenLaunched" &&
      (!tokenLauncher || !selectedTokenB)
    ) {
      toast.error("Configuration error: Missing required addresses.")
      return
    }
    if (tokenType === "safeMemeClaim" && !tokenClaimDetails[chainId]) {
      toast.error("Configuration error: Missing claim address.")
      return
    }
    setModalMessage(
      "Depending on which blockchain you created a token on, it could take anywhere from 2 seconds to 20 seconds."
    )
    setShowModal(true)
    write?.()
  }

  const toggleErrorMenuOpen = () => {
    setErrorMenu(!errorMenu)
  }

  return (
    <>
      <Navbar />
      <Modal
        show={showModal}
        message={modalMessage}
        onClose={() => setShowModal(false)}
      />
      <div className="flex min-h-screen flex-col">
        {isClient && chainId && !tokenDeployerDetails[chainId] && (
          <ChangeNetwork
            changeNetworkToChainId={250}
            dappName={"SafeMeme Labs"}
            networks={"Avalanche, Base, Degen, Fantom, Rootstock"}
          />
        )}
        <div>
          <div className="tokenTypeButtonsContainer">
            <div className="tokenTypeButtonContainer">
              <button
                className={`tokenTypeButton ${
                  tokenType === "safeMemeToken" ? "active" : ""
                } hideButton`}
                onClick={() => setTokenType("safeMemeToken")}
              >
                SafeMeme Deployed
              </button>
              <div className="tokenTypeButtonPopup">
                Deploy a SafeMeme token and 100% of the supply will be sent to
                your wallet for you to choose where to launch it for people to
                purchase.
              </div>
            </div>
            <div className="tokenTypeButtonContainer">
              <button
                className={`tokenTypeButton ${
                  tokenType === "safeMemeTokenLaunched" ? "active" : ""
                } hideButton`}
                onClick={() => setTokenType("safeMemeTokenLaunched")}
              >
                SafeMeme Launched
              </button>
              <div className="tokenTypeButtonPopup">
                Create and launch a SafeMeme token on our swap where 5% of the
                supply is available to trade while the remaining 95% is unlocked
                at different liquidity levels.
              </div>
            </div>
            <div className="tokenTypeButtonContainer">
              <button
                className={`tokenTypeButton ${
                  tokenType === "safeMemeClaim" ? "active" : ""
                } hideButton`}
                onClick={() => setTokenType("safeMemeClaim")}
              >
                SafeMeme Claim
              </button>
              <div className="tokenTypeButtonPopup">
                Create a SafeMeme Claim token with specific conditions.
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
              {tokenType !== "safeMemeClaim" && (
                <>
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
                  <div className="inputGroup">
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
                        ["e", "E", "+", "-", "."].includes(evt.key) &&
                        evt.preventDefault()
                      }
                      onChange={setAntiWhalePercentageInput}
                      className="tokenInput"
                      placeholder="3"
                      type="number"
                      value={antiWhalePercentage}
                    />
                    {!(
                      Number(antiWhalePercentage) > 0 &&
                      Number(antiWhalePercentage) <= 3
                    ) && (
                      <p className="error">
                        Percentage must be greater than 0 and less than or equal
                        to 3
                      </p>
                    )}
                  </div>
                  {isClient && tokenType === "safeMemeTokenLaunched" && (
                    <div className="inputGroup">
                      <label className="inputTitle">Token B Address*</label>
                      <select
                        onChange={setTokenBAddress}
                        className="tokenInput"
                        value={selectedTokenB}
                      >
                        <option value="">Select Token B</option>
                        {tokenBOptions[chainId]?.map((token) => (
                          <option key={token.address} value={token.address}>
                            {token.symbol}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
              {tokenType === "safeMemeClaim" && (
                <>
                  <div className="inputGroup">
                    <label className="inputTitle">Contract URI*</label>
                    <input
                      onChange={setContractURIInput}
                      className="tokenInput"
                      placeholder="https://example.com/contract"
                      value={contractURI}
                    />
                  </div>
                  <div className="inputGroup">
                    <label className="inputTitle">Trusted Forwarders*</label>
                    <input
                      onChange={setTrustedForwardersInput}
                      className="tokenInput"
                      placeholder="0xabc...,0xdef..."
                      value={trustedForwarders}
                    />
                  </div>
                  <div className="inputGroup">
                    <label className="inputTitle">Sale Recipient*</label>
                    <input
                      onChange={setSaleRecipientInput}
                      className="tokenInput"
                      placeholder="0xabc..."
                      value={saleRecipient}
                    />
                  </div>
                  <div className="inputGroup">
                    <label className="inputTitle">
                      Platform Fee Recipient*
                    </label>
                    <input
                      onChange={setPlatformFeeRecipientInput}
                      className="tokenInput"
                      placeholder="0xabc..."
                      value={platformFeeRecipient}
                    />
                  </div>
                  <div className="inputGroup">
                    <label className="inputTitle">Platform Fee BPS*</label>
                    <input
                      onKeyDown={(evt) =>
                        ["e", "E", "+", "-", "."].includes(evt.key) &&
                        evt.preventDefault()
                      }
                      onChange={setPlatformFeeBpsInput}
                      className="tokenInput"
                      placeholder="500"
                      type="number"
                      value={platformFeeBps}
                    />
                  </div>
                  <div className="inputGroup">
                    <label className="inputTitle">Max Total Supply*</label>
                    <input
                      onKeyDown={(evt) =>
                        ["e", "E", "+", "-", "."].includes(evt.key) &&
                        evt.preventDefault()
                      }
                      onChange={setMaxTotalSupplyInput}
                      className="tokenInput"
                      placeholder="1000000"
                      type="number"
                      value={maxTotalSupply}
                    />
                  </div>
                </>
              )}
              <button
                onClick={handleDeployClick}
                className={`deployButton ${
                  isConnected &&
                  isFormFilled() &&
                  (tokenType !== "safeMemeClaim" ||
                    (Number(platformFeeBps) >= 0 &&
                      Number(maxTotalSupply) > 0)) &&
                  !(isLoadingTransaction || isLoadingWrite)
                    ? "enabled"
                    : "disabled"
                }`}
                disabled={
                  !(
                    isConnected &&
                    isFormFilled() &&
                    (tokenType !== "safeMemeClaim" ||
                      (Number(platformFeeBps) >= 0 &&
                        Number(maxTotalSupply) > 0)) &&
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
              {isSuccessTransaction &&
                toast.success(
                  "Token successfully deployed! Go to My Tokens right behind this to check it out! Then grab the contract address and import it into your wallet.",
                  {
                    toastId: String(useWaitData),
                    position: "top-right",
                  }
                ) &&
                ""}
              {isSuccessTransaction && (
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
