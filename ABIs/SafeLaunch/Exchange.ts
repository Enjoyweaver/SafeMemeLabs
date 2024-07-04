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
        name: "tokenB_sold",
        type: "uint256",
        indexed: true,
      },
      {
        name: "safememe_bought",
        type: "uint256",
        indexed: true,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "TokenBPurchase",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
      },
      {
        name: "safememe_sold",
        type: "uint256",
        indexed: true,
      },
      {
        name: "tokenB_bought",
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
        name: "tokenB_amount",
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
    type: "event",
  },
  {
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
    type: "event",
  },
  {
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
    type: "event",
  },
  {
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
    type: "event",
  },
  {
    name: "StageAmountSet",
    inputs: [
      {
        name: "stage",
        type: "uint256",
        indexed: true,
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
      },
      {
        name: "tokenBAddress",
        type: "address",
        indexed: true,
      },
      {
        name: "tokenBName",
        type: "string",
        indexed: false,
      },
      {
        name: "tokenBSymbol",
        type: "string",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "StageLiquidityUpdated",
    inputs: [
      {
        name: "stage",
        type: "uint256",
        indexed: true,
      },
      {
        name: "tokenBReceived",
        type: "uint256",
        indexed: false,
      },
      {
        name: "safeMemesSold",
        type: "uint256",
        indexed: false,
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
    name: "SafeLaunched",
    inputs: [
      {
        name: "token",
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
    stateMutability: "nonpayable",
    type: "function",
    name: "setTokenBDetails",
    inputs: [
      {
        name: "_tokenBAddress",
        type: "address",
      },
      {
        name: "_tokenBName",
        type: "string",
      },
      {
        name: "_tokenBSymbol",
        type: "string",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "setStageTokenBAmount",
    inputs: [
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
    stateMutability: "nonpayable",
    type: "function",
    name: "buyTokens",
    inputs: [
      {
        name: "tokenBAmount",
        type: "uint256",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "getStageLiquidity",
    inputs: [
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
    stateMutability: "payable",
    type: "fallback",
  },
  {
    stateMutability: "payable",
    type: "function",
    name: "tokenBToTokenSwapInput",
    inputs: [
      {
        name: "min_safememe",
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
    name: "tokenBToTokenTransferInput",
    inputs: [
      {
        name: "min_safememe",
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
    name: "tokenBToTokenSwapOutput",
    inputs: [
      {
        name: "safememe_bought",
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
    name: "tokenBToTokenTransferOutput",
    inputs: [
      {
        name: "safememe_bought",
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
    name: "tokenToTokenBSwapInput",
    inputs: [
      {
        name: "safememe_sold",
        type: "uint256",
      },
      {
        name: "min_tokenB",
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
    name: "tokenToTokenBTransferInput",
    inputs: [
      {
        name: "safememe_sold",
        type: "uint256",
      },
      {
        name: "min_tokenB",
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
    name: "tokenToTokenBSwapOutput",
    inputs: [
      {
        name: "tokenB_bought",
        type: "uint256",
      },
      {
        name: "max_safememe",
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
    name: "tokenToTokenBTransferOutput",
    inputs: [
      {
        name: "tokenB_bought",
        type: "uint256",
      },
      {
        name: "max_safememe",
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
        name: "safememe_sold",
        type: "uint256",
      },
      {
        name: "min_safememe_bought",
        type: "uint256",
      },
      {
        name: "min_tokenB_bought",
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
        name: "safememe_sold",
        type: "uint256",
      },
      {
        name: "min_safememe_bought",
        type: "uint256",
      },
      {
        name: "min_tokenB_bought",
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
        name: "safememe_bought",
        type: "uint256",
      },
      {
        name: "max_safememe_sold",
        type: "uint256",
      },
      {
        name: "max_tokenB_sold",
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
        name: "safememe_bought",
        type: "uint256",
      },
      {
        name: "max_safememe_sold",
        type: "uint256",
      },
      {
        name: "max_tokenB_sold",
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
        name: "safememe_sold",
        type: "uint256",
      },
      {
        name: "min_safememe_bought",
        type: "uint256",
      },
      {
        name: "min_tokenB_bought",
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
        name: "safememe_sold",
        type: "uint256",
      },
      {
        name: "min_safememe_bought",
        type: "uint256",
      },
      {
        name: "min_tokenB_bought",
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
        name: "safememe_bought",
        type: "uint256",
      },
      {
        name: "max_safememe_sold",
        type: "uint256",
      },
      {
        name: "max_tokenB_sold",
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
        name: "safememe_bought",
        type: "uint256",
      },
      {
        name: "max_safememe_sold",
        type: "uint256",
      },
      {
        name: "max_tokenB_sold",
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
    name: "getTokenBToTokenInputPrice",
    inputs: [
      {
        name: "tokenB_sold",
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
    name: "getTokenBToTokenOutputPrice",
    inputs: [
      {
        name: "safememe_bought",
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
    name: "getTokenToTokenBInputPrice",
    inputs: [
      {
        name: "safememe_sold",
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
    name: "getTokenToTokenBOutputPrice",
    inputs: [
      {
        name: "tokenB_bought",
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
    name: "getAllStagesLiquidity",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256[5]",
      },
      {
        name: "",
        type: "uint256[5]",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "getStageInfo",
    inputs: [
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
    stateMutability: "view",
    type: "function",
    name: "getCurrentStage",
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
    name: "getSaleStatus",
    inputs: [],
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
    name: "getTokensAvailable",
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
    name: "getTokensSold",
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
    name: "getReceivedTokenB",
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
    name: "isSafeLaunched",
    inputs: [],
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
  {
    stateMutability: "view",
    type: "function",
    name: "stageTokenBAmounts",
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
    stateMutability: "view",
    type: "function",
    name: "tokenPrices",
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
    stateMutability: "view",
    type: "function",
    name: "soldTokens",
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
    stateMutability: "view",
    type: "function",
    name: "currentStage",
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
    name: "stageSet",
    inputs: [
      {
        name: "arg0",
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
    name: "stageTokenBReceived",
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
    stateMutability: "view",
    type: "function",
    name: "lockedTokens",
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
    name: "safeLaunched",
    inputs: [],
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
    name: "tokenBAddress",
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
    name: "tokenBName",
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
    name: "tokenBSymbol",
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
    name: "saleActive",
    inputs: [],
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
    name: "owner",
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
    name: "antiWhalePercentage",
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
    name: "whitelist",
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
