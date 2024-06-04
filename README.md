# SafeMeme Labs

We create safememes so you can invest safely, predictably, and to have fun along the way.

## Features

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
