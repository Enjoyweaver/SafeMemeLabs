import { useEffect, useState } from "react"
import { SafeMemeABI } from "@/ABIs/SafeLaunch/SafeMeme"
import { ethers } from "ethers"
import { toast } from "react-toastify"

import "@/styles/allTokens.css"
import { Navbar } from "@/components/walletconnect/walletconnect"

import "react-toastify/dist/ReactToastify.css"

const TokenSwap = ({ tokenAddress, tokenBAddress, hideNavbar }) => {
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null)
  const [stageInfo, setStageInfo] = useState<
    [ethers.BigNumber, ethers.BigNumber] | null
  >(null)
  const [currentStage, setCurrentStage] = useState<number>(0)
  const [amount, setAmount] = useState<string>("1")
  const [estimatedOutput, setEstimatedOutput] = useState<string>("0")
  const [tokenPrice, setTokenPrice] = useState<string>("0")

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(web3Provider)
    }
  }, [])

  const fetchStageInfo = async () => {
    if (!provider || !tokenAddress) return

    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        provider
      )
      const currentStage = await tokenContract.getCurrentStage()
      const stageInfo = await tokenContract.getStageInfo(currentStage)

      setCurrentStage(currentStage.toNumber())
      setStageInfo(stageInfo)
      setTokenPrice(ethers.utils.formatUnits(stageInfo[1], 18))
    } catch (error) {
      console.error("Error fetching stage info:", error)
      toast.error("Failed to fetch stage information")
    }
  }

  useEffect(() => {
    if (tokenAddress && provider) {
      fetchStageInfo()
    }
  }, [tokenAddress, provider])

  useEffect(() => {
    if (amount && tokenPrice) {
      const amountNumber = parseFloat(amount)
      const priceNumber = parseFloat(tokenPrice)
      if (!isNaN(amountNumber) && !isNaN(priceNumber) && priceNumber !== 0) {
        setEstimatedOutput((amountNumber / priceNumber).toFixed(6))
      } else {
        setEstimatedOutput("0")
      }
    }
  }, [amount, tokenPrice])

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value)
  }

  const handleSwap = async () => {
    if (!amount || !tokenAddress || !tokenBAddress || !provider) {
      console.log("Validation failed", {
        amount,
        tokenAddress,
        tokenBAddress,
        provider,
      })
      toast.error("Please enter an amount and ensure wallet is connected")
      return
    }

    try {
      const signer = provider.getSigner()
      const tokenBContract = new ethers.Contract(
        tokenBAddress,
        SafeMemeABI,
        signer
      )
      const safeMemeContract = new ethers.Contract(
        tokenAddress,
        SafeMemeABI,
        signer
      )

      const amountInWei = ethers.utils.parseUnits(amount, 18)

      const approveTx = await tokenBContract.approve(tokenAddress, amountInWei)
      await approveTx.wait()
      toast.info("Approval successful. Proceeding with swap...")

      const buyTx = await safeMemeContract.buyTokens(amountInWei, tokenBAddress)
      await buyTx.wait()

      toast.success("Swap successful!")
      fetchStageInfo()
    } catch (error) {
      console.error("Error during swap:", error)
      toast.error(`Swap failed: ${error.message}`)
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
                <label htmlFor="amount">Amount of Token B to swap</label>
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
                <p>Exchange Rate: 1 SafeMeme = {tokenPrice} Token B</p>
                <p>Estimated SafeMeme Output: {estimatedOutput}</p>
                <p>Current Stage: {currentStage}</p>
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
