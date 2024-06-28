"use client"

import { ChangeEvent, useEffect, useState } from "react"
import Link from "next/link"
import { ethers } from "ethers"
import { toast } from "react-toastify"

import { Navbar } from "@/components/walletconnect/walletconnect"

import "./factory.css"
import "react-toastify/dist/ReactToastify.css"
import Image from "next/image"
import { SafeLaunchABI } from "@/ABIs/SafeLaunch/SafeLaunch"
import { TokenFactoryABI } from "@/ABIs/SafeLaunch/TokenFactory"
import { SafeLaunchAddress, tokenVyperDetails } from "@/Constants/config"
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

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (chain && chain.id) {
      const vyperAddress = tokenVyperDetails[chain.id] || ""
      console.log("Vyper Address:", vyperAddress)

      if (!vyperAddress) {
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
    address: tokenVyperDetails[chainId] as `0x${string}`,
    abi: TokenFactoryABI,
    functionName: "creationFee",
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
    address: tokenVyperDetails[chainId] as `0x${string}`,
    abi: TokenFactoryABI,
    functionName: "deployTokenAndLaunch",
    args: [
      dName,
      dSymbol,
      BigInt(dDecimals || "18"),
      BigInt(dSupply) * BigInt(10 ** Number(dDecimals || "18")),
      BigInt(dAntiWhalePercentage),
    ],
    value: BigInt(creationFee || "0"),
    enabled: Boolean(
      dName && dSymbol && dSupply && dAntiWhalePercentage && creationFee
    ),
  })

  useEffect(() => {
    if (prepareError) {
      console.error("Prepare Error:", prepareError)
      console.error("Error Message:", prepareError.message)
      if (prepareError.cause) {
        console.error("Error Cause:", prepareError.cause)
      }
    }
  }, [prepareError])

  useEffect(() => {
    console.log("Preparing contract write with args:", {
      name: dName,
      symbol: dSymbol,
      decimals: dDecimals,
      supply: dSupply,
      antiWhalePercentage: dAntiWhalePercentage,
      creationFee,
    })
  }, [dName, dSymbol, dDecimals, dSupply, dAntiWhalePercentage, creationFee])

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
    async onSettled(data, error) {
      if (data) {
        try {
          const provider = new ethers.providers.Web3Provider(
            (window as any).ethereum
          )
          const receipt = await provider.getTransactionReceipt(data.hash)
          const logs = receipt.logs

          const iface = new ethers.utils.Interface(TokenFactoryABI)
          const parsedLogs = logs
            .map((log) => {
              try {
                return iface.parseLog(log)
              } catch (e) {
                return null
              }
            })
            .filter((log) => log !== null)

          const newTokenAndLaunchLog = parsedLogs.find(
            (log) => log.name === "NewTokenAndLaunch"
          )

          if (newTokenAndLaunchLog) {
            const { safeMeme, safeLaunch } = newTokenAndLaunchLog.args
            await startSafeLaunch(safeMeme)
            setModalMessage(
              "Token successfully deployed! Exchange created! Go to the Dashboard to check it out! Then grab the contract address and import it into your wallet."
            )
          } else {
            setModalMessage(
              "Failed to retrieve token addresses. Please check the transaction logs."
            )
          }
        } catch (err) {
          console.error("Error parsing logs:", err)
          setModalMessage(
            "There was an error processing the transaction logs. Please try again."
          )
        }
      } else if (error) {
        setModalMessage(
          "There was an error deploying your token. Please try again."
        )
      }
    },
  })

  const startSafeLaunch = async (safeMemeToken: string) => {
    if (!isConnected || !chain) return

    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()
    const safeLaunchContract = new ethers.Contract(
      SafeLaunchAddress[chain.id],
      SafeLaunchABI,
      signer
    )

    try {
      const tx = await safeLaunchContract.startSafeLaunch(safeMemeToken)
      await tx.wait()
      toast.success("SafeLaunch successfully started!")
    } catch (error) {
      console.error("Error starting SafeLaunch:", error)
      toast.error("Failed to start SafeLaunch.")
    }
  }

  const handleDeployClick = () => {
    if (!tokenVyperDetails[chainId]) {
      toast.error("Configuration error: Missing Vyper factory address.")
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
              <button>Vyper ERC-20 Token</button>
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
                    Percentage must be greater than 0 and less than or equal to
                    3
                  </p>
                )}
              </div>
              <button
                onClick={handleDeployClick}
                className={`deployButton ${
                  isConnected &&
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
