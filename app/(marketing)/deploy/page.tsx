"use client"

import React, { useEffect, useState } from "react"
import ClaimABI from "@/ABIs/ClaimABI"
import { tokenClaimDetails } from "@/Constants/config"
import { ethers } from "ethers"
import {
  useAccount,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi"

import { Navbar } from "@/components/walletconnect/walletconnect"

import "@/styles/claimmanager.css"

const ClaimComponent = () => {
  const { address, isConnected, connector } = useAccount()
  const { chain } = useNetwork()
  const [signer, setSigner] = useState<any>(null)

  // State variables for contract initialization
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [contractURI, setContractURI] = useState("")
  const [trustedForwarders, setTrustedForwarders] = useState("")
  const [saleRecipient, setSaleRecipient] = useState("")
  const [platformFeeRecipient, setPlatformFeeRecipient] = useState("")
  const [platformFeeBps, setPlatformFeeBps] = useState("")
  const [maxTotalSupply, setMaxTotalSupply] = useState("")

  // State variables for claim conditions
  const [claimConditions, setClaimConditions] = useState<any[]>([])
  const [quantity, setQuantity] = useState(0)
  const [merkleProof, setMerkleProof] = useState<any[]>([])
  const [conditionId, setConditionId] = useState(0)
  const [phaseName, setPhaseName] = useState("")
  const [startTimestamp, setStartTimestamp] = useState("")
  const [maxClaimableSupply, setMaxClaimableSupply] = useState("")
  const [pricePerToken, setPricePerToken] = useState("")
  const [currency, setCurrency] = useState("")
  const [quantityLimitPerWallet, setQuantityLimitPerWallet] = useState("")

  useEffect(() => {
    const getSigner = async () => {
      if (connector) {
        const provider = await connector.getProvider()
        const ethersProvider = new ethers.providers.Web3Provider(provider)
        const signer = ethersProvider.getSigner()
        setSigner(signer)
      }
    }
    getSigner()
  }, [connector])

  const claimDeployerAddress = chain ? tokenClaimDetails[chain.id] : ""

  const { config } = usePrepareContractWrite({
    address: claimDeployerAddress,
    abi: ClaimABI,
    functionName: "initialize",
    args: [
      address,
      name,
      symbol,
      contractURI,
      trustedForwarders ? trustedForwarders.split(",") : [],
      saleRecipient,
      platformFeeRecipient,
      parseInt(platformFeeBps),
    ],
    onError: (error) => {
      console.error("Error preparing contract write:", error)
    },
  })

  const { data, isLoading, isSuccess, write, error } = useContractWrite(config)

  const { isLoading: isTxLoading, isSuccess: isTxSuccess } =
    useWaitForTransaction({
      hash: data?.hash,
      onError: (error) => {
        console.error("Error during transaction:", error)
      },
      onSuccess: (data) => {
        console.log("Transaction successful:", data)
      },
    })

  const createToken = () => {
    if (
      !name ||
      !symbol ||
      !contractURI ||
      !saleRecipient ||
      !platformFeeRecipient ||
      !platformFeeBps
    ) {
      console.error(
        "All fields except Trusted Forwarders are required for creating the token."
      )
      return
    }
    write?.()
  }

  const setConditions = async () => {
    try {
      if (claimContract) {
        const tx = await claimContract.setClaimConditions(claimConditions, true)
        await tx.wait()
        console.log("Claim conditions set")
      }
    } catch (error) {
      console.error("Error setting claim conditions:", error)
    }
  }

  const claimTokens = async () => {
    try {
      if (claimContract) {
        const tx = await claimContract.claimTokens(
          conditionId,
          quantity,
          merkleProof,
          {
            value: ethers.utils.parseEther("0.01"), // Adjust the value as needed
          }
        )
        await tx.wait()
        console.log("Tokens claimed")
      }
    } catch (error) {
      console.error("Error claiming tokens:", error)
    }
  }

  const addClaimCondition = () => {
    const newCondition = {
      startTimestamp: new Date(startTimestamp).getTime() / 1000,
      maxClaimableSupply:
        maxClaimableSupply === "Unlimited"
          ? ethers.constants.MaxUint256
          : ethers.utils.parseUnits(maxClaimableSupply, 18),
      supplyClaimed: 0,
      quantityLimitPerWallet:
        quantityLimitPerWallet === "Unlimited"
          ? ethers.constants.MaxUint256
          : ethers.utils.parseUnits(quantityLimitPerWallet, 18),
      merkleRoot: ethers.constants.HashZero, // This will need to be updated if using a real allowlist
      pricePerToken: ethers.utils.parseUnits(pricePerToken, 18),
      currency: currency,
    }
    setClaimConditions([...claimConditions, newCondition])
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="section">
          <h2 className="section-title">Create Token</h2>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
          <input
            placeholder="Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="input"
          />
          <input
            placeholder="Contract URI"
            value={contractURI}
            onChange={(e) => setContractURI(e.target.value)}
            className="input"
          />
          <input
            placeholder="Trusted Forwarders (comma separated)"
            value={trustedForwarders}
            onChange={(e) => setTrustedForwarders(e.target.value)}
            className="input"
          />
          <input
            placeholder="Sale Recipient"
            value={saleRecipient}
            onChange={(e) => setSaleRecipient(e.target.value)}
            className="input"
          />
          <input
            placeholder="Platform Fee Recipient"
            value={platformFeeRecipient}
            onChange={(e) => setPlatformFeeRecipient(e.target.value)}
            className="input"
          />
          <input
            placeholder="Platform Fee BPS"
            value={platformFeeBps}
            onChange={(e) => setPlatformFeeBps(e.target.value)}
            className="input"
          />
          <input
            placeholder="Max Total Supply"
            value={maxTotalSupply}
            onChange={(e) => setMaxTotalSupply(e.target.value)}
            className="input"
          />
          <button onClick={createToken} className="claim-button">
            {isLoading || isTxLoading ? "Creating Token..." : "Create Token"}
          </button>
        </div>

        <div className="section">
          <h2 className="section-title">Set Claim Conditions</h2>
          <input
            placeholder="Phase Name"
            value={phaseName}
            onChange={(e) => setPhaseName(e.target.value)}
            className="input"
          />
          <input
            type="datetime-local"
            placeholder="Start Timestamp"
            value={startTimestamp}
            onChange={(e) => setStartTimestamp(e.target.value)}
            className="input"
          />
          <input
            placeholder="Max Claimable Supply"
            value={maxClaimableSupply}
            onChange={(e) => setMaxClaimableSupply(e.target.value)}
            className="input"
          />
          <input
            placeholder="Price Per Token"
            value={pricePerToken}
            onChange={(e) => setPricePerToken(e.target.value)}
            className="input"
          />
          <input
            placeholder="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="input"
          />
          <input
            placeholder="Quantity Limit Per Wallet"
            value={quantityLimitPerWallet}
            onChange={(e) => setQuantityLimitPerWallet(e.target.value)}
            className="input"
          />
          <button onClick={addClaimCondition} className="claim-button">
            Add Claim Condition
          </button>
          <button onClick={setConditions} className="claim-button">
            Set Claim Conditions
          </button>
        </div>

        <div className="section">
          <h2 className="section-title">Claim Tokens</h2>
          <input
            placeholder="Condition ID"
            value={conditionId}
            onChange={(e) => setConditionId(e.target.value)}
            className="input"
          />
          <input
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input"
          />
          <input
            placeholder="Merkle Proof"
            value={merkleProof}
            onChange={(e) => setMerkleProof(e.target.value.split(","))}
            className="input"
          />
          <button onClick={claimTokens} className="claim-button">
            Claim Tokens
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClaimComponent
