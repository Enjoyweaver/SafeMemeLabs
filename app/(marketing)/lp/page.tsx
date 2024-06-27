"use client"

import { useEffect, useState } from "react"
import { safeLaunchFactoryABI } from "@/ABIs/vyper/safeLaunchFactory"
import { safeMemeABI } from "@/ABIs/vyper/safeMeme"
import { safeSaleABI } from "@/ABIs/vyper/safeSale"
import { tokenFactoryABI } from "@/ABIs/vyper/tokenFactory"
import { SafeLaunchFactory, tokenVyperDetails } from "@/Constants/config"
import { ethers } from "ethers"
import { useAccount, useNetwork } from "wagmi"

import { Navbar } from "@/components/walletconnect/walletconnect"

import "@/styles/lp.css"

const SafeLaunch = () => {
  const [isClient, setIsClient] = useState(false)
  const [deployedTokenData, setDeployedTokenData] = useState<any[]>([])
  const [selectedToken, setSelectedToken] = useState<string>("")
  const [totalSupply, setTotalSupply] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null)
  const [tokenFactoryContract, setTokenFactoryContract] =
    useState<ethers.Contract | null>(null)
  const [safeLaunchFactoryContract, setSafeLaunchFactoryContract] =
    useState<ethers.Contract | null>(null)

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined" && window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(web3Provider)
      const chainId = chain ? chain.id : Object.keys(tokenVyperDetails)[0]
      const contract = new ethers.Contract(
        tokenVyperDetails[chainId] as `0x${string}`,
        tokenFactoryABI,
        web3Provider
      )
      setTokenFactoryContract(contract)

      const safeLaunchFactory = new ethers.Contract(
        SafeLaunchFactory[chainId] as `0x${string}`,
        safeLaunchFactoryABI,
        web3Provider.getSigner()
      )
      setSafeLaunchFactoryContract(safeLaunchFactory)
    }
  }, [])

  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const getAllTokens = async () => {
    try {
      if (!tokenFactoryContract) return []
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
      if (!tokenFactoryContract) return []
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
      if (!provider) return null
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
      if (!provider) return []
      const safeLaunchContract = new ethers.Contract(
        SafeLaunchFactory[
          chain ? chain.id : Object.keys(tokenVyperDetails)[0]
        ] as `0x${string}`,
        safeSaleABI,
        provider
      )

      const stageDetails = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          safeLaunchContract.getStageDetails(tokenAddress, i)
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
  }, [isClient, isConnected, chain, address, tokenFactoryContract])

  const handleTokenSelection = async (tokenAddress: string) => {
    setSelectedToken(tokenAddress)
    if (!provider) return
    const tokenContract = new ethers.Contract(
      tokenAddress,
      safeMemeABI,
      provider
    )
    const totalSupply = await tokenContract.totalSupply()
    setTotalSupply(totalSupply.toString())
  }

  const handleStartSafeLaunch = async () => {
    if (isConnected && selectedToken && totalSupply) {
      try {
        setLoading(true)
        if (!provider || !safeLaunchFactoryContract) return

        const tokenContract = new ethers.Contract(
          selectedToken,
          safeMemeABI,
          provider.getSigner()
        )

        const userBalance = await tokenContract.balanceOf(address)
        if (userBalance.lt(totalSupply)) {
          alert("You don't have enough tokens to start the SafeLaunch.")
          setLoading(false)
          return
        }

        console.log("Approving tokens...")
        const approvalTx = await tokenContract.approve(
          safeLaunchFactoryContract.address,
          totalSupply
        )
        await approvalTx.wait()
        console.log("Tokens approved successfully")

        console.log("Starting SafeLaunch...")
        const startSafeLaunchTx =
          await safeLaunchFactoryContract.deploySafeLaunch(
            selectedToken,
            SafeLaunchFactory[
              chain ? chain.id : Object.keys(SafeLaunchFactory)[0]
            ] as `0x${string}`,
            {
              value: ethers.utils.parseEther("0.0"),
              gasLimit: ethers.utils.hexlify(1000000),
            } // Adjust value if there's a fee
          )
        await startSafeLaunchTx.wait()
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
            <h1 className="page-title">Start your SafeLaunch</h1>
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
                onClick={handleStartSafeLaunch}
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

export default SafeLaunch
