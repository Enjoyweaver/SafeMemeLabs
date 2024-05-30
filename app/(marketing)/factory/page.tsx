"use client"

import { ChangeEvent, useEffect, useState } from "react"
import Link from "next/link"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import { toast } from "react-toastify"

import { Navbar } from "@/components/walletconnect/walletconnect"

import styles from "./page.module.css"
import "react-toastify/dist/ReactToastify.css"
import Image from "next/image"
import { tokenDeployerDetails } from "@/Constants/config"
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

// Import the factory config
import { capitalizeFirstLetter } from "../../../utils/capitilizeFirstLetter"
import Modal from "./Modal"

export default function Factory(): JSX.Element {
  const [name, setName] = useState<string>("")
  const [symbol, setSymbol] = useState<string>("")
  const [supply, setSupply] = useState<string>("")
  const [decimals, setDecimals] = useState<string>("")
  const [antiWhalePercentage, setAntiWhalePercentage] = useState<string>("")
  const dName = useDebounce(name, 500)
  const dSymbol = useDebounce(symbol, 500)
  const dSupply = useDebounce(supply, 500)
  const dDecimals = useDebounce(decimals, 500)
  const dAntiWhalePercentage = useDebounce(antiWhalePercentage, 500)

  const [isClient, setIsClient] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState("")

  useEffect(() => {
    setIsClient(true)
  }, [])

  const [errorMenu, setErrorMenu] = useState(false)

  const { isConnected } = useAccount()

  const setTokenName = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const setTokenSymbol = (e: ChangeEvent<HTMLInputElement>) => {
    setSymbol(e.target.value)
  }

  const setTokenSupply = (e: ChangeEvent<HTMLInputElement>) => {
    setSupply(e.target.value)
  }

  const setTokenDecimals = (e: ChangeEvent<HTMLInputElement>) => {
    setDecimals(e.target.value)
  }

  const setAntiWhalePercentageInput = (e: ChangeEvent<HTMLInputElement>) => {
    setAntiWhalePercentage(e.target.value)
  }

  const isFormFilled = (): boolean => {
    return (
      name.trim().length > 0 &&
      symbol.trim().length > 0 &&
      supply.trim().length > 0 &&
      antiWhalePercentage.trim().length > 0 &&
      decimals.trim().length > 0
    )
  }

  const { chain } = useNetwork()

  const chainId: string | number = chain ? chain.id : 250

  const { data: deployFee } = useContractRead({
    address: tokenDeployerDetails[chainId] as `0x${string}`,
    abi: tokenDeployerABI,
    functionName: "creationFee",
  })

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
    isLoading: isLoadingPrepare,
  }: {
    config: any
    error: any
    isError: any
    isLoading: any
  } = usePrepareContractWrite({
    address: chainId
      ? tokenDeployerDetails[chainId]
        ? (tokenDeployerDetails[chainId] as `0x${string}`)
        : undefined
      : undefined,
    abi: tokenDeployerABI,
    functionName: "deployToken",
    args: [
      dSymbol,
      dName,
      dDecimals ? Number(dDecimals) : 18,
      BigInt(dSupply),
      Number(dAntiWhalePercentage),
    ],
    value: deployFee,
    cacheTime: 0,
  })

  const {
    data,
    isLoading: isLoadingWrite,
    isSuccess: isSuccessWrite,
    write,
    error,
    isError,
  }: {
    data: any
    isLoading: any
    isSuccess: any
    write: any
    error: any
    isError: any
  } = useContractWrite(config)

  const {
    data: useWaitData,
    isLoading: isLoadingTransaction,
    isSuccess: isSuccessTransaction,
    error: error_,
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
      <Modal
        show={showModal}
        message={modalMessage}
        onClose={() => setShowModal(false)}
      />
      <div>
        {isClient && chainId && !tokenDeployerDetails[chainId] && (
          <ChangeNetwork
            changeNetworkToChainId={250}
            dappName={"SafeMeme Labs"}
            networks={"Avalanche, Base, Degen, Fantom, Rootstock"}
          />
        )}
        <Navbar />
        <div className={styles.tokenDeployer}>
          <p className={styles.title}>Create a token</p>
          <p className={styles.inputDescription}>By SafeMeme Labs</p>
          <div className={styles.inputGroup}>
            <p className={styles.inputTitle}>Token Name*</p>
            <input
              onChange={setTokenName}
              className={`${styles.tokenInput}`}
              placeholder="Degen"
              value={name}
            />
          </div>
          <div className={styles.inputGroup}>
            <p className={styles.inputTitle}>Token Symbol*</p>
            <input
              onChange={setTokenSymbol}
              className={`${styles.tokenInput}`}
              placeholder="degen"
              value={symbol}
            />
          </div>
          <div className={styles.inputGroup}>
            <p className={styles.inputTitle}>Token Supply*</p>
            <input
              onKeyDown={(evt) =>
                ["e", "E", "+", "-", "."].includes(evt.key) &&
                evt.preventDefault()
              }
              onChange={setTokenSupply}
              className={`${styles.tokenInput}`}
              placeholder="21000000"
              type="number"
              value={supply}
            />
          </div>
          <div className={styles.inputGroup}>
            <p className={styles.inputTitle}>Decimals</p>
            <input
              onKeyDown={(evt) =>
                ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()
              }
              onChange={setTokenDecimals}
              className={`${styles.tokenInput}`}
              placeholder="18"
              type="number"
              value={decimals}
            />
            {!(Number(decimals) >= 0 && Number(decimals) <= 18) && (
              <p className={styles.error}>Decimals must be from 0 to 18</p>
            )}
          </div>
          <div className={styles.inputGroup}>
            <p className={styles.inputTitle}>Anti-Whale Percentage*</p>
            <input
              onKeyDown={(evt) =>
                ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()
              }
              onChange={setAntiWhalePercentageInput}
              className={`${styles.tokenInput}`}
              placeholder="3"
              type="number"
              value={antiWhalePercentage}
            />
            {!(
              Number(antiWhalePercentage) > 0 &&
              Number(antiWhalePercentage) <= 3
            ) && (
              <p className={styles.error}>
                Percentage must be greater than 0 and less than or equal to 3
              </p>
            )}
          </div>
          <button
            onClick={handleDeployClick} // Use handleDeployClick instead of directly calling write
            className={`${styles.deployButton} ${
              !isPrepareError &&
              isConnected &&
              isFormFilled() &&
              Number(decimals) >= 0 &&
              Number(decimals) <= 18 &&
              Number(supply) >= 0 &&
              Number(antiWhalePercentage) > 0 &&
              Number(antiWhalePercentage) <= 3 &&
              !(isLoadingTransaction || isLoadingWrite)
                ? styles.enabled
                : styles.disabled
            }`}
            disabled={
              !isPrepareError &&
              isConnected &&
              isFormFilled() &&
              Number(decimals) >= 0 &&
              Number(decimals) <= 18 &&
              Number(supply) >= 0 &&
              Number(antiWhalePercentage) > 0 &&
              Number(antiWhalePercentage) <= 3 &&
              !(isLoadingTransaction || isLoadingWrite)
                ? false
                : true
            }
          >
            {isClient
              ? isConnected
                ? isLoadingTransaction || isLoadingWrite
                  ? "Minting..."
                  : "Deploy (" +
                    String(deployFee && Number(deployFee) * 10 ** -18) +
                    " " +
                    String(chain ? chain.nativeCurrency.symbol : "Fantom") +
                    ")"
                : "Not Connected"
              : "Loading..."}
          </button>
          <p className={styles.inputDescription}>(*) is a required field</p>
          {isSuccessTransaction &&
            toast.success(
              "Token successfully deployed! Go to the Dashboard to check it out! Then grab the contract address and import it into your wallet.",
              {
                toastId: String(useWaitData),
                position: "top-center",
              }
            ) &&
            ""}
          {isSuccessTransaction && (
            <Link href="/mytokens">
              <button className={styles.myTokensButton}>My Tokens</button>
            </Link>
          )}
          {isClient && isConnected && (
            <div className={styles.errorSection}>
              {isPrepareError ? (
                <div
                  onClick={toggleErrorMenuOpen}
                  className={styles.errorCollapsed}
                >
                  <p className={styles.errorHeader}>
                    ❌ Contract Execution Error
                  </p>
                  <Image
                    src="/assets/icons/dropdown.svg"
                    alt="dropdown"
                    width={25}
                    height={25}
                    className={styles.errorDropdown}
                  />
                </div>
              ) : (
                <div className={styles.errorCollapsed}>
                  {!isLoadingPrepare ? (
                    <p className={styles.errorHeader}>✅ All Clear</p>
                  ) : (
                    <p className={styles.errorHeader}>⏳ Loading</p>
                  )}
                </div>
              )}
              {errorMenu &&
                isPrepareError &&
                (!isLoadingPrepare ? (
                  <p className={styles.errorText}>
                    {prepareError?.details
                      ? capitalizeFirstLetter(prepareError?.details + ".")
                      : prepareError?.message.includes("v1: Invalid Decimals")
                      ? "v1: Invalid Decimals"
                      : capitalizeFirstLetter(prepareError?.message + ".")}
                  </p>
                ) : (
                  <p className={styles.errorText}>Loading...</p>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
