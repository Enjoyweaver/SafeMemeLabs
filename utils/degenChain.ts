import { defineChain } from "viem";

export const degen = defineChain({
  id: 666666666,
  network: "Degen Network", // Provide the appropriate network name here
  name: "Degen",
  nativeCurrency: {
    name: "Degen Coin",
    symbol: "DEGEN",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.degen.tips"] },
    public: { http: ["https://rpc.degen.tips"] },
  },
  blockExplorers: {
    default: { name: "Degen Explorer", url: "https://explorer.degen.tips" },
  },
});
