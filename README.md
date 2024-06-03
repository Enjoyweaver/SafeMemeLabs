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
