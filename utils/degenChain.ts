// utils/degenChain.ts
import { defineChain } from "viem"

export const degen = defineChain({
  id: 666666666,
  network: "degen",
  name: "degen",
  nativeCurrency: {
    name: "Degen Coin",
    symbol: "DEGEN",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.degenchain.com"] },
    public: { http: ["https://rpc.degenchain.com"] },
  },
  blockExplorers: {
    default: {
      name: "Degen Explorer",
      url: "https://explorer.degenchain.com",
    },
  },
})
