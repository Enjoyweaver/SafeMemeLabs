export const SafeLaunchABI = [
  {
    type: "event",
    name: "StageStarted",
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
    type: "event",
    name: "TokenPurchase",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
      },
      {
        name: "tokenB_sold",
        type: "uint256",
        indexed: false,
      },
      {
        name: "tokens_bought",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "EthPurchase",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
      },
      {
        name: "tokens_sold",
        type: "uint256",
        indexed: false,
      },
      {
        name: "tokenB_bought",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StageTokenBSet",
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
        name: "amount",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StagePriceCalculated",
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
        name: "price",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NextStageStarted",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
      },
      {
        name: "newStage",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SaleCompleted",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SaleProgressed",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
      },
      {
        name: "newStage",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WhitelistAdded",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WhitelistRemoved",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PriceUpdated",
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
        name: "newPrice",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokensPurchased",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
      },
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
    name: "LiquidityAdded",
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
      {
        name: "exchangeAddress",
        type: "address",
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
        name: "_owner",
        type: "address",
      },
      {
        name: "_exchangeFactoryAddress",
        type: "address",
      },
      {
        name: "_exchangeToken",
        type: "address",
      },
      {
        name: "_safeLaunchFactory",
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
        name: "safeMemeToken",
        type: "address",
      },
      {
        name: "totalSupply",
        type: "uint256",
      },
      {
        name: "creator",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "setStageTokenBAmount",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "token",
        type: "address",
      },
      {
        name: "stage",
        type: "uint256",
      },
      {
        name: "amount",
        type: "uint256",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "buyTokens",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "token",
        type: "address",
      },
      {
        name: "tokenBAmount",
        type: "uint256",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "addToWhitelist",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "user",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "removeFromWhitelist",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "user",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getStageInfo",
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
    ],
  },
  {
    type: "function",
    name: "getCurrentStage",
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
    ],
  },
  {
    type: "function",
    name: "getTokensAvailable",
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
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "getTokensSold",
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
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "getReceivedTokenB",
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
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "owner",
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
    name: "stageTokenBAmounts",
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
  {
    type: "function",
    name: "lockedTokens",
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
    name: "releasedTokens",
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
    name: "whitelisted",
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
  {
    type: "function",
    name: "safeLaunchFactory",
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
    name: "safeMemeCreator",
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
] as const
