import { useEffect, useState } from "react"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { ethers } from "ethers"
import { toast } from "react-toastify"

import "react-toastify/dist/ReactToastify.css"
import { useAccount } from "wagmi"

const TokenSwap = ({ tokenAddress, tokenBAddress, hideNavbar }) => {
  const { address, isConnected } = useAccount()
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null)
  const [stageInfo, setStageInfo] = useState(null)
  const [currentStage, setCurrentStage] = useState(0)
  const [amount, setAmount] = useState<number>(1)
  const [estimatedOutput, setEstimatedOutput] = useState<number>(0)
  const [tokenPrice, setTokenPrice] = useState(0)

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(web3Provider)
    }
  }, [])

  const fetchStageInfo = async () => {
    if (!provider || !tokenAddress) return

    const tokenContract = new ethers.Contract(
      tokenAddress,
      SafeMemeABI,
      provider
    )
    const currentStage = await tokenContract.getCurrentStage()
    const stageInfo = await tokenContract.getStageInfo(currentStage)

    setCurrentStage(currentStage)
    setStageInfo(stageInfo)
    setTokenPrice(parseFloat(ethers.utils.formatUnits(stageInfo[1], 18)))
  }

  useEffect(() => {
    if (tokenAddress) {
      fetchStageInfo()
    }
  }, [tokenAddress])

  useEffect(() => {
    if (amount && tokenPrice) {
      setEstimatedOutput(amount * tokenPrice)
    }
  }, [amount, tokenPrice])

  const handleAmountChange = (event) => {
    setAmount(parseFloat(event.target.value))
  }

  const handleSwap = async () => {
    if (!isConnected || !amount || !tokenAddress || !tokenBAddress) return

    try {
      const signer = provider.getSigner()
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        signer
      )
      const amountInWei = ethers.utils.parseUnits(amount.toString(), 18)

      await tokenContract.buyTokens(amountInWei, tokenBAddress, {
        gasLimit: ethers.utils.hexlify(1000000),
      })

      toast.success("Swap successful!")
    } catch (error) {
      console.error("Swap failed:", error)
      toast.error("Swap failed: " + error.message)
    }
  }

  return (
    <div>
      {!hideNavbar && <Navbar />}
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="swap-container">
            <h1 className="page-title">Token Swap</h1>
            <div className="swap-card">
              <div className="token-section">
                <label htmlFor="amount">Amount</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Amount"
                  className="input-field"
                />
              </div>
              <div className="swap-summary">
                <p>Exchange Rate: {tokenPrice || 0}</p>
                <p>Estimated Output: {estimatedOutput}</p>
                <p>Slippage: 0.5%</p>
                <p>Price Impact: 0.3%</p>
              </div>
              <button className="swap-button" onClick={handleSwap}>
                Swap
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default TokenSwap
