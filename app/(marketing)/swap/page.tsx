"use client"

import { useEffect, useState } from "react"
import { useAccount, useNetwork } from "wagmi"

import "./swap.css"

const Swap = () => {
  const [isClient, setIsClient] = useState(false)
  const [tokenFrom, setTokenFrom] = useState("")
  const [tokenTo, setTokenTo] = useState("")
  const [amount, setAmount] = useState("")
  const [balance, setBalance] = useState(1000) // Mock balance
  const [exchangeRate, setExchangeRate] = useState() // Mock exchange rate
  const [estimatedOutput, setEstimatedOutput] = useState()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const handleSwap = async () => {
    // Implement swap logic here
  }

  useEffect(() => {
    if (amount && exchangeRate) {
      setEstimatedOutput(parseFloat(amount) * exchangeRate)
    }
  }, [amount, exchangeRate])

  const handleQuickSelect = (percentage) => {
    const calculatedAmount = (balance * percentage) / 100
    setAmount(calculatedAmount.toString())
  }

  const handleReverse = () => {
    setTokenFrom(tokenTo)
    setTokenTo(tokenFrom)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="swap-container">
          <h1 className="page-title">Token Swap</h1>
          <div className="swap-card">
            <div className="token-section">
              <label htmlFor="tokenFrom">From</label>
              <div className="token-amount-container">
                <input
                  type="text"
                  id="tokenFrom"
                  value={tokenFrom}
                  onChange={(e) => setTokenFrom(e.target.value)}
                  placeholder="Token address or symbol"
                  className="input-field"
                />
                <div className="amount-container">
                  <div className="quick-select-buttons">
                    <button onClick={() => handleQuickSelect(25)}>25%</button>
                    <button onClick={() => handleQuickSelect(50)}>50%</button>
                    <button onClick={() => handleQuickSelect(75)}>75%</button>
                    <button onClick={() => handleQuickSelect(100)}>Max</button>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
            <div className="reverse-button-container">
              <button className="reverse-button" onClick={handleReverse}>
                &#x21C5;
              </button>
            </div>

            <div className="token-section">
              <label htmlFor="tokenTo">To</label>
              <input
                type="text"
                id="tokenTo"
                value={tokenTo}
                onChange={(e) => setTokenTo(e.target.value)}
                placeholder="Token address or symbol"
                className="input-field"
              />
            </div>
            <div className="swap-summary">
              <p>Exchange Rate: {exchangeRate}</p>
              <p>Estimated Output: {estimatedOutput}</p>
              <p>Slippage:</p>
              <p>Price Impact:</p>
            </div>
            <button className="swap-button" onClick={handleSwap}>
              Swap
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Swap
