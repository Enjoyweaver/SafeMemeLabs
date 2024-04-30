// wagmiConfig.ts

import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { createStorage, cookieStorage } from "wagmi";
import { base, baseGoerli, baseSepolia } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string;

const metadata = {
  name: "Degen Token",
  description: "Degen Token",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const chains = [base, baseGoerli, baseSepolia];

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});
