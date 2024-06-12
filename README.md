# SafeMeme Labs

#### We create safememes so you can invest safely, predictably, and to have fun along the way.

Welcome to SafeMeme Labs, your go-to platform for creating, deploying, and managing custom ERC-20 tokens with built-in anti-whale mechanisms and advanced liquidity management features. SafeMeme Labs provides an intuitive interface and robust backend to ensure that your token creation and deployment processes are seamless and secure.

## Overview

SafeMeme Labs is designed to empower users with the tools needed to launch their own custom tokens on multiple blockchains. The app provides two primary token creation scenarios:

### SafeMeme Deployed

In this scenario, 100% of the token supply is sent to the user's wallet, allowing for flexible deployment on any exchange.

### SafeMeme Launched

Here, tokens are allocated to specialized contracts (Locker and Manager) and deployed directly on the SafeMeme Labs decentralized exchange (DEX). This setup includes:

- **Locker Contract**: Manages the progressive unlocking of tokens based on liquidity thresholds.
- **Manager Contract**: Sells initial token allocations and sends received tokens to the Router for pairing and listing.

## SafeMeme Smart Contract Key Features

- **Anti-Whale Mechanism**: Protects the token's ecosystem by limiting the maximum token transfer amount and holder balance to a set percentage of the total supply.
- **Initial Token Locking**: Ensures that a portion of the token supply is gradually unlocked as liquidity conditions are met.
- **Liquidity Management**: Automatically pairs tokens with a designated Token B and lists them on the DEX.
- **Oracle Integration**: Tracks and updates token prices, providing real-time data for token operations.

## App Features

- Authentication using **NextAuth.js**
- ORM using **Prisma**
- Database on **Supabase**
- UI Components built using **Radix UI**
- Documentation and blog using **MDX** and **Contentlayer**
- Subscriptions using **Stripe**
- Styled using **Tailwind CSS**
- Validations using **Zod**
- Written in **TypeScript**

## Steps to Integrate

Deploy the LiquidityManager contract and pass its address to the TokenFactory constructor.
Use the TokenFactory contract to create new tokens, specifying the name, symbol, decimals, supply, anti-whale percentage, and the address of the liquidity manager.
Use the collectTokens function in the LiquidityManager to collect Token 2 and trigger the unlocking and liquidity addition process.

+-------------------+
| TokenFactory |
+-------------------+
| - creationFee |
| - feeCollector |
| - tokensDeployed |
+-------------------+
| + deployToken() |
| + withdrawFees() |
| + getTokensDeployedByUser() |
| + getDeployedTokenCount() |
+-------------------+
|
| Deploys
v
+-------------------+
| LiquidityToken |
+-------------------+
| - name |
| - symbol |
| - decimals |
| - totalSupply |
| - lockedSupply |
| - owner |
| - antiWhalePercentage |
| - liquidityManager |
| - nextUnlockLevel |
| - tokensPerLevel |
+-------------------+
| + initialize() |
| + transfer() |
| + transferFrom() |
| + approve() |
| + addLiquidity() |
+-------------------+
|
| Calls addLiquidity() on
v
+-------------------+
| LiquidityManager |
+-------------------+
| - owner |
| - tokenFactory |
| - collectedToken2 |
| - nextUnlockLevel |
+-------------------+
| + collectTokens() |
| + addLiquidity() |
| + setNextUnlockLevel() |
+-------------------+
^
|
Collects Token 2 and triggers unlock

- when a user creates a token, 5% of the supply is released with no pairing, but a pairing is declared that it will be token 2.
- the price is pre-determined for the initial 5% based on how much the supply is divided by the first 1000 token 2's.
- and then when the first 5% of the supply is sold for the 1000 ttoken 2's, then the contractt will release 5% tthat is paired with that 1000 token 2's and send to the swap on my app.
- and the pattern continues but the amount of token 2's per batch of tokens released decreases to keep tthe price action minimal.

Event Sync: This event is emitted when the reserves of the pair are updated.

Constructor: Initializes the pair with the deployer's address.

Initialize: This internal function is called by the factory at deployment to set the token addresses.

\_update: Updates the reserves and price accumulators. It's called whenever the balance of the tokens in the pair changes.

\_mintFee: Called when liquidity is minted. It checks if the fee is enabled and mints liquidity if the sqrt(k) has increased by at least 1/6.

mint: Mints liquidity to the specified recipient. It checks if the fee is enabled and mints liquidity if the sqrt(k) has increased by at least 1/6.

burn: Burns liquidity from the specified recipient.

swap: Swaps the specified amount of tokens. It's used for ONE-to-ONE swaps, one-way AMMs, and other applications that need to modify the shares.

skim: Forces the pair to match its balances to its reserves by transferring the difference between the balance and the reserve to the specified recipient.

sync: Forces the pair to match its reserves to its balances.

The library provides various mathematical operations such as addition, subtraction, multiplication, and division, which are used throughout the contract.

The UQ112x112 library is used to handle binary fixed point numbers, which are used to represent the reserves and price accumulators.

The Math library provides functions for calculating the minimum of two numbers and the square root of a number.

The SafeMath library provides functions for performing overflow-safe arithmetic operations.

Here is the list in a .tsx file format:

```
import React from 'react';

const ContractBasis: React.FC = () => {
  return (
    <div>
      <h2>Contract Basis</h2>
          <ul>
            <li>
              <input type="checkbox" />
              <span>
                Event Sync: This event is emitted when the reserves of the pair
                are updated.
              </span>
            </li>
            <li>
              <input type="checkbox" />
              <span>
                Constructor: Initializes the pair with the deployer's address.
              </span>
            </li>
            <li>
              <input type="checkbox" />
              <span>
                Initialize: This internal function is called by the factory at
                deployment to set the token addresses.
              </span>
            </li>
            <li>
              <input type="checkbox" />
              <span>
                _update: Updates the reserves and price accumulators. It's
                called whenever the balance of the tokens in the pair changes.
              </span>
            </li>
            <li>
              <input type="checkbox" />
              <span>
                _mintFee: Called when liquidity is minted. It checks if the fee
                is enabled and mints liquidity if the sqrt(k) has increased by
                at least 1/6.
              </span>
            </li>
            <li>
              <input type="checkbox" />
              <span>
                mint: Mints liquidity to the specified recipient. It checks if
                the fee is enabled and mints liquidity if the sqrt(k) has
                increased by at least 1/6.
              </span>
            </li>
            <li>
              <input type="checkbox" />
              <span>burn: Burns liquidity from the specified recipient.</span>
            </li>
            <li>
              <input type="checkbox" />
              <span>
                swap: Swaps the specified amount of tokens. It's used for
                ONE-to-ONE swaps, one-way AMMs, and other applications that need
                to modify the shares.
              </span>
            </li>
            <li>
              <input type="checkbox" />
              <span>
                skim: Forces the pair to match its balances to its reserves by
                transferring the difference between the balance and the reserve
                to the specified recipient.
              </span>
            </li>
            <li>
              <input type="checkbox" />
              <span>
                sync: Forces the pair to match its reserves to its balances.
              </span>
            </li>
          </ul>
```

Scope
The Factory.sol contract handles:

Setting and collecting a creation fee for deploying new tokens.
Deploying new SafeMeme tokens with defined parameters.
Managing the deployment process and interacting with the Router contract for initial token listings.
Providing information about deployed tokens and allowing the withdrawal of collected fees.
Functions
constructor(uint256 \_creationFee, address \_liquidityManager, address \_router):

Initializes the contract with a creation fee, liquidity manager address, and router address.
Sets the fee collector to the contract deployer.
changeCreationFee(uint256 \_newFee):

Allows the fee collector to change the token creation fee.
deployToken(string memory \_symbol, string memory \_name, uint8 \_decimals, uint256 \_initialSupply, uint8 \_antiWhalePercentage, address \_locker, address \_manager) external payable returns (address):

Deploys a new SafeMeme token with specified parameters (symbol, name, decimals, initial supply, anti-whale percentage, locker address, and manager address).
Transfers the creation fee to the fee collector.
Initializes and sets up the new token, transfers 95% of the supply to the locker and 5% to the manager.
Lists the initial 5% of tokens on the DEX via the Router contract.
Emits a TokenDeployed event with the new token's address, symbol, and name.
withdrawFees():

Allows the fee collector to withdraw the collected creation fees from the contract.
getTokensDeployedByUser(address \_user) external view returns (address[] memory):

Returns a list of token addresses deployed by a specific user.
getDeployedTokenCount() external view returns (uint256):

Returns the total number of tokens deployed by the factory.
transfer(address token, address recipient, uint256 amount) external antiWhale(token, recipient, amount) returns (bool):

Transfers tokens from the caller to a recipient, enforcing the anti-whale rules.
approve(address token, address spender, uint256 amount) external returns (bool):

Approves a spender to spend a specific amount of tokens on behalf of the caller.
transferFrom(address token, address sender, address recipient, uint256 amount) external antiWhale(token, recipient, amount) returns (bool):

Transfers tokens from a sender to a recipient, enforcing the anti-whale rules and the allowance mechanism.
antiWhale(address token, address recipient, uint256 amount) (modifier):

Ensures that token transfers adhere to the anti-whale percentage rules.
Events
TokenDeployed(address indexed tokenAddress, string symbol, string name):

Emitted when a new token is deployed.
FeeWithdrawn(address indexed recipient, uint256 amount):

Emitted when the fee collector withdraws the collected creation fees.
Transfer(address indexed from, address indexed to, uint256 value):

Emitted when tokens are transferred.
Approval(address indexed owner, address indexed spender, uint256 value):

Emitted when a token owner approves a spender.
