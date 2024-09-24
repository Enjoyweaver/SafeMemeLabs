import { defineChain } from "viem"

export const arbitrumSepolia = defineChain({
  id: 421614,
  network: "arbitrumSepolia",
  name: "arbitrumSepolia",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://arbitrum-sepolia.rpc.url"] },
    public: { http: ["https://arbitrum-sepolia.rpc.url"] },
  },
  blockExplorers: {
    default: {
      name: "Arbitrum Sepolia Explorer",
      url: "https://sepolia.arbiscan.io/",
    },
  },
})
