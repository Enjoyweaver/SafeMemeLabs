"use client"

import { ChangeEvent, useEffect, useState } from "react"
import { toast } from "react-toastify"

import { Navbar } from "@/components/walletconnect/walletconnect"

import "./factory.css"
import "react-toastify/dist/ReactToastify.css"
import { ClaimABI } from "@/ABIs/ClaimABI"
import { tokenClaimDetails } from "@/Constants/config"
import { useDebounce } from "usehooks-ts"
import {
  useAccount,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi"

import { ChangeNetwork } from "@/components/changeNetwork/changeNetwork"

import { capitalizeFirstLetter } from "../../../utils/capitilizeFirstLetter"

export default function DeployPage() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const [form, setForm] = useState({
    name: "",
    symbol: "",
    contractURI: "",
    trustedForwarders: "",
    saleRecipient: address || "",
    platformFeeRecipient: address || "",
    platformFeeBps: 0,
  })

  useEffect(() => {
    if (address) {
      setForm((prevForm) => ({
        ...prevForm,
        saleRecipient: address,
        platformFeeRecipient: address,
      }))
    }
  }, [address])

  const claimFactoryAddress = chain?.id ? tokenClaimDetails[chain.id] : ""

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm({
      ...form,
      [name]: value,
    })
  }

  const { config } = usePrepareContractWrite({
    addressOrName: claimFactoryAddress,
    contractInterface: ClaimABI,
    functionName: "createClaim",
    args: [
      address,
      form.name,
      form.symbol,
      form.contractURI,
      form.trustedForwarders.split(","),
      form.saleRecipient,
      form.platformFeeRecipient,
      form.platformFeeBps,
    ],
    enabled: Boolean(
      address &&
        claimFactoryAddress &&
        form.name &&
        form.symbol &&
        form.contractURI &&
        form.trustedForwarders &&
        form.saleRecipient &&
        form.platformFeeRecipient &&
        form.platformFeeBps
    ),
    onError: (error) => {
      console.error("Contract write preparation error:", error)
      toast.error("Failed to prepare contract write. Please try again.")
    },
  })

  const { data, write } = useContractWrite(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onError: (error) => {
      console.error("Transaction error:", error)
      toast.error("Transaction failed. Please try again.")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) {
      toast.error("Please connect your wallet.")
      return
    }
    console.log("Form values:", form)
    console.log("Deploying contract with address:", address)
    write?.()
  }

  return (
    <div>
      <Navbar />
      <div>
        <div className="spacer"></div>
        <div className="tokenDeployer">
          <h1 className="title">Deploy Your Claim Token</h1>
          <p className="subtitle">
            Fill out the form below to deploy your own instance of the Claim
            token.
          </p>
          <form className="form" onSubmit={handleSubmit}>
            <div className="inputGroup">
              <label className="inputTitle">Token Name</label>
              <input
                type="text"
                name="name"
                className="tokenInput"
                value={form.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="inputGroup">
              <label className="inputTitle">Token Symbol</label>
              <input
                type="text"
                name="symbol"
                className="tokenInput"
                value={form.symbol}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="inputGroup">
              <label className="inputTitle">Contract URI</label>
              <input
                type="text"
                name="contractURI"
                className="tokenInput"
                value={form.contractURI}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="inputGroup">
              <label className="inputTitle">
                Trusted Forwarders (comma separated)
              </label>
              <input
                type="text"
                name="trustedForwarders"
                className="tokenInput"
                value={form.trustedForwarders}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="inputGroup">
              <label className="inputTitle">Sale Recipient Address</label>
              <input
                type="text"
                name="saleRecipient"
                className="tokenInput"
                value={form.saleRecipient}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="inputGroup">
              <label className="inputTitle">
                Platform Fee Recipient Address
              </label>
              <input
                type="text"
                name="platformFeeRecipient"
                className="tokenInput"
                value={form.platformFeeRecipient}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="inputGroup">
              <label className="inputTitle">Platform Fee (Basis Points)</label>
              <input
                type="number"
                name="platformFeeBps"
                className="tokenInput"
                value={form.platformFeeBps}
                onChange={handleInputChange}
                required
              />
            </div>
            <button
              type="submit"
              className={`deployButton ${isLoading ? "disabled" : ""}`}
              disabled={isLoading || !isConnected}
            >
              {isLoading ? "Deploying..." : "Deploy Token"}
            </button>
          </form>
          {isSuccess && (
            <p className="disclaimer">
              Token deployed successfully! Transaction Hash: {data?.hash}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
