"use client"

import { degen } from "@/utils/degenChain"
import { configureChains, createConfig } from "wagmi"
import { avalanche, base, fantom, fantomTestnet, polygon } from "wagmi/chains"
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet"
import { InjectedConnector } from "wagmi/connectors/injected"
import { MetaMaskConnector } from "wagmi/connectors/metaMask"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { publicProvider } from "wagmi/providers/public"

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [avalanche, fantom, polygon, fantomTestnet, degen, base],
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

export const tokenDeployerDetails: { [key: string]: string } = {
  "666666666": "0x8c175417787c4beea7211d143423c8624c230b9b",
  "250": "0xe92163f8038843091c1df18f726cf04526ef9676",
  "137": "0x5746A1ec97d91c594e6042a7A42c8285C4c3A0EE",
  "64165": "0x5746a1ec97d91c594e6042a7a42c8285c4c3a0ee",
  "64240": "0x676e3fd472f437b86ee5203f5adf21b7687fddb5",
  "4002": "0x79b206abd08adc1b1c5d72ba7bd38d04511e985e",
  "8453": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25e",
  "43114": "0xe92163f8038843091c1df18f726cf04526ef9676",
}
export const multisendDetails: { [key: string]: string } = {
  "137": "0x8264289EA0D12c3DB03b79a56f4961Ff91612aE1",
  "250": "0xe1B8Fc8e02b9b2C8152dEB18c5D1f6C2b23f8a94",
  "4002": "0xeC4993Ab1a113A15e94c33748344954E15451d4e",
  "64165": "0x8264289EA0D12c3DB03b79a56f4961Ff91612aE1",
  "666666666": "0x29c4e664e50aa222a0f10de5233e0e1fd0bd9cc6",
  "8453": "0x29c4e664e50aa222a0f10de5233e0e1fd0bd9cc6",
  "43114": "0x8c175417787c4beea7211d143423c8624c230b9b",
}
