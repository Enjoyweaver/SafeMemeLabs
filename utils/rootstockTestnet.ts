import { defineChain } from "viem"

export const rootstockTestnet = defineChain({
  id: 31,
  network: "Rootstock Testnet", // Provide the appropriate network name here
  name: "rsk-testnet",
  nativeCurrency: {
    name: "tRBTC",
    symbol: "tRBTC",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://public-node.testnet.rsk.co"] },
    public: { http: ["https://public-node.testnet.rsk.co"] },
  },
  blockExplorers: {
    default: {
      name: "Rootstock Testnet",
      url: "https://public-node.testnet.rsk.co",
    },
  },
})
