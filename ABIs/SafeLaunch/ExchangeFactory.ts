export const ExchangeFactoryABI = [
  {
    name: "NewExchange",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
      },
      {
        name: "exchange",
        type: "address",
        indexed: true,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "initializeFactory",
    inputs: [
      {
        name: "template",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "setTokenFactory",
    inputs: [
      {
        name: "tokenFactory",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "createExchange",
    inputs: [
      {
        name: "token",
        type: "address",
      },
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
    stateMutability: "nonpayable",
    type: "function",
    name: "initializeExchangeTemplate",
    inputs: [
      {
        name: "template",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "updateTokenFactory",
    inputs: [
      {
        name: "tokenFactory",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "getExchange",
    inputs: [
      {
        name: "token",
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
    stateMutability: "view",
    type: "function",
    name: "getToken",
    inputs: [
      {
        name: "exchange",
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
    stateMutability: "view",
    type: "function",
    name: "getTokenWithId",
    inputs: [
      {
        name: "token_id",
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
    name: "exchangeTemplate",
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
    name: "tokenCount",
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
    name: "token_to_exchange",
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
    stateMutability: "view",
    type: "function",
    name: "exchange_to_token",
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
    stateMutability: "view",
    type: "function",
    name: "id_to_token",
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
    name: "tokenFactory",
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
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
] as const
