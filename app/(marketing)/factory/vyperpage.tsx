"use client"

import { ChangeEvent, useEffect, useState } from "react"
import Link from "next/link"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import { tokenVyperABI } from "@/ABIs/vyper/tokenVyper"
import { ethers } from "ethers"
import { toast } from "react-toastify"

import { Navbar } from "@/components/walletconnect/walletconnect"

import "./factory.css"
import "react-toastify/dist/ReactToastify.css"
import Image from "next/image"
import { tokenBOptions, tokenVyperDetails } from "@/Constants/config"
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
  const [tokenType, setTokenType] = useState<string>("tokenVyper")
  const [name, setName] = useState<string>("")
  const [symbol, setSymbol] = useState<string>("")
  const [supply, setSupply] = useState<string>("")
  const [decimals, setDecimals] = useState<string>("")
  const [antiWhalePercentage, setAntiWhalePercentage] = useState<string>("")
  const [selectedTokenB, setSelectedTokenB] = useState<string>("")
  const [tokenLauncher, setTokenLauncher] = useState<string>("")
  const dName = useDebounce(name, 500)
  const dSymbol = useDebounce(symbol, 500)
  const dSupply = useDebounce(supply, 500)
  const dDecimals = useDebounce(decimals, 500)
  const dAntiWhalePercentage = useDebounce(antiWhalePercentage, 500)
  const dSelectedTokenB = useDebounce(selectedTokenB, 500)
  const dTokenLauncher = useDebounce(tokenLauncher, 500)
  const [creationFee, setCreationFee] = useState<string>("")
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
      const vyperAddress = tokenVyperDetails[chain.id] || ""

      console.log("Vyper Address:", vyperAddress)

      if (!vyperAddress && tokenType === "tokenVyper") {
        console.error(`Missing addresses for chain ID ${chain.id}`)
      }

      // Ensure selectedTokenB is set based on current chain (only for SafeMeme Launched type)
      setSelectedTokenB(tokenBOptions[chain.id]?.[0]?.address || "")
    }
  }, [chain, tokenType])

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

  const isFormFilled = (): boolean =>
    name.trim().length > 0 &&
    symbol.trim().length > 0 &&
    supply.trim().length > 0 &&
    Number(decimals) >= 0 &&
    Number(decimals) <= 18 &&
    Number(antiWhalePercentage) > 0 &&
    Number(antiWhalePercentage) <= 3

  const chainId: string | number = chain ? chain.id : 250

  const { data: deployFee, error: readError } = useContractRead({
    address: tokenVyperDetails[chainId] as `0x${string}`,
    abi: tokenVyperABI,
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
    address: tokenVyperDetails[chainId] as `0x${string}`,
    abi: tokenVyperABI,
    functionName: "createToken",
    args: [
      ethers.utils.formatBytes32String(dName),
      ethers.utils.formatBytes32String(dSymbol),
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
  }, [prepareError])

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
        const tokenAddress = data.contractAddress
        setModalMessage(
          "Token successfully deployed! Exchange created! Go to the Dashboard to check it out! Then grab the contract address and import it into your wallet."
        )
      } else if (error) {
        setModalMessage(
          "There was an error deploying your token. Please try again."
        )
      }
    },
  })

  const handleDeployClick = () => {
    if (!isConnected) {
      toast.error("Not Connected")
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
        {isClient && chainId && !tokenVyperDetails[chainId] && (
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
                  tokenType === "tokenVyper" ? "active" : ""
                } hideButton`}
                onClick={() => setTokenType("tokenVyper")}
              >
                Vyper ERC-20 Token
              </button>
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
                  onChange={setTokenSupply}
                  className="tokenInput"
                  placeholder="0"
                  type="number"
                  min="0"
                  value={supply}
                />
              </div>
              <div className="inputGroup">
                <label className="inputTitle">Decimals*</label>
                <input
                  onChange={setTokenDecimals}
                  className="tokenInput"
                  placeholder="18"
                  type="number"
                  min="0"
                  max="18"
                  value={decimals}
                />
              </div>
              <div className="inputGroup">
                <label className="inputTitle">Anti-Whale Percentage*</label>
                <input
                  onChange={setAntiWhalePercentageInput}
                  className="tokenInput"
                  placeholder="1.5"
                  type="number"
                  step="0.01"
                  min="0"
                  max="3"
                  value={antiWhalePercentage}
                />
              </div>
            </div>
            <div className="feeInfo">
              <p>
                <b>Creation Fee:</b> {deployFee} (based on current network
                prices)
              </p>
            </div>
            <div className="buttonContainer">
              <button
                className={`deployButton ${isFormFilled() ? "" : "disabled"}`}
                onClick={handleDeployClick}
                disabled={!isFormFilled() || isLoadingWrite || isLoadingPrepare}
              >
                Deploy Token
              </button>
            </div>
            {isLoadingWrite && (
              <div className="loadingContainer">
                <p>Deploying your token...</p>
              </div>
            )}
          </div>
          <div className="errorSection">
            {isPrepareError ? (
              <div onClick={toggleErrorMenuOpen} className="errorCollapsed">
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
                    : prepareError?.message.includes("v1: Invalid Decimals")
                    ? "v1: Invalid Decimals"
                    : capitalizeFirstLetter(prepareError?.message + ".")}
                </p>
              ) : (
                <p className="errorText">Loading...</p>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}
