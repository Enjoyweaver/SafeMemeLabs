import { defineChain } from "viem"

export const sonicTestnet = defineChain({
  id: 31,
  network: "sonictestnet",
  name: "sonictestnet",
  nativeCurrency: {
    name: "Sonic Builders Testnet",
    symbol: "FTM",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.sonic.fantom.network/"] },
    public: { http: ["https://rpc.sonic.fantom.network/"] },
  },
  blockExplorers: {
    default: {
      name: "Sonic Testnet Explorer",
      url: "https://public-sonic.fantom.network",
    },
  },
})
