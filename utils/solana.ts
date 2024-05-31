// utils/solana.ts
export const solana = {
  id: 501, // Solana Testnet ID
  network: "solana-testnet",
  name: "solana-testnet",
  nativeCurrency: {
    name: "Testnet SOL",
    symbol: "tSOL",
    decimals: 9,
  },
  rpcUrls: {
    default: { http: ["https://api.testnet.solana.com"] },
    public: { http: ["https://api.testnet.solana.com"] },
  },
  blockExplorers: {
    default: {
      name: "Solana Testnet Explorer",
      url: "https://explorer.solana.com/?cluster=testnet",
    },
  },
}
