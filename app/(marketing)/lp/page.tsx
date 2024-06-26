"use client"

import { useEffect, useState } from "react"
import { safeMemeABI } from "@/ABIs/vyper/safeMeme"
import { safeSaleABI } from "@/ABIs/vyper/safeSale"
import { tokenFactoryABI } from "@/ABIs/vyper/tokenFactory"
import { SafeSaleAddress, tokenVyperDetails } from "@/Constants/config"
import { ethers } from "ethers"
import { useAccount, useNetwork } from "wagmi"

import { Navbar } from "@/components/walletconnect/walletconnect"

import "@/styles/lp.css"

const Liquidity = () => {
  const [isClient, setIsClient] = useState(false)
  const [deployedTokenData, setDeployedTokenData] = useState<any[]>([])
  const [selectedToken, setSelectedToken] = useState<string>("")
  const [totalSupply, setTotalSupply] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const chainId: string | number = chain
    ? chain.id
    : Object.keys(tokenVyperDetails)[0]

  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const tokenFactoryContract = new ethers.Contract(
    tokenVyperDetails[chainId] as `0x${string}`,
    tokenFactoryABI,
    provider
  )

  const getAllTokens = async () => {
    try {
      const tokenCount = await tokenFactoryContract.getDeployedTokenCount({
        gasLimit: ethers.utils.hexlify(1000000),
      })
      const allTokens = []
      for (let i = 0; i < tokenCount; i++) {
        const tokenAddress = await tokenFactoryContract.tokensDeployed(i, {
          gasLimit: ethers.utils.hexlify(1000000),
        })
        allTokens.push(tokenAddress)
      }
      return allTokens
    } catch (error) {
      console.error("Error fetching all tokens: ", error)
      return []
    }
  }

  const getUserTokens = async (userAddress) => {
    try {
      const userTokens = await tokenFactoryContract.getTokensDeployedByUser(
        userAddress,
        {
          gasLimit: ethers.utils.hexlify(1000000),
        }
      )
      return userTokens
    } catch (error) {
      console.error("Error fetching user tokens: ", error)
      return []
    }
  }

  const getTokenDetails = async (tokenAddress) => {
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        safeMemeABI,
        provider
      )
      const [name, symbol, totalSupply, owner, decimals, antiWhalePercentage] =
        await Promise.all([
          tokenContract.name(),
          tokenContract.symbol(),
          tokenContract.totalSupply(),
          tokenContract.owner(),
          tokenContract.decimals(),
          tokenContract.antiWhalePercentage(),
        ])
      return {
        address: tokenAddress,
        name,
        symbol,
        totalSupply,
        owner,
        decimals,
        antiWhalePercentage,
      }
    } catch (error) {
      console.error(`Error fetching details for token ${tokenAddress}:`, error)
      return null
    }
  }

  const getStageDetails = async (tokenAddress) => {
    try {
      const safeSaleContract = new ethers.Contract(
        SafeSaleAddress[chainId] as `0x${string}`,
        safeSaleABI,
        provider
      )

      const stageDetails = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          safeSaleContract.getStageDetails(tokenAddress, i)
        )
      )

      return stageDetails
    } catch (error) {
      console.error(
        `Error fetching stage details for token ${tokenAddress}:`,
        error
      )
      return []
    }
  }

  useEffect(() => {
    const fetchAllTokenData = async () => {
      try {
        const allTokens = await getAllTokens()
        if (!allTokens || allTokens.length === 0) {
          console.error("allTokens is undefined, null, or empty.")
          return
        }

        const userTokens = await getUserTokens(address)
        if (!userTokens) {
          console.error("userTokens is undefined or null.")
          return
        }

        const tokenData = await Promise.all(
          allTokens.map(async (tokenAddress) => {
            const details = await getTokenDetails(tokenAddress)
            const stages = await getStageDetails(tokenAddress)
            return { ...details, stages }
          })
        )

        if (!tokenData) {
          console.error("tokenData is undefined or null.")
          return
        }

        const userTokenAddresses = new Set(
          userTokens.map((token) => token.toLowerCase())
        )
        const deployedTokenData = tokenData
          .filter((token): token is NonNullable<typeof token> => token !== null)
          .map((token) => ({
            ...token,
            isUserToken: userTokenAddresses.has(
              token.address?.toLowerCase() || ""
            ),
          }))
        setDeployedTokenData(deployedTokenData)
      } catch (error) {
        console.error("Error fetching token data: ", error)
      }
    }

    if (isClient && isConnected) {
      fetchAllTokenData()
    }
  }, [isClient, isConnected, chainId, address])

  const handleTokenSelection = async (tokenAddress: string) => {
    setSelectedToken(tokenAddress)
    const tokenContract = new ethers.Contract(
      tokenAddress,
      safeMemeABI,
      provider
    )
    const totalSupply = await tokenContract.totalSupply()
    setTotalSupply(totalSupply.toString())
  }

  const handleDepositTokens = async () => {
    if (isConnected && selectedToken && totalSupply) {
      try {
        setLoading(true)
        const safeSaleContract = new ethers.Contract(
          SafeSaleAddress[chainId] as `0x${string}`,
          safeSaleABI,
          provider.getSigner()
        )

        const tokenContract = new ethers.Contract(
          selectedToken,
          safeMemeABI,
          provider.getSigner()
        )

        const userBalance = await tokenContract.balanceOf(address)
        if (userBalance.lt(totalSupply)) {
          alert("You don't have enough tokens to start the sale.")
          setLoading(false)
          return
        }

        console.log("Approving tokens...")
        const approvalTx = await tokenContract.approve(
          safeSaleContract.address,
          totalSupply
        )
        await approvalTx.wait()
        console.log("Tokens approved successfully")

        console.log("Starting SafeLaunch...")
        const startSaleTx = await safeSaleContract.startSafeLaunch(
          selectedToken,
          totalSupply,
          [1000, 2000, 3000, 4000, 5000],
          [1, 2, 3, 4, 5],
          { gasLimit: ethers.utils.hexlify(1000000) }
        )
        await startSaleTx.wait()
        console.log("SafeLaunch started successfully")

        console.log("Tokens deposited successfully")
      } catch (error) {
        console.error("Token deposit failed:", error)
      } finally {
        setLoading(false)
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
                <label htmlFor="selectedToken">Select Token to Deposit</label>
                <select
                  id="selectedToken"
                  value={selectedToken}
                  onChange={(e) => handleTokenSelection(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Token</option>
                  {deployedTokenData.map((token, index) => (
                    <option key={index} value={token.address}>
                      {token.name} ({token.symbol})
                    </option>
                  ))}
                </select>
              </div>
              {selectedToken && (
                <div className="token-details">
                  <p>
                    <strong>Total Supply:</strong> {totalSupply}
                  </p>
                </div>
              )}
              <button
                className="liquidity-button"
                onClick={handleDepositTokens}
                disabled={
                  !isConnected || !selectedToken || !totalSupply || loading
                }
              >
                {loading
                  ? "Processing..."
                  : "Deposit 100% Tokens to Start SafeLaunch"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default Liquidity
