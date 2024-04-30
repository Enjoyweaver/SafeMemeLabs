"use client"

import { ChangeEvent, useEffect, useState } from "react"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import { toast } from "react-toastify"

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

import { capitalizeFirstLetter } from "../../../utils/capitilizeFirstLetter"

export default function Factory(): JSX.Element {
  const [name, setName] = useState<string>("")
  const [symbol, setSymbol] = useState<string>("")
  const [supply, setSupply] = useState<string>("")
  const [decimals, setDecimals] = useState<string>("")
  const dName = useDebounce(name, 500)
  const dSymbol = useDebounce(symbol, 500)
  const dSupply = useDebounce(supply, 500)
  const dDecimals = useDebounce(decimals, 500)

  const [isClient, setIsClient] = useState(false)

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

  const isFormFilled = (): boolean => {
    return (
      name.trim().length > 0 &&
      symbol.trim().length > 0 &&
      supply.trim().length > 0
    )
  }

  const { chain } = useNetwork()

  const chainId: string | number = chain ? chain && chain.id : 250

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
    args: [dSymbol, dName, dDecimals ? Number(dDecimals) : 18, BigInt(dSupply)],
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
  })

  const toggleErrorMenuOpen = () => {
    setErrorMenu(!errorMenu)
  }

  return (
    <div>
      {isClient && chainId && !tokenDeployerDetails[chainId] && (
        <ChangeNetwork
          changeNetworkToChainId={250}
          dappName={"Generator"}
          networks={"Fantom, Fantom testnet, Polygon, and Degen"}
        />
      )}
      <div className={styles.tokenDeployer}>
        <p className={styles.title}>Token Generator</p>
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
        <button
          onClick={() => write?.()}
          className={`${styles.deployButton} ${
            !isPrepareError &&
            isConnected &&
            isFormFilled() &&
            Number(decimals) >= 0 &&
            Number(decimals) <= 18 &&
            Number(supply) >= 0 &&
            !(isLoadingTransaction || isLoadingWrite)
              ? ""
              : styles.disabled
          }`}
          disabled={
            !isPrepareError &&
            isConnected &&
            isFormFilled() &&
            Number(decimals) >= 0 &&
            Number(decimals) <= 18 &&
            Number(supply) >= 0 &&
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
                  String(
                    chain ? chain && chain.nativeCurrency.symbol : "Fantom"
                  ) +
                  ")"
              : "Not Connected"
            : "Loading..."}
        </button>
        <p className={styles.inputDescription}>(*) is a required field</p>
        {isSuccessTransaction &&
          toast.success(
            "Token successfully deployed! Go to My Tokens right behind this to check it out! Then grab the contract address and import it into your wallet.",
            {
              toastId: String(useWaitData),
              position: "top-right",
            }
          ) &&
          ""}
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
  )
}
