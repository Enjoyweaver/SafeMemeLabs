"use client"

import { useEffect, useState } from "react"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import { tokenDeployerDetails } from "@/Constants/config"
import { ethers } from "ethers"
import { useAccount, useNetwork } from "wagmi"

import { Navbar } from "@/components/walletconnect/walletconnect"

//import { addLiquidity, createPair } from "./dex"
import "@/styles/lp.css"

const Liquidity = () => {
  const [isClient, setIsClient] = useState(false)
  const [newToken, setNewToken] = useState("")
  const [existingToken, setExistingToken] = useState("")
  const [amountNewToken, setAmountNewToken] = useState("")
  const [amountExistingToken, setAmountExistingToken] = useState("")
  const [tokens, setTokens] = useState([]) // State to store fetched tokens
  const [walletTokens, setWalletTokens] = useState([]) // State to store wallet tokens

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const fetchTokens = async () => {
    if (chain && isConnected && address) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const factoryAddress = tokenDeployerDetails[chain.id]

        if (!factoryAddress) {
          console.error("Factory address not found for chain ID:", chain.id)
          return
        }

        const factoryContract = new ethers.Contract(
          factoryAddress,
          tokenDeployerABI,
          provider.getSigner()
        )

        const tokensDeployedByUser =
          await factoryContract.getTokensDeployedByUser(address)
        setTokens(
          tokensDeployedByUser.filter(
            (token) => token !== ethers.constants.AddressZero
          )
        )

        // Fetch wallet tokens
        const walletTokenAddresses = await provider.listAccounts() // Mock fetching wallet tokens
        setWalletTokens(walletTokenAddresses)
      } catch (error) {
        console.error("Error fetching tokens:", error)
      }
    }
  }

  useEffect(() => {
    fetchTokens()
  }, [chain, isConnected, address])

  const handleAddLiquidity = async () => {
    if (
      isConnected &&
      amountNewToken > 0 &&
      amountExistingToken > 0 &&
      newToken &&
      existingToken
    ) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await createPair(provider, newToken)
        await addLiquidity(
          provider,
          newToken,
          amountNewToken,
          existingToken,
          amountExistingToken
        )
      } catch (error) {
        console.error("Add liquidity failed:", error)
      }
    }
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="liquidity-container">
            <h1 className="page-title">Provide Liquidity</h1>
            <div className="liquidity-card">
              <div className="token-section">
                <label htmlFor="newToken">New Token</label>
                <select
                  id="newToken"
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select New Token</option>
                  {tokens.map((token, index) => (
                    <option key={index} value={token}>
                      {token}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  id="amountNewToken"
                  value={amountNewToken}
                  onChange={(e) => setAmountNewToken(e.target.value)}
                  placeholder="Amount"
                  className="input-field"
                />
              </div>
              <div className="token-section">
                <label htmlFor="existingToken">Existing Token</label>
                <select
                  id="existingToken"
                  value={existingToken}
                  onChange={(e) => setExistingToken(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Existing Token</option>
                  {walletTokens.map((token, index) => (
                    <option key={index} value={token}>
                      {token}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  id="amountExistingToken"
                  value={amountExistingToken}
                  onChange={(e) => setAmountExistingToken(e.target.value)}
                  placeholder="Amount"
                  className="input-field"
                />
              </div>
              <button
                className="liquidity-button"
                onClick={handleAddLiquidity}
                disabled={
                  !isConnected ||
                  !amountNewToken ||
                  !amountExistingToken ||
                  !newToken ||
                  !existingToken
                }
              >
                Add Liquidity
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default Liquidity