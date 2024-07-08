"use client"

import { degen } from "@/utils/degenChain"
import { rootstockTestnet } from "@/utils/rootstockTestnet"
import { solana } from "@/utils/solana"
import {
  avalanche,
  base,
  fantom,
  fantomTestnet,
  polygon,
  rootstock,
} from "@wagmi/core/chains"
import { configureChains, createConfig } from "wagmi"
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet"
import { InjectedConnector } from "wagmi/connectors/injected"
import { MetaMaskConnector } from "wagmi/connectors/metaMask"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { publicProvider } from "wagmi/providers/public"

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    fantom,
    polygon,
    fantomTestnet,
    degen,
    base,
    rootstock,
    rootstockTestnet,
    solana,
    avalanche,
  ],
  [publicProvider()]
)

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "SafeMeme Labs",
        appLogoUrl: "tbd",
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: "7d2cdf0341b6bef24d9efae208f93467",
        metadata: {
          name: "SafeMeme Labs",
          description: "Safe Meme Economy",
          url: "https://safememe.vercel.app",
          icons: ["tbd"],
        },
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

export const tokenDeployerDetails: {
  [key: string]: string
} = {
  "666666666": "0xe92163f8038843091c1df18f726cf04526ef9676",
  "250": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d6",
  "137": "0x5746A1ec97d91c594e6042a7A42c8285C4c3A0EE",
  "64165": "0x5746a1ec97d91c594e6042a7a42c8285c4c3a0ee",
  "64240": "0x676e3fd472f437b86ee5203f5adf21b7687fddb5",
  "4002": "0x79b206abd08adc1b1c5d72ba7bd38d04511e985e",
  "8453": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d6",
  "43114": "0xeaa2465a90803f6e26bfb65c5c0fa6efbc228430",
  "30": "0xe92163f8038843091c1df18f726cf04526ef9676",
  "31": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25e",
  "148": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25e",
  "501": "YourTokenAddressForSolanaTestnet",
}

export const tokenLauncherDetails: {
  [key: string]: string
} = {
  "666666666": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "250": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "137": "0x5746A1ec97d91c594e6042a7A42c8285C4c3A0EF",
  "64165": "0x5746a1ec97d91c594e6042a7a42c8285c4c3a0ef",
  "64240": "0x676e3fd472f437b86ee5203f5adf21b7687fddb6",
  "4002": "0xc88FfCd4f80DE8E20a09Fd8632b77f19035F9De4",
  "8453": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "43114": "0xeaa2465a90803f6e26bfb65c5c0fa6efbc228431",
  "30": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "31": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "148": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "501": "YourTokenAddressForSolanaTestnetLaunched",
}

export const multisendDetails: {
  [key: string]: { safeMemeToken: string; safeMemeTokenLaunched: string }
} = {
  "137": {
    safeMemeToken: "0x8264289EA0D12c3DB03b79a56f4961Ff91612aE1",
    safeMemeTokenLaunched: "0x8264289EA0D12c3DB03b79a56f4961Ff91612aE2",
  },
  "250": {
    safeMemeToken: "0xe1B8Fc8e02b9b2C8152dEB18c5D1f6C2b23f8a94",
    safeMemeTokenLaunched: "0xe1B8Fc8e02b9b2C8152dEB18c5D1f6C2b23f8a95",
  },
  "4002": {
    safeMemeToken: "0xeC4993Ab1a113A15e94c33748344954E15451d4e",
    safeMemeTokenLaunched: "0xeC4993Ab1a113A15e94c33748344954E15451d4f",
  },
  "64165": {
    safeMemeToken: "0x8264289EA0D12c3DB03b79a56f4961Ff91612aE1",
    safeMemeTokenLaunched: "0x8264289EA0D12c3DB03b79a56f4961Ff91612aE2",
  },
  "666666666": {
    safeMemeToken: "0x29c4e664e50aa222a0f10de5233e0e1fd0bd9cc6",
    safeMemeTokenLaunched: "0x29c4e664e50aa222a0f10de5233e0e1fd0bd9cc7",
  },
  "8453": {
    safeMemeToken: "0x29c4e664e50aa222a0f10de5233e0e1fd0bd9cc6",
    safeMemeTokenLaunched: "0x29c4e664e50aa222a0f10de5233e0e1fd0bd9cc7",
  },
  "43114": {
    safeMemeToken: "0x8c175417787c4beea7211d143423c8624c230b9b",
    safeMemeTokenLaunched: "0x8c175417787c4beea7211d143423c8624c230b9c",
  },
  "30": {
    safeMemeToken: "0x8c175417787c4beea7211d143423c8624c230b9b",
    safeMemeTokenLaunched: "0x8c175417787c4beea7211d143423c8624c230b9c",
  },
  "31": {
    safeMemeToken: "0x8c175417787c4beea7211d143423c8624c230b9b",
    safeMemeTokenLaunched: "0x8c175417787c4beea7211d143423c8624c230b9c",
  },
  "501": {
    safeMemeToken: "YourMultisendAddressForSolanaTestnet",
    safeMemeTokenLaunched: "YourMultisendAddressForSolanaTestnetLaunched",
  },
}

export const blockExplorerUrls: { [key: string]: string } = {
  "31": "https://explorer.testnet.rootstock.io/tx/",
  "250": "https://ftmscan.com/tx/",
  "4002": "https://testnet.ftmscan.com/tx/",
  "137": "https://polygonscan.com/tx/",
  "43114": "https://snowtrace.io/tx/",
  "30": "https://explorer.rsk.co/tx/",
  "666666666": "https://degenscan.io/tx/",
  "501": "https://explorer.solana.com/tx/",
  "84532": "https://sepolia-explorer.base.org",
}

export const blockExplorerAddress: { [key: string]: string } = {
  "31": "https://explorer.testnet.rootstock.io/address/",
  "250": "https://ftmscan.com/address/",
  "4002": "https://testnet.ftmscan.com/address/",
  "137": "https://polygonscan.com/address/",
  "43114": "https://snowtrace.io/address/",
  "30": "https://explorer.rsk.co/address/",
  "666666666": "https://degenscan.io/address/",
  "501": "https://explorer.solana.com/address/",
  "84532": "https://sepolia-explorer.base.org/address/",
}

export const blockExplorers: { [key: string]: string } = {
  "31": "https://explorer.testnet.rootstock.io/",
  "250": "https://ftmscan.com/",
  "4002": "https://testnet.ftmscan.com/",
  "137": "https://polygonscan.com/",
  "43114": "https://snowtrace.io/",
  "30": "https://explorer.rsk.co/",
  "666666666": "https://degenscan.io/",
  "501": "https://explorer.solana.com/",
  "84532": "https://sepolia.base.org",
}

export const chainIdToCovalentChainId: { [key: string]: string } = {
  250: "fantom-mainnet",
  4002: "fantom-testnet",
  31: "rsk-testnet",
  137: "matic-mainnet",
  43114: "avalanche-mainnet",
  30: "rsk-mainnet",
  501: "solana-mainnet",
}

export const lockerDetails: {
  [key: string]: string
} = {
  "137": "YourLockerAddressForPolygonLaunched",
  "250": "YourLockerAddressForFantomLaunched",
  "4002": "0x2bb471e62097f1579742f90e35158077d13221be",
  "64165": "YourLockerAddressForFantomTestnet2Launched",
  "666666666": "YourLockerAddressForDegenLaunched",
  "8453": "YourLockerAddressForDegen2Launched",
  "43114": "YourLockerAddressForAvalancheLaunched",
  "30": "YourLockerAddressForRootstockLaunched",
  "31": "YourLockerAddressForRootstockTestnetLaunched",
  "148": "YourLockerAddressForAnotherChainLaunched",
  "501": "YourLockerAddressForSolanaTestnetLaunched",
}

export const managerDetails: {
  [key: string]: string
} = {
  "137": "YourManagerAddressForPolygonLaunched",
  "250": "YourManagerAddressForFantomLaunched",
  "4002": "0x907aeec9cc50b7c3dcf1858901c1f2a672c59c99",
  "64165": "YourManagerAddressForFantomTestnet2Launched",
  "666666666": "YourManagerAddressForDegenLaunched",
  "8453": "YourManagerAddressForDegen2Launched",
  "43114": "YourManagerAddressForAvalancheLaunched",
  "30": "YourManagerAddressForRootstockLaunched",
  "31": "YourManagerAddressForRootstockTestnetLaunched",
  "148": "YourManagerAddressForAnotherChainLaunched",
  "501": "YourManagerAddressForSolanaTestnetLaunched",
}

export const routerDetails: {
  [key: string]: string
} = {
  "137": "YourRouterAddressForPolygonLaunched",
  "250": "YourRouterAddressForFantomLaunched",
  "4002": "0x575b62e0064b377afe6317b4432c681959815f24",
  "64165": "YourRouterAddressForFantomTestnet2Launched",
  "666666666": "YourRouterAddressForDegenLaunched",
  "8453": "YourRouterAddressForDegen2Launched",
  "43114": "YourRouterAddressForAvalancheLaunched",
  "30": "YourRouterAddressForRootstockLaunched",
  "31": "YourRouterAddressForRootstockTestnetLaunched",
  "148": "YourRouterAddressForAnotherChainLaunched",
  "501": "YourRouterAddressForSolanaTestnetLaunched",
}

export const senderDetails: { [key: string]: string } = {
  "137": "YourOracleAddressForPolygon",
  "250": "YourOracleAddressForFantom",
  "4002": "0x2620762c2ae51b3c6bb8b18e9b371b3db1458dd5",
  "64165": "YourOracleAddressForFantomTestnet2",
  "666666666": "YourOracleAddressForDegen",
  "8453": "YourOracleAddressForDegen2",
  "43114": "YourOracleAddressForAvalanche",
  "30": "YourOracleAddressForRootstock",
  "31": "YourOracleAddressForRootstockTestnet",
  "148": "YourOracleAddressForAnotherChain",
  "501": "YourOracleAddressForSolanaTestnet",
}

export const oracleDetails: { [key: string]: string } = {
  "137": "YourOracleAddressForPolygon",
  "250": "YourOracleAddressForFantom",
  "4002": "0xc21765271ddc445ccffa71fac875d5c20cc25fd5",
  "64165": "YourOracleAddressForFantomTestnet2",
  "666666666": "YourOracleAddressForDegen",
  "8453": "YourOracleAddressForDegen2",
  "43114": "YourOracleAddressForAvalanche",
  "30": "YourOracleAddressForRootstock",
  "31": "YourOracleAddressForRootstockTestnet",
  "148": "YourOracleAddressForAnotherChain",
  "501": "YourOracleAddressForSolanaTestnet",
}

export const NativeTokens: {
  [key: string]: { address: string; symbol: string }[]
} = {
  "4002": [
    { address: "0x9BFbF5219184C28A3bc6eBc5F07e247739bdFea3", symbol: "FTM" },
  ],
  "250": [
    { address: "0x4e15361fd6b4bb609fa63c81a2be19d873717870", symbol: "FTM" },
  ],
  "137": [
    { address: "0x0000000000000000000000000000000000001010", symbol: "MATIC" },
  ],
  "43114": [
    {
      address: "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z",
      symbol: "AVAX",
    },
  ],
  "30": [
    { address: "0x542fDA317318eBF1d3DEAf76E0b632741A7e677d", symbol: "RBTC" },
  ],
  "31": [
    { address: "0x542fDA317318eBF1d3DEAf76E0b632741A7e677d", symbol: "tRBTC" },
  ],
  "1337": [
    { address: "0x0000000000000000000000000000000000000000", symbol: "BTC" },
  ],
  "1": [
    { address: "0x4e15361fd6b4bb609fa63c81a2be19d873717870", symbol: "FTM" },
  ],
}

export const priceFeedAddresses: {
  [key: string]: { [token: string]: string }
} = {
  "4002": {
    "FTM/USD": "0xe04676B9A9A2973BCb0D1478b5E1E9098BBB7f3D",
    "wBTC/USD": "0x65E8d79f3e8e36fE48eC31A2ae935e92F5bBF529",
    "ETH/USD": "0xB8C458C957a6e6ca7Cc53eD95bEA548c52AFaA24",
  },
  "250": {
    "FTM/USD": "0xf4766552D15AE4d256Ad41B6cf2933482B0680dc",
    "wFTM/USD": "0xf4766552D15AE4d256Ad41B6cf2933482B0680dc",
    "wBTC/USD": "0x9Da678cE7f28aAeC8A578A1e414219049509a552",
    "ETH/USD": "0x11DdD3d147E5b83D01cee7070027092397d63658",
  },
  "666666666": {
    "BTC/USD": "0x64c911996D3c6aC71f9b455B1E8E7266BcbD848F",
    "ETH/USD": "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
    "DEGEN/USD": "0xE62BcE5D7CB9d16AB8b4D622538bc0A50A5799c2",
    "SOL/USD": "0x975043adBb80fc32276CbF9Bbcfd4A601a12462D",
    "USDC/USD": "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
  },
  "137": {
    "MATIC/USD": "0xab594600376ec9fd91f8e885dadf0ce036862de0",
    "wBTC/USD": "0xde31f8bfbd8c84b5360cfacca3539b938dd78ae6",
    "ETH/USD": "0xF9680D99D6C9589e2a93a78A04A279e509205945",
  },
  "43114": {
    "AVAX/USD": "0x0a77230d17318075983913bc2145db16c7366156",
    "wBTC/USD": "0x2779d32d5166baaa2a39b69a1b7a8080bcdc26ff",
    "ETH/USD": "0x86d67c3d38d2bce8da5a2d8e032e2001fa8ec7ea",
  },
  "1337": {
    "BTC/USD": "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43", // Sepolia testnet price feed for BTC
  },
}

export const rpcUrls: { [key: string]: string } = {
  "4002": "https://rpc.testnet.fantom.network/",
  "250": "https://rpc.ankr.com/fantom/",
  "137": "https://polygon-rpc.com/",
  "43114": "https://api.avax.network/ext/bc/C/rpc",
  "30": "https://public-node.rsk.co",
  "31": "https://public-node.testnet.rsk.co",
  "1337": "https://rpc.ankr.com/eth_sepolia",
}

export const tokenSaleDetails: { [key: string]: string } = {
  "666666666": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "250": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "137": "0x5746A1ec97d91c594e6042a7A42c8285C4c3A0EF",
  "64165": "0x5746a1ec97d91c594e6042a7a42c8285c4c3a0ef",
  "64240": "0x676e3fd472f437b86ee5203f5adf21b7687fddb6",
  "4002": "0xc88FfCd4f80DE8E20a09Fd8632b77f19035F9De4",
  "8453": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "43114": "0xeaa2465a90803f6e26bfb65c5c0fa6efbc228431",
  "30": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "31": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "148": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "501": "YourTokenAddressForSolanaTestnetLaunched",
}

export const tokenClaimDetails: { [key: string]: string } = {
  "666666666": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "250": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "137": "0x5746A1ec97d91c594e6042a7A42c8285C4c3A0EF",
  "64165": "0x5746a1ec97d91c594e6042a7a42c8285c4c3a0ef",
  "64240": "0x676e3fd472f437b86ee5203f5adf21b7687fddb6",
  "4002": "0x1889c363Ea9a0f2b1505F05716BA62DCF889b4d7",
  "8453": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "43114": "0xeaa2465a90803f6e26bfb65c5c0fa6efbc228431",
  "30": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "31": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "148": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "501": "YourTokenAddressForSolanaTestnetLaunched",
}

export const poolAddressDetails: { [key: string]: string } = {
  "666666666": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "250": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "137": "0x5746A1ec97d91c594e6042a7A42c8285C4c3A0EF",
  "64165": "0x5746a1ec97d91c594e6042a7a42c8285c4c3a0ef",
  "64240": "0x676e3fd472f437b86ee5203f5adf21b7687fddb6",
  "4002": "0x1889c363Ea9a0f2b1505F05716BA62DCF889b4d7",
  "8453": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "43114": "0xeaa2465a90803f6e26bfb65c5c0fa6efbc228431",
  "30": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "31": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "148": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "501": "YourTokenAddressForSolanaTestnetLaunched",
}

export const vyperExchangeDetails: { [key: string]: string } = {
  "666666666": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "250": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "137": "0x5746A1ec97d91c594e6042a7A42c8285C4c3A0EF",
  "64165": "0x5746a1ec97d91c594e6042a7a42c8285c4c3a0ef",
  "64240": "0x676e3fd472f437b86ee5203f5adf21b7687fddb6",
  "4002": "0x88a005d9c0Fb4607210124f14031A73590899647",
  "8453": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "43114": "0xeaa2465a90803f6e26bfb65c5c0fa6efbc228431",
  "30": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "31": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "148": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "501": "YourTokenAddressForSolanaTestnetLaunched",
}

export const vyperExchangeFactoryDetails: { [key: string]: string } = {
  "666666666": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "250": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "137": "0x5746A1ec97d91c594e6042a7A42c8285C4c3A0EF",
  "64165": "0x5746a1ec97d91c594e6042a7a42c8285c4c3a0ef",
  "64240": "0x676e3fd472f437b86ee5203f5adf21b7687fddb6",
  "4002": "0xb10650f1957dcCf7f16b01AB24D825d70A5B9A85",
  "8453": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "43114": "0xeaa2465a90803f6e26bfb65c5c0fa6efbc228431",
  "30": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "31": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "148": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "501": "YourTokenAddressForSolanaTestnetLaunched",
}
export const tokenExchangeTemplateDetails: { [key: string]: string } = {
  "666666666": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "250": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "137": "0x5746A1ec97d91c594e6042a7A42c8285C4c3A0EF",
  "64165": "0x5746a1ec97d91c594e6042a7a42c8285c4c3a0ef",
  "64240": "0x676e3fd472f437b86ee5203f5adf21b7687fddb6",
  "4002": "0x3A14373cCA55429a4F2A8F3970DAa0406c31EE91",
  "8453": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "43114": "0xeaa2465a90803f6e26bfb65c5c0fa6efbc228431",
  "30": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "31": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "148": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "501": "YourTokenAddressForSolanaTestnetLaunched",
}

export const frameFactoryDetails: {
  [key: string]: string
} = {
  "137": "0xYourVyperTokenAddressForPolygon",
  "250": "0xYourVyperTokenAddressForFantom",
  "4002": "0x04Acaf5ECED5f0E6f82d8dD361185e38B41CF34E",
  "84532": "0x04Acaf5ECED5f0E6f82d8dD361185e38B41CF34E",
}

export const tokenVyperDetails: {
  [key: string]: string
} = {
  "4002": "0x481288b985e932AD70dd4699AdB471D1B633b361",
}

export const masterVyperTokenCopy: {
  [key: string]: string
} = {
  "4002": "0x0FF5bEAA6be40072D3bB1D713Ce6Ba05be59b69A",
}

export const safeMemeTemplate: {
  [key: string]: string
} = {
  "4002": "0xd6Dfe919eBd9905deE563C89cF70D165c74BAA70",
}

export const safeLaunchFactory: {
  [key: string]: string
} = {
  "4002": "0x4ec722769566dF9Fd7A0f157AF311002898EFbE2",
}

export const exchangeTemplate: {
  [key: string]: string
} = {
  "4002": "0xc585990a681BE3F73aEF6cd60317023AfD19817a",
}

export const exchangeFactory: {
  [key: string]: string
} = {
  "4002": "0xC198564a5aB773E9Da718Bd949Cd807360BF8c2a",
}
