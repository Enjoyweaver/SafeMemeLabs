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

$$\      $$\                                    
$$$\    $$$ |  
$$$$\ $$$$ |
$$\$$\$$ $$ | 
$$ \$$$ $$ |
$$ |\$ /$$ |
$$ | \_/ $$ |
\_\_| \_\_|

hndl roostock: https://rootstock-testnet.blockscout.com/address/0x6eaeFfe712A4f42cf5Fd8cfa189673D5BeC1D6C0?tab=read_contract

```
-root directory
-/app
--layout.tsx (with wagmi config)
--/(marketing)
---/profile
----page.tsx (users profile page)
-withWagmiConfig.js
-/public
-/profile -[walletAddress].js
-/hardhat
├── contracts/
│ ├── Claim.sol
│ ├── extensions/
│ │ ├── Address.sol
│ │ ├── Multicall.sol
│ │ ├── ContractMetadata.sol
│ │ ├── PlatformFee.sol
│ │ ├── PrimarySale.sol
│ │ ├── PermissionsEnumerable.sol
│ │ ├── Drop.sol
│ ├── external-deps/
│ │ ├── openzeppelin/
│ │ │ ├── metatx/
│ │ │ │ ├── ERC2771ContextUpgradeable.sol
│ │ │ ├── token/
│ │ │ │ ├── ERC20/
│ │ │ │ │ ├── utils/
│ │ │ │ │ │ ├── SafeERC20.sol
│ ├── interfaces/
│ │ ├── IContractMetadata.sol
│ ├── lib/
│ │ ├── CurrencyTransferLib.sol
│ ├── infra/
│ │ ├── interface/
│ │ │ ├── IWETH.sol
│ ├── vyper/
│ │ ├── VyperPool.vy
│
├── scripts/
│ ├── deploy_vyper.js
│ ├── prepare_vyper_pools.js
│
├── hardhat.config.js
├── hardhat.config.vyper.js
```

-root directory
-/app
--layout.tsx (with wagmi config)
--/(marketing)
---/profile
----page.tsx (users profile page)
-withWagmiConfig.js
-/public
-/profile -[walletAddress].js
-/hardhat
├── contracts/
│ ├── Claim.sol
│ ├── extensions/
│ │ ├── Address.sol
│ │ ├── Multicall.sol
│ │ ├── ContractMetadata.sol
│ │ ├── PlatformFee.sol
│ │ ├── PrimarySale.sol
│ │ ├── PermissionsEnumerable.sol
│ │ ├── Drop.sol
│ ├── external-deps/
│ │ ├── openzeppelin/
│ │ │ ├── metatx/
│ │ │ │ ├── ERC2771ContextUpgradeable.sol
│ │ │ ├── token/
│ │ │ │ ├── ERC20/
│ │ │ │ │ ├── utils/
│ │ │ │ │ │ ├── SafeERC20.sol
│ ├── interfaces/
│ │ ├── IContractMetadata.sol
│ ├── lib/
│ │ ├── CurrencyTransferLib.sol
│ ├── infra/
│ │ ├── interface/
│ │ │ ├── IWETH.sol
│ ├── vyper/
│ │ ├── VyperPool.vy
│
├── scripts/
│ ├── deploy_vyper.js
│ ├── prepare_vyper_pools.js
│
├── hardhat.config.js
├── hardhat.config.vyper.js
