export const safeSaleABI = [
  {
    type: "event",
    name: "StageCompleted",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
      },
      {
        name: "stage",
        type: "uint256",
        indexed: false,
      },
      {
        name: "tokensSold",
        type: "uint256",
        indexed: false,
      },
      {
        name: "tokenBReceived",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SaleFinalized",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
      },
      {
        name: "totalTokensSold",
        type: "uint256",
        indexed: false,
      },
      {
        name: "totalTokenBReceived",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SaleCancelled",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
      },
      {
        name: "stage",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "LiquidityProvided",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
      },
      {
        name: "tokenAmount",
        type: "uint256",
        indexed: false,
      },
      {
        name: "tokenBAmount",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "constructor",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "tokenFactory",
        type: "address",
      },
      {
        name: "tokenTemplate",
        type: "address",
      },
      {
        name: "safeLock",
        type: "address",
      },
    ],
  },
  {
    type: "function",
    name: "startSafeLaunch",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "token",
        type: "address",
      },
      {
        name: "totalSupply",
        type: "uint256",
      },
      {
        name: "stageTokenBAmounts",
        type: "uint256[5]",
      },
      {
        name: "initialPrices",
        type: "uint256[5]",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "buyTokens",
    stateMutability: "payable",
    inputs: [
      {
        name: "token",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "cancelSale",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "token",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getStageDetails",
    stateMutability: "view",
    inputs: [
      {
        name: "token",
        type: "address",
      },
      {
        name: "stage",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
      {
        name: "",
        type: "uint256",
      },
      {
        name: "",
        type: "uint256",
      },
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "getTokensDeployedByUser",
    stateMutability: "view",
    inputs: [
      {
        name: "user",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address[]",
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
    name: "getSaleStatus",
    stateMutability: "view",
    inputs: [
      {
        name: "token",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
      },
      {
        name: "",
        type: "uint256",
      },
      {
        name: "",
        type: "uint256",
      },
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "tokenFactory",
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
    name: "tokenTemplate",
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
    name: "stages",
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
    name: "safeLock",
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
    name: "stageTokenBAmounts",
    stateMutability: "view",
    inputs: [
      {
        name: "arg0",
        type: "address",
      },
      {
        name: "arg1",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "tokenPrices",
    stateMutability: "view",
    inputs: [
      {
        name: "arg0",
        type: "address",
      },
      {
        name: "arg1",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
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
    name: "userTokens",
    stateMutability: "view",
    inputs: [
      {
        name: "arg0",
        type: "address",
      },
      {
        name: "arg1",
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
    name: "receivedTokenB",
    stateMutability: "view",
    inputs: [
      {
        name: "arg0",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "soldTokens",
    stateMutability: "view",
    inputs: [
      {
        name: "arg0",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [
      {
        name: "arg0",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "tokenOwners",
    stateMutability: "view",
    inputs: [
      {
        name: "arg0",
        type: "address",
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
    name: "currentStage",
    stateMutability: "view",
    inputs: [
      {
        name: "arg0",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "saleActive",
    stateMutability: "view",
    inputs: [
      {
        name: "arg0",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
  },
] as const
