import { defineChain } from "viem"

export const sonicTestnet = defineChain({
  id: 64165,
  network: "Sonic Testnet",
  name: "Sonic Testnet",
  nativeCurrency: {
    name: "Sonic Testnet",
    symbol: "S",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.soniclabs.com"] },
    public: { http: ["https://rpc.testnet.soniclabs.com"] },
  },
  blockExplorers: {
    default: {
      name: "Sonic Testnet Explorer",
      url: "https://testnet.soniclabs.com/",
    },
  },
})
