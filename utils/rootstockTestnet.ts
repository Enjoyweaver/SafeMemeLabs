import { defineChain } from "viem"

export const degen = defineChain({
  id: 31,
  network: "Rootstock Testnet", // Provide the appropriate network name here
  name: "Rootstock Testnet",
  nativeCurrency: {
    name: "tRBTC",
    symbol: "tRBTC",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.degen.tips"] },
    public: { http: ["https://rpc.degen.tips"] },
  },
  blockExplorers: {
    default: { name: "Degen Explorer", url: "https://explorer.degen.tips" },
  },
})
