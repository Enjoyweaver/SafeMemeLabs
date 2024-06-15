import React from "react"
import {
  avalanche,
  base,
  fantom,
  fantomTestnet,
  polygon,
  rootstock,
} from "@wagmi/core/chains"
import { Client, WagmiConfig, configureChains } from "wagmi"
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet"
import { InjectedConnector } from "wagmi/connectors/injected"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { publicProvider } from "wagmi/providers/public"

// Configure the chains and the provider
const { chains, provider, webSocketProvider } = configureChains(
  [fantom, polygon, fantomTestnet, rootstock, base, avalanche],
  [publicProvider()]
)

const client = new Client({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
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
  ],
  provider,
  webSocketProvider,
})

const withWagmiConfig = (Component) => (props) =>
  (
    <WagmiConfig client={client}>
      <Component {...props} />
    </WagmiConfig>
  )

export default withWagmiConfig
