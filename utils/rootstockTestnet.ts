// utils/rootstockTestnet.ts
import { defineChain } from "viem"

export const rootstockTestnet = defineChain({
  id: 31,
  network: "rsk-testnet",
  name: "rsk-testnet",
  nativeCurrency: {
    name: "Testnet RBTC",
    symbol: "tRBTC",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://public-node.testnet.rsk.co"] },
    public: { http: ["https://public-node.testnet.rsk.co"] },
  },
  blockExplorers: {
    default: {
      name: "Rootstock Testnet Explorer",
      url: "https://explorer.testnet.rsk.co",
    },
  },
})
