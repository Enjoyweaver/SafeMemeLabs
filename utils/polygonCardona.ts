// utils/cardonaZkEvmTestnet.ts
import { defineChain } from "viem"

export const polygonZkEvmCardona = defineChain({
  id: 2442,
  network: "polygonZkEvmCardona",
  name: "Polygon Cardona zkEVM Testnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.cardona.zkevm-rpc.com"] },
    public: { http: ["https://rpc.cardona.zkevm-rpc.com"] },
  },
  blockExplorers: {
    default: {
      name: "Cardona zkEVM Polygonscan",
      url: "https://cardona-zkevm.polygonscan.com/",
    },
  },
})
