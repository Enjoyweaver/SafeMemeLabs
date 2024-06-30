export const TokenFactoryABI = [
  {
    name: "NewToken",
    inputs: [
      {
        name: "safeMeme",
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
    type: "event",
  },
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      {
        name: "safe_meme_template",
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
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    name: "deployToken",
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
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "getDeployedTokenCount",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "safeMemeTemplate",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "tokensDeployed",
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
    stateMutability: "view",
    type: "function",
    name: "creationFee",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "feeRecipient",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
] as const
