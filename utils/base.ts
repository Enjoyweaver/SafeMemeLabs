// utils/baseSepolia.ts

import { Chain } from "wagmi"

export const baseSepolia: Chain = {
  id: 84532,
  name: "Base Sepolia",
  network: "baseSepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.notadegen.com/base/sepolia"] },
    public: { http: ["https://rpc.notadegen.com/base/sepolia"] },
  },
  blockExplorers: {
    default: {
      name: "Base Sepolia Explorer",
      url: "https://base-sepolia.blockscout.com",
    },
  },
}
