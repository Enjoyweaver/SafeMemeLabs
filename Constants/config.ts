"use client"

import { arbitrumSepolia } from "@/utils/arbitrumSepolia"
import { baseSepolia } from "@/utils/base"
import { polygonZkEvmCardona } from "@/utils/polygonCardona"
import { rootstockTestnet } from "@/utils/rootstockTestnet"
import { solana } from "@/utils/solana"
import { sonicTestnet } from "@/utils/sonic"
import {
  avalanche,
  avalancheFuji,
  base,
  cronosTestnet,
  fantom,
  fantomTestnet,
  lineaTestnet,
  optimismGoerli,
  polygon,
  polygonZkEvmTestnet,
  scrollTestnet,
  sepolia,
} from "@wagmi/core/chains"
import { configureChains, createConfig } from "wagmi"
import { InjectedConnector } from "wagmi/connectors/injected"
import { MetaMaskConnector } from "wagmi/connectors/metaMask"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { publicProvider } from "wagmi/providers/public"

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    fantom,
    arbitrumSepolia,
    base,
    baseSepolia,
    cronosTestnet,
    polygon,
    polygonZkEvmTestnet,
    polygonZkEvmCardona,
    fantomTestnet,
    rootstockTestnet,
    lineaTestnet,
    optimismGoerli,
    solana,
    avalanche,
    avalancheFuji,
    sonicTestnet,
    scrollTestnet,
    sepolia,
  ],
  [publicProvider()]
)

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: "7d2cdf0341b6bef24d9efae208f93467",
        metadata: {
          name: "SafeMeme Labs",
          description: "Creating the Safe Meme Economy",
          url: "https://SafeMemes.fun",
          icons: ["tbd"],
        },
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: "Rabby",
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

export const rpcUrls: { [key: string]: string } = {
  "4002": "https://rpc.testnet.fantom.network/",
  "250": "https://rpc.ankr.com/fantom/",
  "137": "https://polygon-rpc.com/",
  "43114": "https://api.avax.network/ext/bc/C/rpc",
  "30": "https://public-node.rsk.co",
  "31": "https://public-node.testnet.rsk.co",
  "1337": "https://rpc.ankr.com/eth_sepolia",
  "64165": "https://rpc.testnet.soniclabs.com",
  "421613": "https://goerli.arbitrum.io/rpc",
  "338": "https://evm-t3.cronos.org/",
  "1442": "https://rpc.zkevm-test.net/",
  "11155111": "https://rpc.sepolia.org/",
  "43113": "https://api.avax-test.network/ext/bc/C/rpc",
  "421614": "https://arbitrum-sepolia.blockpi.network/v1/rpc/public ",
}

export const blockExplorerUrls: { [key: string]: string } = {
  "31": "https://explorer.testnet.rootstock.io/tx/",
  "250": "https://ftmscan.com/tx/",
  "4002": "https://testnet.ftmscan.com/tx/",
  "137": "https://polygonscan.com/tx/",
  "43114": "https://snowtrace.io/tx/",
  "30": "https://explorer.rsk.co/tx/",
  "666666666": "https://degenscan.io/tx/",
  "501": "https://explorer.solana.com/tx/",
  "84532": "https://sepolia-explorer.base.org/tx/",
  "64165": "https://rpc.testnet.soniclabs.com/tx/",
  "421613": "https://goerli.arbiscan.io/tx/",
  "338": "https://cronos.org/explorer/testnet3/tx/",
  "80001": "https://mumbai.polygonscan.com/tx/",
  "1442": "https://zk-evm-testnet.polygonscan.com/tx/",
  "11155111": "https://sepolia.etherscan.io/tx/",
  "421614": "https://sepolia-explorer.arbitrum.io",
  "43113": "https://testnet.snowtrace.io",
}

export const blockExplorerAddress: { [key: string]: string } = {
  "31": "https://explorer.testnet.rootstock.io/address/",
  "250": "https://ftmscan.com/address/",
  "4002": "https://testnet.ftmscan.com/address/",
  "137": "https://polygonscan.com/address/",
  "43114": "https://snowtrace.io/address/",
  "30": "https://explorer.rsk.co/address/",
  "666666666": "https://degenscan.io/address/",
  "501": "https://explorer.solana.com/address/",
  "84532": "https://sepolia-explorer.base.org/address/",
  "64165": "https://rpc.testnet.soniclabs.com/address/",
  "421613": "https://goerli.arbiscan.io/address/",
  "338": "https://cronos.org/explorer/testnet3/address/",
  "80001": "https://mumbai.polygonscan.com/address/",
  "1442": "https://zk-evm-testnet.polygonscan.com/address/",
  "11155111": "https://sepolia.etherscan.io/address/",
}

export const blockExplorerToken: { [key: string]: string } = {
  "31": "https://explorer.testnet.rootstock.io/token/",
  "250": "https://ftmscan.com/token/",
  "4002": "https://testnet.ftmscan.com/token/",
  "137": "https://polygonscan.com/token/",
  "43114": "https://snowtrace.io/token/",
  "30": "https://explorer.rsk.co/token/",
  "666666666": "https://degenscan.io/token/",
  "501": "https://explorer.solana.com/token/",
  "84532": "https://sepolia-explorer.base.org/token/",
  "64165": "https://rpc.testnet.soniclabs.com/token/",
  "421613": "https://goerli.arbiscan.io/token/",
  "338": "https://cronos.org/explorer/testnet3/token/",
  "80001": "https://mumbai.polygonscan.com/token/",
  "1442": "https://zk-evm-testnet.polygonscan.com/token/",
  "11155111": "https://sepolia.etherscan.io/token/",
}

export const blockExplorers: { [key: string]: string } = {
  "31": "https://explorer.testnet.rootstock.io/",
  "250": "https://ftmscan.com/",
  "4002": "https://testnet.ftmscan.com/",
  "137": "https://polygonscan.com/",
  "43114": "https://snowtrace.io/",
  "30": "https://explorer.rsk.co/",
  "666666666": "https://degenscan.io/",
  "501": "https://explorer.solana.com/",
  "84532": "https://sepolia.base.org/",
  "64165": "https://rpc.testnet.soniclabs.com/",
  "421613": "https://goerli.arbiscan.io/",
  "338": "https://cronos.org/explorer/testnet3/",
  "80001": "https://mumbai.polygonscan.com/",
  "1442": "https://zk-evm-testnet.polygonscan.com/",
  "11155111": "https://sepolia.etherscan.io/",
}

export const chainIdToCovalentChainId: { [key: string]: string } = {
  250: "fantom-mainnet",
  4002: "fantom-testnet",
  31: "rsk-testnet",
  137: "matic-mainnet",
  43114: "avalanche-mainnet",
  30: "rsk-mainnet",
  501: "solana-mainnet",
  421614: "arbitrum-sepolia",
  338: "cronos-testnet",
  80001: "polygon-mumbai",
  1442: "polygon-zkevm-testnet",
  11155111: "sepolia",
  64165: "sonic-testnet",
  43113: "avalancheFuji-testnet",
}

export const NativeTokens: {
  [key: string]: { address: string; symbol: string }[]
} = {
  "4002": [
    { address: "0xe04676B9A9A2973BCb0D1478b5E1E9098BBB7f3D", symbol: "tFTM" },
  ],
  "250": [
    { address: "0x4e15361fd6b4bb609fa63c81a2be19d873717870", symbol: "FTM" },
  ],
  "137": [
    { address: "0x0000000000000000000000000000000000001010", symbol: "MATIC" },
  ],
  "43114": [
    {
      address: "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z",
      symbol: "AVAX",
    },
  ],
  "501": [
    { address: "So11111111111111111111111111111111111111112", symbol: "SOL" },
  ],
  "84532": [{ address: "0xYourAddressHere", symbol: "YOUR_SYMBOL" }],
  "64165": [{ address: "0xYourSonicTestnetTokenAddress", symbol: "SONIC" }],
  "421613": [{ address: "0xYourArbitrumGoerliTokenAddress", symbol: "ARB" }],
  "338": [{ address: "0xYourCronosTestnetTokenAddress", symbol: "CRO" }],
  "80001": [{ address: "0xYourPolygonMumbaiTokenAddress", symbol: "MATIC" }],
  "1442": [
    { address: "0xYourPolygonZkEvmTestnetTokenAddress", symbol: "ZKETH" },
  ],
  "11155111": [{ address: "0xYourSepoliaTokenAddress", symbol: "ETH" }],
}

export const priceFeedAddresses: {
  [key: string]: { [token: string]: string }
} = {
  "4002": {
    "FTM/USD": "0xe04676B9A9A2973BCb0D1478b5E1E9098BBB7f3D",
    "wBTC/USD": "0x65E8d79f3e8e36fE48eC31A2ae935e92F5bBF529",
    "ETH/USD": "0xB8C458C957a6e6ca7Cc53eD95bEA548c52AFaA24",
  },
  "250": {
    "FTM/USD": "0xf4766552D15AE4d256Ad41B6cf2933482B0680dc",
    "wFTM/USD": "0xf4766552D15AE4d256Ad41B6cf2933482B0680dc",
    "wBTC/USD": "0x9Da678cE7f28aAeC8A578A1e414219049509a552",
    "ETH/USD": "0x11DdD3d147E5b83D01cee7070027092397d63658",
  },
  "666666666": {
    "BTC/USD": "0x64c911996D3c6aC71f9b455B1E8E7266BcbD848F",
    "ETH/USD": "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
    "DEGEN/USD": "0xE62BcE5D7CB9d16AB8b4D622538bc0A50A5799c2",
    "SOL/USD": "0x975043adBb80fc32276CbF9Bbcfd4A601a12462D",
    "USDC/USD": "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
  },
  "137": {
    "MATIC/USD": "0xab594600376ec9fd91f8e885dadf0ce036862de0",
    "wBTC/USD": "0xde31f8bfbd8c84b5360cfacca3539b938dd78ae6",
    "ETH/USD": "0xF9680D99D6C9589e2a93a78A04A279e509205945",
  },
  "43114": {
    "AVAX/USD": "0x0a77230d17318075983913bc2145db16c7366156",
    "wBTC/USD": "0x2779d32d5166baaa2a39b69a1b7a8080bcdc26ff",
    "ETH/USD": "0x86d67c3d38d2bce8da5a2d8e032e2001fa8ec7ea",
  },
  "1337": {
    "BTC/USD": "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
  },
  "421613": {
    "ARB/USD": "0xYourArbitrumGoerliPriceFeedAddress",
    "ETH/USD": "0xYourArbitrumGoerliETHPriceFeedAddress",
  },
  "338": {
    "CRO/USD": "0xYourCronosTestnetPriceFeedAddress",
    "ETH/USD": "0xYourCronosTestnetETHPriceFeedAddress",
  },
  "80001": {
    "MATIC/USD": "0xYourPolygonMumbaiPriceFeedAddress",
    "ETH/USD": "0xYourPolygonMumbaiETHPriceFeedAddress",
  },
  "1442": {
    "ZKETH/USD": "0xYourPolygonZkEvmTestnetPriceFeedAddress",
    "ETH/USD": "0xYourPolygonZkEvmTestnetETHPriceFeedAddress",
  },
  "11155111": {
    "ETH/USD": "0xYourSepoliaETHPriceFeedAddress",
    "BTC/USD": "0xYourSepoliaBTCPriceFeedAddress",
  },
  "64165": {
    "SONIC/USD": "0xYourSonicTestnetPriceFeedAddress",
    "ETH/USD": "0xYourSonicTestnetETHPriceFeedAddress",
  },
}

export const tokenSaleDetails: { [key: string]: string } = {
  "666666666": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "250": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "137": "0x5746A1ec97d91c594e6042a7A42c8285C4c3A0EF",
  "64165": "0x5746a1ec97d91c594e6042a7a42c8285c4c3a0ef",
  "64240": "0x676e3fd472f437b86ee5203f5adf21b7687fddb6",
  "4002": "0xc88FfCd4f80DE8E20a09Fd8632b77f19035F9De4",
  "8453": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "43114": "0xeaa2465a90803f6e26bfb65c5c0fa6efbc228431",
  "30": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "31": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "148": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "501": "YourTokenAddressForSolanaMainnet",
  "421613": "0xYourArbitrumGoerliTokenSaleAddress",
  "338": "0xYourCronosTestnetTokenSaleAddress",
  "80001": "0xYourPolygonMumbaiTokenSaleAddress",
  "1442": "0xYourPolygonZkEvmTestnetTokenSaleAddress",
  "11155111": "0xYourSepoliaTokenSaleAddress",
}

export const tokenClaimDetails: { [key: string]: string } = {
  "666666666": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "250": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "137": "0x5746A1ec97d91c594e6042a7A42c8285C4c3A0EF",
  "64165": "0x5746a1ec97d91c594e6042a7a42c8285c4c3a0ef",
  "64240": "0x676e3fd472f437b86ee5203f5adf21b7687fddb6",
  "4002": "0x1889c363Ea9a0f2b1505F05716BA62DCF889b4d7",
  "8453": "0x396652c3fc3273b5946bdfe7b558a00a57ed27d7",
  "43114": "0xeaa2465a90803f6e26bfb65c5c0fa6efbc228431",
  "30": "0xe92163f8038843091c1df18f726cf04526ef9677",
  "31": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "148": "0x60debe92ddbf4187eda4dbd73c8bf64a38d4c25f",
  "501": "YourTokenAddressForSolanaMainnet",
  "421613": "0xYourArbitrumGoerliTokenClaimAddress",
  "338": "0xYourCronosTestnetTokenClaimAddress",
  "80001": "0xYourPolygonMumbaiTokenClaimAddress",
  "1442": "0xYourPolygonZkEvmTestnetTokenClaimAddress",
  "11155111": "0xYourSepoliaTokenClaimAddress",
}

export const frameFactoryDetails: {
  [key: string]: string
} = {
  "137": "0xYourVyperTokenAddressForPolygon",
  "250": "0xYourVyperTokenAddressForFantom",
  "4002": "0x04Acaf5ECED5f0E6f82d8dD361185e38B41CF34E",
  "84532": "0x04Acaf5ECED5f0E6f82d8dD361185e38B41CF34E",
  "421613": "0xYourArbitrumGoerliFrameFactoryAddress",
  "338": "0xYourCronosTestnetFrameFactoryAddress",
  "80001": "0xYourPolygonMumbaiFrameFactoryAddress",
  "1442": "0xYourPolygonZkEvmTestnetFrameFactoryAddress",
  "11155111": "0xYourSepoliaFrameFactoryAddress",
  "501": "0xYourSolanaMainnetFrameFactoryAddress",
  "64165": "0xYourSonicTestnetFrameFactoryAddress",
}

export const safeMemeTemplate: {
  [key: string]: string
} = {
  "4002": "0x8e48A0E6849179D24f7De46121b7268116F00d0C",
  "64165": "0x99Caf2D3EbE03B6671fc8ec7D3e6160e88359FA0",
  "421614": "0xA03C94Ec86fa9697b76E2ce17F95951e6207e2E0",
  "43113": "",
}

export const safeLaunchFactory: {
  [key: string]: string
} = {
  "4002": "0x3EC3eF1C4B882a85F7962c6AC22Bf8433990bAbb",
  "64165": "0xA0db964a0393AB56b14D9bcEdf756aA00f2e0361",
  "421614": "0xb3f9EA258fEC06a1522824E9edADBDFbAEEfe477",
}

export const exchangeTemplate: {
  [key: string]: string
} = {
  "4002": "0x841C50f907A52cD9D9CDB06695deB6A3d8803EfE",
  "64165": "0x7e17CA6532Cf7Db5324644EadDefB1cC5B71433D",
  "421614": "0xYourArbitrumGoerliExchangeTemplateAddress",
}

export const exchangeFactory: {
  [key: string]: string
} = {
  "4002": "0x605B3015025d3cCA4D32aa38f8a698A65C127352",
  "64165": "0xD4B1Cb9456d51829af3e0181E82E2F7f81B551D0",
  "421614": "0xeAA2465A90803f6E26BFB65C5c0Fa6EFBc228430",
}

export const houseFeesContract: {
  [key: string]: string
} = {
  "4002": "0x32A7D38a7f3FdEFf2d7fF362Bcff212A4f91E2cB",
  "64165": "0xe51540C284990B255bb0e07c0bc3dfb41e06c864",
  "421614": "0x60DEbe92Ddbf4187EdA4dbd73C8bf64a38d4c25E",
}

export const insurancePoolContract: {
  [key: string]: string
} = {
  "4002": "0xe0D8ed59bb130cf60143b14E798E11D0148a3Be2",
  "64165": "0xdD8F3fFd7B73c687Af45DF1F37596baB4c85C1A1",
  "421614": "0x9f6c73b65cfD186a425a44D92429D1A533dF21FA",
}

export const safeBaseToken: {
  [key: string]: string
} = {
  "4002": "0x64f96f5c95d9a2a4DD40d35d5fADb69D17dAF122",
  "64165": "0xb3f9EA258fEC06a1522824E9edADBDFbAEEfe477",
  "421614": "0xYourArbitrumGoerliSafeBaseTokenAddress",
}

export const airdropContract: {
  [key: string]: string
} = {
  "4002": "0x43b0f21F50CEB0942584a54a95c6d20BD18cF058",
  "64165": "0xA59eBfe75d467e2d26875030FE03563B8E42c250",
  "421614": "0xe5355DB1838d2e56786cC7E66FF9a122F2bb3d1d",
}

export const AirdropFactory: {
  [key: string]: string
} = {
  "4002": "0x441F549F386bdD45c33954A2CC6a96b30329a585",
  "64165": "0x1Aaf941fD48D3A267F56471E9a517E053Cad8F06",
  "421614": "0x8401eb679FBCc6522B6489C1a5E119532918f88a",
}
