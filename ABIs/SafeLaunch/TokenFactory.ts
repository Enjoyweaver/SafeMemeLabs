export const TokenFactoryABI = [
  {
    type: "event",
    name: "NewTokenAndLaunch",
    inputs: [
      {
        name: "safeMeme",
        type: "address",
        indexed: true,
      },
      {
        name: "safeLaunch",
        type: "address",
        indexed: true,
      },
      {
        name: "owner",
        type: "address",
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: "constructor",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "safe_meme_template",
        type: "address",
      },
      {
        name: "safe_launch_template",
        type: "address",
      },
      {
        name: "exchange_factory",
        type: "address",
      },
      {
        name: "exchange_token",
        type: "address",
      },
      {
        name: "creation_fee",
        type: "uint256",
      },
      {
        name: "fee_recipient",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "deployTokenAndLaunch",
    stateMutability: "payable",
    inputs: [
      {
        name: "name",
        type: "string",
      },
      {
        name: "symbol",
        type: "string",
      },
      {
        name: "decimals",
        type: "uint256",
      },
      {
        name: "totalSupply",
        type: "uint256",
      },
      {
        name: "antiWhalePercentage",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
      },
      {
        name: "",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "getDeployedTokenCount",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "getDeployedLaunchCount",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "safeMemeTemplate",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "safeLaunchTemplate",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "exchangeFactoryAddress",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "exchangeToken",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "tokensDeployed",
    stateMutability: "view",
    inputs: [
      {
        name: "arg0",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "launchesDeployed",
    stateMutability: "view",
    inputs: [
      {
        name: "arg0",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "creationFee",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "feeRecipient",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
]
