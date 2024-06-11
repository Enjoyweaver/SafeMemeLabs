"use client"

import React, { useEffect, useState } from "react"
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js"
import { Line } from "react-chartjs-2"

import "@/styles/safememe.css"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const SafeMemeBlogPost = () => {
  const [initialSupply, setInitialSupply] = useState(1000000)
  const [tokenBReceived, settokenBReceived] = useState(0)
  const [tokenBPrices, settokenBPrices] = useState([1, 1, 1, 1, 1])
  const [unlockThresholds, setUnlockThresholds] = useState([
    1000, 2000, 3000, 4000, 5000,
  ])
  const [chartData, setChartData] = useState({ labels: [], datasets: [] })
  const [priceChartData, setPriceChartData] = useState({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    updateChart()
    updatePriceChart()
  }, [initialSupply, tokenBReceived, unlockThresholds, tokenBPrices])

  const updateChart = () => {
    const labels = []
    const tokenBData = []
    const tokenAData = []

    unlockThresholds.forEach((threshold, index) => {
      if (tokenBReceived >= threshold) {
        labels.push(`Phase ${index + 1}`)
        tokenBData.push(threshold)
        tokenAData.push(initialSupply * 0.05)
      }
    })

    setChartData({
      labels,
      datasets: [
        {
          label: "Token B Received",
          data: tokenBData,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
        },
        {
          label: "Token A Unlocked",
          data: tokenAData,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
        },
      ],
    })
  }

  const updatePriceChart = () => {
    const labels = []
    const prices = []

    unlockThresholds.forEach((threshold, index) => {
      if (tokenBReceived >= threshold) {
        labels.push(`Phase ${index + 1}`)
        prices.push((tokenBPrices[index] * threshold) / (initialSupply * 0.05))
      }
    })

    setPriceChartData({
      labels,
      datasets: [
        {
          label: "Price of SafeMeme (USD)",
          data: prices,
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
        },
      ],
    })
  }

  const handleUnlockThresholdChange = (index, value) => {
    const newThresholds = [...unlockThresholds]
    newThresholds[index] = parseInt(value)
    setUnlockThresholds(newThresholds)
  }

  const handleTokenBPriceChange = (index, value) => {
    const newValue = value.replace(/[^0-9\.]/g, "") // Remove any non-numeric characters
    const newPrices = [...tokenBPrices]
    newPrices[index] = parseFloat(newValue)
    settokenBPrices(newPrices)
  }

  const handleTokenBReceivedChange = (value) => {
    settokenBReceived(parseFloat(value))
  }

  const DecimalInput = () => {
    const [value, setValue] = useState("0.00")

    const handleInput = (e) => {
      const newValue = e.target.value.replace(/[^\d\.]/g, "")
      setValue(newValue)
    }

    return (
      <input
        type="text"
        value={value}
        onChange={handleInput}
        pattern="[0-9\.]*"
      />
    )
  }

  return (
    <div>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="blog-container">
            <h1 className="page-title">What is the SafeMeme Token Standard?</h1>
            <p className="blog-content">
              The SafeMeme token standard is designed to provide a structured
              and secure token launch by including an anti-whale mechanism and
              progressive unlocking of your token supply based on specific
              liquidity thresholds. The SafeMeme smart contract is suitable for
              any token aiming to build a strong and stable liquidity pool from
              the start.
            </p>
            <h2 className="section-title">Tokenomics and Mechanisms</h2>
            <p className="blog-content">
              Upon creation, 5% of the total supply is released for sale and the
              remaining 95% is locked until certain levels of liquidity are
              received. As each liquidity threshold is reached, an additional 5%
              of the total supply is unlocked and made available for sale.
              However, the price of your SafeMeme is dependent on the thresholds
              you set and the price of the token you are providing liquidity
              with.
            </p>
            <h2 className="section-title">Interactive Pricing Bond Curve</h2>
            <p className="blog-content">
              The charts below illustrate the pricing bond curve and unlocking
              phases for SafeMeme tokens. Token A is the created SafeMeme token,
              while Token B is the paired token used to purchase Token A. Adjust
              the initial token supply of Token A and the amount of Token B
              received to see how the unlocking and liquidity creation process
              evolves. Each unlock phase releases 5% of the total supply.
            </p>
            <p className="blog-content">
              To use the charts, update the "Initial Supply" and "Token B
              Received" inputs to see the charts come alive. The first chart
              shows the unlocking phases based on Token B received, while the
              second chart displays the price of your SafeMeme token (Token A)
              in USD.
            </p>

            <div className="charts-container">
              <div className="chart-section">
                <h3 className="chart-title">Tokenomics</h3>
                <Line data={chartData} />
                <div className="input-section input-section-main">
                  <div className="input-row-container">
                    <div className="input-row">
                      <label htmlFor="initialSupply">Initial Supply:</label>
                      <input
                        type="number"
                        id="initialSupply"
                        value={initialSupply}
                        onChange={(e) =>
                          setInitialSupply(parseInt(e.target.value))
                        }
                      />
                    </div>
                    <div className="input-row">
                      <label htmlFor="tokenBReceived">Token B Received:</label>
                      <input
                        type="number"
                        id="tokenBReceived"
                        value={tokenBReceived}
                        onChange={(e) =>
                          handleTokenBReceivedChange(e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="input-section">
                  {unlockThresholds.map((threshold, index) => (
                    <div key={index} className="input-row threshold-section">
                      <label htmlFor={`threshold${index}`}>
                        Phase {index + 1} Unlock Threshold:
                      </label>
                      <input
                        type="number"
                        id={`threshold${index}`}
                        value={threshold}
                        onChange={(e) =>
                          handleUnlockThresholdChange(index, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-section">
                <h3 className="chart-title">Your Tokens Price</h3>
                <Line data={priceChartData} />
                <div className="input-section">
                  <div className="input-row blank-filler" />
                  {unlockThresholds.map((_, index) => (
                    <div key={index} className="input-row threshold-section">
                      <label htmlFor={`tokenBPrice${index}`}>
                        Token B Price (USD) for Phase {index + 1}:
                      </label>
                      <DecimalInput
                        value={tokenBPrices[index]}
                        onChange={(e) =>
                          handleTokenBPriceChange(index, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <section className="audit-section">
          <h2 className="first-contract-title">ERC-20 Standard</h2>

          <h3 className="subsection-title">Introduction</h3>
          <p className="audit-content">
            The ERC-20 standard, introduced in 2015, is the most widely adopted
            token standard on the Ethereum blockchain. It defines a set of
            functions and events that a token contract must implement to be
            considered an ERC-20 token. The key functionalities include:
          </p>
          <ul className="audit-list">
            <li>Transferring tokens from one account to another.</li>
            <li>Getting the current token balance of an account.</li>
            <li>
              Getting the total supply of the token available on the network.
            </li>
            <li>
              Approving whether an amount of tokens from an account can be spent
              by a third-party account.
            </li>
          </ul>
          <p className="audit-content">
            The ERC-20 standard was created to serve administrative purposes
            like airdrops only, so security was not a factor. That's why we are
            expanding on the security considerations of our contracts below.
          </p>

          <h2 className="contract-title">Factory Contract</h2>

          <h3 className="subsection-title">Purpose</h3>
          <p className="audit-content">
            The Factory.sol contract is designed to create new SafeMeme tokens
            with specific features, including an anti-whale mechanism. It
            manages the entire deployment process, from token creation to
            initial listing on a decentralized exchange (DEX).
          </p>

          <h3 className="subsection-title">Scope</h3>
          <p className="audit-content">
            The Factory.sol contract handles the following:
          </p>
          <ul className="audit-list">
            <li>
              Setting and collecting a creation fee for deploying new tokens.
            </li>
            <li>Deploying new SafeMeme tokens with defined parameters.</li>
            <li>
              Managing the deployment process and interacting with the Router
              contract for initial token listings.
            </li>
            <li>
              Providing information about deployed tokens and allowing the
              withdrawal of collected fees.
            </li>
          </ul>

          <h3 className="subsection-title">Areas of Consideration</h3>
          <ul className="audit-list">
            <li>
              <strong>Fee Management:</strong> Ensure the fee collector address
              is secured and the process for changing the fee is restricted to
              authorized users.
            </li>
            <li>
              <strong>Anti-Whale Mechanism:</strong> Verify the anti-whale rules
              are effectively enforced to prevent large transfers that could
              disrupt the token ecosystem.
            </li>
            <li>
              <strong>Token Initialization:</strong> Double-check the
              initialization process to prevent re-initialization or unintended
              behavior.
            </li>
            <li>
              <strong>Event Emission:</strong> Ensure all relevant events are
              emitted properly to allow for accurate tracking and auditing of
              token activities.
            </li>
            <li>
              <strong>Router Interaction:</strong> Validate the interactions
              with the Router contract to confirm initial token listings are
              handled correctly and securely.
            </li>
            <li>
              <strong>Not-Updating the State:</strong> Ensure state variables
              are correctly updated to reflect the latest status and prevent
              inconsistencies.
            </li>
            <li>
              <strong>Non tx.origin Authentication:</strong> Use msg.sender
              instead of tx.origin for contract authentication to prevent
              phishing attacks.
            </li>
            <li>
              <strong>Transfer Function Access:</strong> Restrict access to the
              transfer function to prevent unauthorized token transfers.
            </li>
            <li>
              <strong>Manually Adjustable Balances:</strong> Avoid allowing
              balances to be manually adjusted to prevent fraud or errors.
            </li>
            <li>
              <strong>Update Balance Before Send:</strong> Ensure balances are
              updated before executing a transfer to prevent reentrancy attacks.
            </li>
            <li>
              <strong>Burn Function Visibility:</strong> Make the burn function
              publicly visible and ensure it operates correctly to avoid token
              supply manipulation.
            </li>
            <li>
              <strong>Integer Overflow:</strong> Use safe math libraries or
              built-in overflow checks to prevent integer overflow
              vulnerabilities.
            </li>
          </ul>

          <h2 className="contract-title">Locker Contract</h2>

          <h3 className="subsection-title">Purpose</h3>
          <p className="audit-content">
            The Locker.sol contract is responsible for securely locking the
            majority of the token supply and releasing it in phases based on
            specific criteria. It ensures that the token supply is gradually
            unlocked, promoting stability and reducing the risk of large-scale
            token dumps.
          </p>

          <h3 className="subsection-title">Scope</h3>
          <p className="audit-content">
            The Locker.sol contract handles the following:
          </p>
          <ul className="audit-list">
            <li>Locking a specified percentage of the total token supply.</li>
            <li>
              Managing the gradual unlocking of tokens based on predefined
              criteria.
            </li>
            <li>
              Interacting with the Manager contract to notify it when tokens are
              unlocked.
            </li>
            <li>
              Providing information about the remaining locked tokens and the
              number of unlock phases completed.
            </li>
          </ul>

          <h3 className="subsection-title">Areas of Consideration</h3>
          <ul className="audit-list">
            <li>
              <strong>Manager Authorization:</strong> Ensure that only the
              authorized Manager contract can call the unlock function to
              prevent unauthorized access to locked tokens.
            </li>
            <li>
              <strong>Unlock Percentage:</strong> Carefully set the unlock
              percentage to balance between providing liquidity and maintaining
              token value.
            </li>
            <li>
              <strong>Event Emission:</strong> Ensure all relevant events are
              emitted properly to allow for accurate tracking and auditing of
              token activities.
            </li>
            <li>
              <strong>Reentrancy Protection:</strong> Add reentrancy protection
              to the unlock function to prevent reentrancy attacks.
            </li>
          </ul>

          <h2 className="contract-title">Manager Contract</h2>

          <h3 className="subsection-title">Purpose</h3>
          <p className="audit-content">
            The Manager.sol contract is responsible for managing the receipt of
            tokens and coordinating the unlocking of SafeMeme tokens based on
            predefined thresholds. It interacts with the Locker contract to
            trigger token unlocks and manages the creation of liquidity pairs
            for initial token listings.
          </p>

          <h3 className="subsection-title">Scope</h3>
          <p className="audit-content">
            The Manager.sol contract handles the following:
          </p>
          <ul className="audit-list">
            <li>Receiving tokens and tracking the amount received.</li>
            <li>
              Interacting with the Locker contract to unlock tokens when
              thresholds are met.
            </li>
            <li>
              Managing the creation of liquidity pairs for initial token
              listings.
            </li>
          </ul>

          <h3 className="subsection-title">Areas of Consideration</h3>
          <ul className="audit-list">
            <li>
              <strong>Threshold Management:</strong> Ensure the unlock
              thresholds are set appropriately to balance liquidity and token
              availability.
            </li>
            <li>
              <strong>Authorization:</strong> Verify that only the authorized
              Locker contract can trigger the unlock function to prevent
              unauthorized access to locked tokens.
            </li>
            <li>
              <strong>Token Transfer Validation:</strong> Ensure that token
              transfers to the router are correctly validated to prevent
              transfer failures.
            </li>
            <li>
              <strong>Event Emission:</strong> Ensure all relevant events are
              emitted properly to allow for accurate tracking and auditing of
              token activities.
            </li>
            <li>
              <strong>Reentrancy Protection:</strong> Add reentrancy protection
              to the receiveTokens and createLiquidityPair functions to prevent
              reentrancy attacks.
            </li>
          </ul>

          <h2 className="contract-title">Router Contract</h2>

          <h3 className="subsection-title">Purpose</h3>
          <p className="audit-content">
            The Router.sol contract is designed to handle the initial listing
            and swapping of SafeMeme tokens. It interacts with the Manager
            contract to manage liquidity and ensure that tokens are listed at
            appropriate rates.
          </p>

          <h3 className="subsection-title">Scope</h3>
          <p className="audit-content">
            The Router.sol contract handles the following:
          </p>
          <ul className="audit-list">
            <li>
              Setting the manager contract responsible for liquidity management.
            </li>
            <li>
              Adding liquidity received by the Manager contract to the DEX.
            </li>
            <li>
              Listing initial tokens at a calculated rate based on the amount of
              tokenB received.
            </li>
            <li>Facilitating token swaps through a specified path.</li>
            <li>
              Providing information about the initial price per token and
              initial token amount listed.
            </li>
          </ul>

          <h3 className="subsection-title">Areas of Consideration</h3>
          <ul className="audit-list">
            <li>
              <strong>Manager Setting:</strong> Ensure that the manager contract
              is set correctly and only once to avoid unauthorized access or
              mismanagement.
            </li>
            <li>
              <strong>Liquidity Addition:</strong> Verify the proper handling of
              liquidity addition to the DEX and ensure that token approvals and
              transfers are securely managed.
            </li>
            <li>
              <strong>Initial Token Listing:</strong> Double-check the
              calculation of the initial price per token to prevent mispricing.
              Ensure the initial token listing logic is correctly implemented.
            </li>
            <li>
              <strong>Swap Functionality:</strong> Implement and test the swap
              logic thoroughly to ensure it functions as expected. Placeholder
              logic should be replaced with robust calculations.
            </li>
            <li>
              <strong>Event Emission:</strong> Ensure all relevant events are
              emitted properly to allow for accurate tracking and auditing of
              token activities.
            </li>
            <li>
              <strong>Reentrancy Protection:</strong> Add reentrancy protection
              to functions handling token transfers to prevent reentrancy
              attacks.
            </li>
          </ul>

          <h2 className="contract-title">Oracle Contract</h2>

          <h3 className="subsection-title">Purpose</h3>
          <p className="audit-content">
            The Oracle.sol contract is designed to provide reliable price data
            for the tokens. It ensures that token prices are accurately tracked
            and updated to facilitate proper token listings and swaps.
          </p>

          <h3 className="subsection-title">Scope</h3>
          <p className="audit-content">
            The Oracle.sol contract handles the following:
          </p>
          <ul className="audit-list">
            <li>Setting and updating the price of tokens.</li>
            <li>Providing the current price of tokens.</li>
            <li>Managing authorized addresses that can set token prices.</li>
          </ul>

          <h3 className="subsection-title">Areas of Consideration</h3>
          <ul className="audit-list">
            <li>
              <strong>Authorization Management:</strong> Ensure that only
              authorized addresses can set token prices to prevent price
              manipulation.
            </li>
            <li>
              <strong>Event Emission:</strong> Emit events when token prices are
              set or when authorized addresses are added or removed to maintain
              transparency and track changes.
            </li>
          </ul>
        </section>
      </div>
      <h1 className="page-title">
        SafeMeme Token Standard: Technical Specifications
      </h1>
      <p className="blog-content">
        The SafeMeme token standard provides a secure token launch with an
        anti-whale mechanism and progressive unlocking based on liquidity
        thresholds. Below are the technical details for the contracts to be
        implemented.
      </p>

      <h2 className="section-title">Token Creation Scenarios</h2>

      <p className="blog-content">
        There are two scenarios for creating SafeMeme tokens:
      </p>
      <ul className="tech-list">
        <li>
          <strong>SafeMeme Deployed</strong>: Uses <code>Deployer.sol</code> to
          create SafeMeme tokens and send 100% of the supply to the user for
          listing on an exchange of their choice.
        </li>
        <li>
          <strong>SafeMeme Launched</strong>: Uses <code>Launcher.sol</code> to
          create SafeMeme tokens, sending 5% to the Manager contract and locking
          95% in the Locker contract, for deployment on the app's DEX.
        </li>
      </ul>

      <h3 className="contract-title">ERC-20 Standard</h3>
      <p className="blog-content">
        The ERC-20 contract implements the standard ERC-20 functions and events.
      </p>
      <ul className="tech-list">
        <li>
          <strong>Modifiers</strong>: none
        </li>
        <li>
          <strong>Events</strong>: Transfer, Approval
        </li>
        <li>
          <strong>Functions</strong>:
          <ul>
            <li>
              <code>totalSupply(): uint256</code> - Returns the total token
              supply.
            </li>
            <li>
              <code>balanceOf(address account): uint256</code> - Returns the
              token balance of the specified account.
            </li>
            <li>
              <code>transfer(address recipient, uint256 amount): bool</code> -
              Transfers tokens to the specified address.
            </li>
            <li>
              <code>allowance(address owner, address spender): uint256</code> -
              Returns the remaining tokens that spender is allowed to spend on
              behalf of the owner.
            </li>
            <li>
              <code>approve(address spender, uint256 amount): bool</code> -
              Approves the specified amount for spending by the spender.
            </li>
            <li>
              <code>
                transferFrom(address sender, address recipient, uint256 amount):
                bool
              </code>{" "}
              - Transfers tokens from sender to recipient using the allowance
              mechanism.
            </li>
          </ul>
        </li>
      </ul>

      <h3 className="contract-title">Factory Contracts</h3>
      <p className="blog-content">
        The Factory contracts are responsible for deploying new SafeMeme tokens.
      </p>

      <h4 className="subsection-title">Deployer.sol</h4>
      <p className="blog-content">
        Creates the SafeMeme tokens and sends 100% to the user.
      </p>
      <ul className="tech-list">
        <li>
          <strong>Modifiers</strong>:
          <ul>
            <li>
              <code>onlyOwner</code> - Restricts access to owner-only functions.
            </li>
          </ul>
        </li>
        <li>
          <strong>Events</strong>:
          <ul>
            <li>
              <code>TokenDeployed(address tokenAddress)</code> - Emitted when a
              new token is deployed.
            </li>
            <li>
              <code>FeeCollected(address collector, uint256 amount)</code> -
              Emitted when the creation fee is collected.
            </li>
          </ul>
        </li>
        <li>
          <strong>Functions</strong>:
          <ul>
            <li>
              <code>setCreationFee(uint256 fee)</code> - Sets the token creation
              fee.
            </li>
            <li>
              <code>
                deployToken(string name, string symbol, uint256 totalSupply)
              </code>{" "}
              - Deploys a new SafeMeme token and sends 100% to the user.
            </li>
            <li>
              <code>withdrawFees()</code> - Allows the owner to withdraw
              collected fees.
            </li>
          </ul>
        </li>
      </ul>

      <h4 className="subsection-title">Launcher.sol</h4>
      <p className="blog-content">
        Creates the SafeMeme tokens, sending 5% to the Manager and 95% to the
        Locker. Also receives information about the future paired token (Token
        B).
      </p>
      <ul className="tech-list">
        <li>
          <strong>Modifiers</strong>:
          <ul>
            <li>
              <code>onlyOwner</code> - Restricts access to owner-only functions.
            </li>
          </ul>
        </li>
        <li>
          <strong>Events</strong>:
          <ul>
            <li>
              <code>TokenDeployed(address tokenAddress)</code> - Emitted when a
              new token is deployed.
            </li>
            <li>
              <code>FeeCollected(address collector, uint256 amount)</code> -
              Emitted when the creation fee is collected.
            </li>
            <li>
              <code>
                TokensDistributed(address manager, address locker, uint256
                managerAmount, uint256 lockerAmount)
              </code>{" "}
              - Emitted when tokens are distributed to Manager and Locker
              contracts.
            </li>
          </ul>
        </li>
        <li>
          <strong>Functions</strong>:
          <ul>
            <li>
              <code>setCreationFee(uint256 fee)</code> - Sets the token creation
              fee.
            </li>
            <li>
              <code>
                deployToken(string name, string symbol, uint256 totalSupply,
                address tokenB)
              </code>{" "}
              - Deploys a new SafeMeme token, sends 5% to Manager and 95% to
              Locker, and stores information about Token B.
            </li>
            <li>
              <code>withdrawFees()</code> - Allows the owner to withdraw
              collected fees.
            </li>
          </ul>
        </li>
      </ul>

      <h3 className="contract-title">Locker Contract</h3>
      <p className="blog-content">
        The Locker.sol contract locks and gradually unlocks the token supply
        based on liquidity thresholds.
      </p>
      <ul className="tech-list">
        <li>
          <strong>Modifiers</strong>:
          <ul>
            <li>
              <code>onlyManager</code> - Restricts access to manager-only
              functions.
            </li>
          </ul>
        </li>
        <li>
          <strong>Events</strong>:
          <ul>
            <li>
              <code>TokensLocked(uint256 amount)</code> - Emitted when tokens
              are locked.
            </li>
            <li>
              <code>TokensUnlocked(uint256 amount)</code> - Emitted when tokens
              are unlocked.
            </li>
          </ul>
        </li>
        <li>
          <strong>Functions</strong>:
          <ul>
            <li>
              <code>lockTokens(uint256 amount)</code> - Locks the specified
              amount of tokens.
            </li>
            <li>
              <code>unlockTokens()</code> - Unlocks 5% of the total supply each
              time the Manager contract receives 5000 Token B's, sending them to
              the Router contract.
            </li>
            <li>
              <code>getLockedTokens(): uint256</code> - Returns the amount of
              locked tokens.
            </li>
            <li>
              <code>getUnlockedPhases(): uint256</code> - Returns the number of
              unlock phases completed.
            </li>
          </ul>
        </li>
      </ul>

      <h3 className="contract-title">Manager Contract</h3>
      <p className="blog-content">
        The Manager.sol contract manages token reception, sales, and coordinates
        unlocking.
      </p>
      <ul className="tech-list">
        <li>
          <strong>Modifiers</strong>:
          <ul>
            <li>
              <code>onlyAuthorized</code> - Restricts access to authorized
              functions.
            </li>
          </ul>
        </li>
        <li>
          <strong>Events</strong>:
          <ul>
            <li>
              <code>TokensReceived(address from, uint256 amount)</code> -
              Emitted when tokens are received.
            </li>
            <li>
              <code>LiquidityPairCreated(address pair)</code> - Emitted when a
              liquidity pair is created.
            </li>
          </ul>
        </li>
        <li>
          <strong>Functions</strong>:
          <ul>
            <li>
              <code>receiveTokens(uint256 amount)</code> - Receives 5% of Token
              A supply from Launcher.sol and tracks the amount received.
            </li>
            <li>
              <code>unlockTokens()</code> - Triggers token unlocks from the
              Locker contract based on thresholds.
            </li>
            <li>
              <code>createLiquidityPair(address tokenA, address tokenB)</code> -
              Manages the creation of liquidity pairs.
            </li>
            <li>
              <code>sellTokens()</code> - Sells Token A at a set price until the
              5% supply is exhausted, with the price determined by dividing the
              number of Token B's by the 5% total supply.
            </li>
          </ul>
        </li>
      </ul>

      <h3 className="contract-title">Router Contract</h3>
      <p className="blog-content">
        The Router.sol contract manages initial token listing and swaps.
      </p>
      <ul className="tech-list">
        <li>
          <strong>Modifiers</strong>:
          <ul>
            <li>
              <code>onlyManager</code> - Restricts access to manager-only
              functions.
            </li>
          </ul>
        </li>
        <li>
          <strong>Events</strong>:
          <ul>
            <li>
              <code>LiquidityAdded(uint256 amount)</code> - Emitted when
              liquidity is added.
            </li>
            <li>
              <code>TokenListed(uint256 price, uint256 amount)</code> - Emitted
              when tokens are listed.
            </li>
            <li>
              <code>
                TokenSwapped(address from, address to, uint256 amount)
              </code>{" "}
              - Emitted when a token swap occurs.
            </li>
          </ul>
        </li>
        <li>
          <strong>Functions</strong>:
          <ul>
            <li>
              <code>setManager(address manager)</code> - Sets the manager
              contract responsible for liquidity management.
            </li>
            <li>
              <code>addLiquidity(uint256 amount)</code> - Adds liquidity to the
              DEX.
            </li>
            <li>
              <code>listTokens(uint256 price, uint256 amount)</code> - Lists
              tokens at a calculated rate.
            </li>
            <li>
              <code>swapTokens(address[] path, uint256 amount)</code> -
              Facilitates token swaps.
            </li>
            <li>
              <code>getInitialPrice(): uint256</code> - Returns the initial
              price per token.
            </li>
          </ul>
        </li>
      </ul>

      <h3 className="contract-title">Oracle Contract</h3>
      <p className="blog-content">
        The Oracle.sol contract provides reliable price data for tokens.
      </p>
      <ul className="tech-list">
        <li>
          <strong>Modifiers</strong>:
          <ul>
            <li>
              <code>onlyAuthorized</code> - Restricts access to authorized
              functions.
            </li>
          </ul>
        </li>
        <li>
          <strong>Events</strong>:
          <ul>
            <li>
              <code>PriceUpdated(uint256 price)</code> - Emitted when token
              prices are updated.
            </li>
            <li>
              <code>AuthorizedAddressUpdated(address authorized)</code> -
              Emitted when an authorized address is added or removed.
            </li>
          </ul>
        </li>
        <li>
          <strong>Functions</strong>:
          <ul>
            <li>
              <code>setPrice(uint256 price)</code> - Sets the token price.
            </li>
            <li>
              <code>getPrice(): uint256</code> - Returns the current token
              price.
            </li>
            <li>
              <code>authorizeAddress(address addr)</code> - Adds an authorized
              address.
            </li>
            <li>
              <code>deauthorizeAddress(address addr)</code> - Removes an
              authorized address.
            </li>
          </ul>
        </li>
      </ul>
    </div>
  )
}

export default SafeMemeBlogPost
