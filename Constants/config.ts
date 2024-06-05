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
  [key: string]: { safeMemeToken: string; safeMemeTokenLaunched: string }
} = {
  "666666666": {
    safeMemeToken: "0xe92163f8038843091c1df18f726cf04526ef9676",
    safeMemeTokenLaunched: "0xe92163f8038843091c1df18f726cf04526ef9677",
  },
  "250": {
    safeMemeToken: "0x396652c3fc3273b5946bdfe7b558a00a57ed27d6",
    safeMemeTokenLaunched: "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  },
  "137": {
    safeMemeToken: "0x5746A1ec97d91c594e6042a7A42c8285C4c3A0EE",
    safeMemeTokenLaunched: "0x5746A1ec97d91c594e6042a7A42c8285C4c3A0EF",
  },
  "64165": {
    safeMemeToken: "0x5746a1ec97d91c594e6042a7a42c8285c4c3a0ee",
    safeMemeTokenLaunched: "0x5746a1ec97d91c594e6042a7a42c8285c4c3a0ef",
  },
  "64240": {
    safeMemeToken: "0x676e3fd472f437b86ee5203f5adf21b7687fddb5",
    safeMemeTokenLaunched: "0x676e3fd472f437b86ee5203f5adf21b7687fddb6",
  },
  "4002": {
    safeMemeToken: "0x79b206abd08adc1b1c5d72ba7bd38d04511e985e",
    safeMemeTokenLaunched: "0x79b206abd08adc1b1c5d72ba7bd38d04511e985f",
  },
  "8453": {
    safeMemeToken: "0x396652c3fc3273b5946bdfe7b558a00a57ed27d6",
    safeMemeTokenLaunched: "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  },
  "43114": {
    safeMemeToken: "0xeaa2465a90803f6e26bfb65c5c0fa6efbc228430",
    safeMemeTokenLaunched: "0xeaa2465a90803f6e26bfb65c5c0fa6efbc228431",
  },
  "30": {
    safeMemeToken: "0xe92163f8038843091c1df18f726cf04526ef9676",
    safeMemeTokenLaunched: "0xe92163f8038843091c1df18f726cf04526ef9677",
  },
  "31": {
    safeMemeToken: "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25e",
    safeMemeTokenLaunched: "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  },
  "148": {
    safeMemeToken: "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25e",
    safeMemeTokenLaunched: "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  },
  "501": {
    safeMemeToken: "YourTokenAddressForSolanaTestnet",
    safeMemeTokenLaunched: "YourTokenAddressForSolanaTestnetLaunched",
  },
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
  [key: string]: { safeMemeToken: string; safeMemeTokenLaunched: string }
} = {
  "137": {
    safeMemeToken: "YourLockerAddressForPolygon",
    safeMemeTokenLaunched: "YourLockerAddressForPolygonLaunched",
  },
  "250": {
    safeMemeToken: "YourLockerAddressForFantom",
    safeMemeTokenLaunched: "YourLockerAddressForFantomLaunched",
  },
  "4002": {
    safeMemeToken: "YourLockerAddressForFantomTestnet",
    safeMemeTokenLaunched: "YourLockerAddressForFantomTestnetLaunched",
  },
  "64165": {
    safeMemeToken: "YourLockerAddressForFantomTestnet2",
    safeMemeTokenLaunched: "YourLockerAddressForFantomTestnet2Launched",
  },
  "666666666": {
    safeMemeToken: "YourLockerAddressForDegen",
    safeMemeTokenLaunched: "YourLockerAddressForDegenLaunched",
  },
  "8453": {
    safeMemeToken: "YourLockerAddressForDegen2",
    safeMemeTokenLaunched: "YourLockerAddressForDegen2Launched",
  },
  "43114": {
    safeMemeToken: "YourLockerAddressForAvalanche",
    safeMemeTokenLaunched: "YourLockerAddressForAvalancheLaunched",
  },
  "30": {
    safeMemeToken: "YourLockerAddressForRootstock",
    safeMemeTokenLaunched: "YourLockerAddressForRootstockLaunched",
  },
  "31": {
    safeMemeToken: "YourLockerAddressForRootstockTestnet",
    safeMemeTokenLaunched: "YourLockerAddressForRootstockTestnetLaunched",
  },
  "148": {
    safeMemeToken: "YourLockerAddressForAnotherChain",
    safeMemeTokenLaunched: "YourLockerAddressForAnotherChainLaunched",
  },
  "501": {
    safeMemeToken: "YourLockerAddressForSolanaTestnet",
    safeMemeTokenLaunched: "YourLockerAddressForSolanaTestnetLaunched",
  },
}

export const managerDetails: {
  [key: string]: { safeMemeToken: string; safeMemeTokenLaunched: string }
} = {
  "137": {
    safeMemeToken: "YourManagerAddressForPolygon",
    safeMemeTokenLaunched: "YourManagerAddressForPolygonLaunched",
  },
  "250": {
    safeMemeToken: "YourManagerAddressForFantom",
    safeMemeTokenLaunched: "YourManagerAddressForFantomLaunched",
  },
  "4002": {
    safeMemeToken: "0x118a984d43d95adb18e4f5195923f69393589aca",
    safeMemeTokenLaunched: "0x118a984d43d95adb18e4f5195923f69393589acb",
  },
  "64165": {
    safeMemeToken: "YourManagerAddressForFantomTestnet2",
    safeMemeTokenLaunched: "YourManagerAddressForFantomTestnet2Launched",
  },
  "666666666": {
    safeMemeToken: "YourManagerAddressForDegen",
    safeMemeTokenLaunched: "YourManagerAddressForDegenLaunched",
  },
  "8453": {
    safeMemeToken: "YourManagerAddressForDegen2",
    safeMemeTokenLaunched: "YourManagerAddressForDegen2Launched",
  },
  "43114": {
    safeMemeToken: "YourManagerAddressForAvalanche",
    safeMemeTokenLaunched: "YourManagerAddressForAvalancheLaunched",
  },
  "30": {
    safeMemeToken: "YourManagerAddressForRootstock",
    safeMemeTokenLaunched: "YourManagerAddressForRootstockLaunched",
  },
  "31": {
    safeMemeToken: "YourManagerAddressForRootstockTestnet",
    safeMemeTokenLaunched: "YourManagerAddressForRootstockTestnetLaunched",
  },
  "148": {
    safeMemeToken: "YourManagerAddressForAnotherChain",
    safeMemeTokenLaunched: "YourManagerAddressForAnotherChainLaunched",
  },
  "501": {
    safeMemeToken: "YourManagerAddressForSolanaTestnet",
    safeMemeTokenLaunched: "YourManagerAddressForSolanaTestnetLaunched",
  },
}

export const routerDetails: {
  [key: string]: { safeMemeToken: string; safeMemeTokenLaunched: string }
} = {
  "137": {
    safeMemeToken: "YourRouterAddressForPolygon",
    safeMemeTokenLaunched: "YourRouterAddressForPolygonLaunched",
  },
  "250": {
    safeMemeToken: "YourRouterAddressForFantom",
    safeMemeTokenLaunched: "YourRouterAddressForFantomLaunched",
  },
  "4002": {
    safeMemeToken: "0xb68971834547e589c482d6ebbac390f1b64aff94",
    safeMemeTokenLaunched: "0xb68971834547e589c482d6ebbac390f1b64aff95",
  },
  "64165": {
    safeMemeToken: "YourRouterAddressForFantomTestnet2",
    safeMemeTokenLaunched: "YourRouterAddressForFantomTestnet2Launched",
  },
  "666666666": {
    safeMemeToken: "YourRouterAddressForDegen",
    safeMemeTokenLaunched: "YourRouterAddressForDegenLaunched",
  },
  "8453": {
    safeMemeToken: "YourRouterAddressForDegen2",
    safeMemeTokenLaunched: "YourRouterAddressForDegen2Launched",
  },
  "43114": {
    safeMemeToken: "YourRouterAddressForAvalanche",
    safeMemeTokenLaunched: "YourRouterAddressForAvalancheLaunched",
  },
  "30": {
    safeMemeToken: "YourRouterAddressForRootstock",
    safeMemeTokenLaunched: "YourRouterAddressForRootstockLaunched",
  },
  "31": {
    safeMemeToken: "YourRouterAddressForRootstockTestnet",
    safeMemeTokenLaunched: "YourRouterAddressForRootstockTestnetLaunched",
  },
  "148": {
    safeMemeToken: "YourRouterAddressForAnotherChain",
    safeMemeTokenLaunched: "YourRouterAddressForAnotherChainLaunched",
  },
  "501": {
    safeMemeToken: "YourRouterAddressForSolanaTestnet",
    safeMemeTokenLaunched: "YourRouterAddressForSolanaTestnetLaunched",
  },
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
