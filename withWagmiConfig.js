import React from "react"
import {
  avalanche,
  base,
  fantom,
  fantomTestnet,
  polygon,
  rootstock,
} from "@wagmi/core/chains"
import { WagmiConfig, configureChains, createConfig } from "wagmi"
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet"
import { InjectedConnector } from "wagmi/connectors/injected"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { publicProvider } from "wagmi/providers/public"

// Configure the chains and the provider
const { chains, provider, webSocketProvider } = configureChains(
  [fantom, polygon, fantomTestnet, rootstock, base, avalanche],
  [publicProvider()]
)

export const config = createConfig({
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

const withWagmiConfig = (Component) => {
  const WrappedComponent = (props) => (
    <WagmiConfig config={config}>
      <Component {...props} />
    </WagmiConfig>
  )

  // Set a display name for better debugging
  WrappedComponent.displayName = `withWagmiConfig(${
    Component.displayName || Component.name || "Component"
  })`

  return WrappedComponent
}

export default withWagmiConfig
