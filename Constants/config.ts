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
  "4002": "0x79b206abd08adc1b1c5d72ba7bd38d04511e985f",
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
  "501": "https://explorer.solana.com/tx/", // Add Solana testnet block explorer URL
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
  "4002": "YourLockerAddressForFantomTestnetLaunched",
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
  "4002": "0x118a984d43d95adb18e4f5195923f69393589acb",
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
  "4002": "0xb68971834547e589c482d6ebbac390f1b64aff95",
  "64165": "YourRouterAddressForFantomTestnet2Launched",
  "666666666": "YourRouterAddressForDegenLaunched",
  "8453": "YourRouterAddressForDegen2Launched",
  "43114": "YourRouterAddressForAvalancheLaunched",
  "30": "YourRouterAddressForRootstockLaunched",
  "31": "YourRouterAddressForRootstockTestnetLaunched",
  "148": "YourRouterAddressForAnotherChainLaunched",
  "501": "YourRouterAddressForSolanaTestnetLaunched",
}

export const tokenBOptions: {
  [key: string]: { address: string; symbol: string }[]
} = {
  "4002": [
    { address: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83", symbol: "wFTM" },
    // Add more tokens if needed
  ],
  "250": [
    { address: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83", symbol: "wFTM" },
    // Add more tokens if needed
  ],
  // Add entries for other chains similarly
}

export const priceFeedAddresses: {
  [key: string]: { [token: string]: string }
} = {
  "4002": {
    "FTM/USD": "0xe04676B9A9A2973BCb0D1478b5E1E9098BBB7f3D",
    "wBTC/USD": "0x9Da678cE7f28aAeC8A578A1e414219049509a552",
    "ETH/USD": "0x11DdD3d147E5b83D01cee7070027092397d63658",
  },
  "250": {
    "FTM/USD": "0xf4766552D15AE4d256Ad41B6cf2933482B0680dc",
    "wBTC/USD": "0x9Da678cE7f28aAeC8A578A1e414219049509a552",
    "ETH/USD": "0x11DdD3d147E5b83D01cee7070027092397d63658",
  },
}
