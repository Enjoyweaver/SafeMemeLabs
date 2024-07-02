export const ExchangeABI = [
  {
    name: "TokenPurchase",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
      },
      {
        name: "eth_sold",
        type: "uint256",
        indexed: true,
      },
      {
        name: "tokens_bought",
        type: "uint256",
        indexed: true,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
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
        indexed: true,
      },
      {
        name: "eth_bought",
        type: "uint256",
        indexed: true,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "AddLiquidity",
    inputs: [
      {
        name: "provider",
        type: "address",
        indexed: true,
      },
      {
        name: "eth_amount",
        type: "uint256",
        indexed: true,
      },
      {
        name: "token_amount",
        type: "uint256",
        indexed: true,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "RemoveLiquidity",
    inputs: [
      {
        name: "provider",
        type: "address",
        indexed: true,
      },
      {
        name: "eth_amount",
        type: "uint256",
        indexed: true,
      },
      {
        name: "token_amount",
        type: "uint256",
        indexed: true,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "Transfer",
    inputs: [
      {
        name: "_from",
        type: "address",
        indexed: true,
      },
      {
        name: "_to",
        type: "address",
        indexed: true,
      },
      {
        name: "_value",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "Approval",
    inputs: [
      {
        name: "_owner",
        type: "address",
        indexed: true,
      },
      {
        name: "_spender",
        type: "address",
        indexed: true,
      },
      {
        name: "_value",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "setup",
    inputs: [
      {
        name: "token_addr",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    name: "addLiquidity",
    inputs: [
      {
        name: "min_liquidity",
        type: "uint256",
      },
      {
        name: "max_tokens",
        type: "uint256",
      },
      {
        name: "deadline",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "removeLiquidity",
    inputs: [
      {
        name: "amount",
        type: "uint256",
      },
      {
        name: "min_eth",
        type: "uint256",
      },
      {
        name: "min_tokens",
        type: "uint256",
      },
      {
        name: "deadline",
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
    stateMutability: "payable",
    type: "fallback",
  },
  {
    stateMutability: "payable",
    type: "function",
    name: "ethToTokenSwapInput",
    inputs: [
      {
        name: "min_tokens",
        type: "uint256",
      },
      {
        name: "deadline",
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
    stateMutability: "payable",
    type: "function",
    name: "ethToTokenTransferInput",
    inputs: [
      {
        name: "min_tokens",
        type: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
      },
      {
        name: "recipient",
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
    stateMutability: "payable",
    type: "function",
    name: "ethToTokenSwapOutput",
    inputs: [
      {
        name: "tokens_bought",
        type: "uint256",
      },
      {
        name: "deadline",
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
    stateMutability: "payable",
    type: "function",
    name: "ethToTokenTransferOutput",
    inputs: [
      {
        name: "tokens_bought",
        type: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
      },
      {
        name: "recipient",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "tokenToEthSwapInput",
    inputs: [
      {
        name: "tokens_sold",
        type: "uint256",
      },
      {
        name: "min_eth",
        type: "uint256",
      },
      {
        name: "deadline",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "tokenToEthTransferInput",
    inputs: [
      {
        name: "tokens_sold",
        type: "uint256",
      },
      {
        name: "min_eth",
        type: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
      },
      {
        name: "recipient",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "tokenToEthSwapOutput",
    inputs: [
      {
        name: "eth_bought",
        type: "uint256",
      },
      {
        name: "max_tokens",
        type: "uint256",
      },
      {
        name: "deadline",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "tokenToEthTransferOutput",
    inputs: [
      {
        name: "eth_bought",
        type: "uint256",
      },
      {
        name: "max_tokens",
        type: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
      },
      {
        name: "recipient",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "tokenToTokenSwapInput",
    inputs: [
      {
        name: "tokens_sold",
        type: "uint256",
      },
      {
        name: "min_tokens_bought",
        type: "uint256",
      },
      {
        name: "min_eth_bought",
        type: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
      },
      {
        name: "token_addr",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "tokenToTokenTransferInput",
    inputs: [
      {
        name: "tokens_sold",
        type: "uint256",
      },
      {
        name: "min_tokens_bought",
        type: "uint256",
      },
      {
        name: "min_eth_bought",
        type: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
      },
      {
        name: "recipient",
        type: "address",
      },
      {
        name: "token_addr",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "tokenToTokenSwapOutput",
    inputs: [
      {
        name: "tokens_bought",
        type: "uint256",
      },
      {
        name: "max_tokens_sold",
        type: "uint256",
      },
      {
        name: "max_eth_sold",
        type: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
      },
      {
        name: "token_addr",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "tokenToTokenTransferOutput",
    inputs: [
      {
        name: "tokens_bought",
        type: "uint256",
      },
      {
        name: "max_tokens_sold",
        type: "uint256",
      },
      {
        name: "max_eth_sold",
        type: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
      },
      {
        name: "recipient",
        type: "address",
      },
      {
        name: "token_addr",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "tokenToExchangeSwapInput",
    inputs: [
      {
        name: "tokens_sold",
        type: "uint256",
      },
      {
        name: "min_tokens_bought",
        type: "uint256",
      },
      {
        name: "min_eth_bought",
        type: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
      },
      {
        name: "exchange_addr",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "tokenToExchangeTransferInput",
    inputs: [
      {
        name: "tokens_sold",
        type: "uint256",
      },
      {
        name: "min_tokens_bought",
        type: "uint256",
      },
      {
        name: "min_eth_bought",
        type: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
      },
      {
        name: "recipient",
        type: "address",
      },
      {
        name: "exchange_addr",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "tokenToExchangeSwapOutput",
    inputs: [
      {
        name: "tokens_bought",
        type: "uint256",
      },
      {
        name: "max_tokens_sold",
        type: "uint256",
      },
      {
        name: "max_eth_sold",
        type: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
      },
      {
        name: "exchange_addr",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "tokenToExchangeTransferOutput",
    inputs: [
      {
        name: "tokens_bought",
        type: "uint256",
      },
      {
        name: "max_tokens_sold",
        type: "uint256",
      },
      {
        name: "max_eth_sold",
        type: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
      },
      {
        name: "recipient",
        type: "address",
      },
      {
        name: "exchange_addr",
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
    stateMutability: "view",
    type: "function",
    name: "getEthToTokenInputPrice",
    inputs: [
      {
        name: "eth_sold",
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
    stateMutability: "view",
    type: "function",
    name: "getEthToTokenOutputPrice",
    inputs: [
      {
        name: "tokens_bought",
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
    stateMutability: "view",
    type: "function",
    name: "getTokenToEthInputPrice",
    inputs: [
      {
        name: "tokens_sold",
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
    stateMutability: "view",
    type: "function",
    name: "getTokenToEthOutputPrice",
    inputs: [
      {
        name: "eth_bought",
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
    stateMutability: "view",
    type: "function",
    name: "tokenAddress",
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
    name: "factoryAddress",
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
    name: "balanceOf",
    inputs: [
      {
        name: "_owner",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "transfer",
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "transferFrom",
    inputs: [
      {
        name: "_from",
        type: "address",
      },
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "approve",
    inputs: [
      {
        name: "_spender",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
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
    stateMutability: "view",
    type: "function",
    name: "allowance",
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
      {
        name: "_spender",
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
    stateMutability: "view",
    type: "function",
    name: "name",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "decimals",
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
    name: "totalSupply",
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
    name: "balances",
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
    stateMutability: "view",
    type: "function",
    name: "allowances",
    inputs: [
      {
        name: "arg0",
        type: "address",
      },
      {
        name: "arg1",
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
    stateMutability: "view",
    type: "function",
    name: "token",
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
    name: "factory",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
  },
] as const
