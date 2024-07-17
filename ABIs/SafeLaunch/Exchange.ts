export const ExchangeABI = [
  {
    name: "tokenBPurchase",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
      },
      {
        name: "soldsafeMeme",
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
        name: "safeMeme_amount",
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
        name: "safeMeme",
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
        name: "safeMeme",
        type: "address",
        indexed: true,
      },
      {
        name: "stage",
        type: "uint256",
        indexed: false,
      },
      {
        name: "safeMemessSold",
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
    name: "SafeMemePurchased",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
      },
      {
        name: "safeMeme",
        type: "address",
        indexed: true,
      },
      {
        name: "safeMemeAmount",
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
    name: "tokenBSet",
    inputs: [
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
    name: "InternalTransfer",
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
    name: "LiquidityAdded",
    inputs: [
      {
        name: "safeMeme_amount",
        type: "uint256",
        indexed: false,
      },
      {
        name: "tokenB_amount",
        type: "uint256",
        indexed: false,
      },
      {
        name: "lp_tokens",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "SafeLaunchCompleted",
    inputs: [
      {
        name: "safeMeme",
        type: "address",
        indexed: true,
      },
      {
        name: "locked_safeMeme",
        type: "uint256",
        indexed: false,
      },
      {
        name: "total_tokenB_received",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "DEXStageInitialized",
    inputs: [
      {
        name: "safeMeme",
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
        name: "safeMeme",
        type: "address",
      },
      {
        name: "_owner",
        type: "address",
      },
      {
        name: "_name",
        type: "string",
      },
      {
        name: "_symbol",
        type: "string",
      },
      {
        name: "_decimals",
        type: "uint256",
      },
      {
        name: "_totalSupply",
        type: "uint256",
      },
      {
        name: "_antiWhalePercentage",
        type: "uint256",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "safeMemeAddress",
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
    name: "activateSafeLaunch",
    inputs: [],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "settokenBDetails",
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
    name: "setStagetokenBAmount",
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
    name: "setupStages",
    inputs: [
      {
        name: "total_supply",
        type: "uint256",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "startSafeLaunch",
    inputs: [],
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
    name: "getAllStagesLiquidity",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256[6]",
      },
      {
        name: "",
        type: "uint256[6]",
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
    stateMutability: "view",
    type: "function",
    name: "getCurrentStageInfo",
    inputs: [],
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
        type: "bool",
      },
      {
        name: "",
        type: "bool",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "getsafeMemesAvailable",
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
    name: "getsafeMemesSold",
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
    name: "getReceivedtokenB",
    inputs: [],
    outputs: [
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
    name: "tokenBTosafeMemeSwapInput",
    inputs: [
      {
        name: "min_safeMeme",
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
    name: "swapTokenBForSafeMeme",
    inputs: [
      {
        name: "tokenBAmount",
        type: "uint256",
      },
      {
        name: "min_safeMeme",
        type: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    name: "tokenBTosafeMemeTransferInput",
    inputs: [
      {
        name: "min_safeMeme",
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
    name: "tokenBTosafeMemeSwapOutput",
    inputs: [
      {
        name: "safeMemes_bought",
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
    name: "tokenBTosafeMemeTransferOutput",
    inputs: [
      {
        name: "safeMemes_bought",
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
    name: "safeMemeTotokenBSwapInput",
    inputs: [
      {
        name: "safeMemes_sold",
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
    name: "safeMemeTotokenBTransferInput",
    inputs: [
      {
        name: "safeMemes_sold",
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
    name: "safeMemeTotokenBSwapOutput",
    inputs: [
      {
        name: "tokenB_bought",
        type: "uint256",
      },
      {
        name: "max_safeMemes",
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
    name: "safeMemeTotokenBTransferOutput",
    inputs: [
      {
        name: "tokenB_bought",
        type: "uint256",
      },
      {
        name: "max_safeMemes",
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
    name: "safeMeneToSafeMemeSwapInput",
    inputs: [
      {
        name: "safeMemes_sold",
        type: "uint256",
      },
      {
        name: "min_safeMemes_bought",
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
        name: "safeMeme",
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
    name: "safeMemeToSafeMemeTransferInput",
    inputs: [
      {
        name: "safeMemes_sold",
        type: "uint256",
      },
      {
        name: "min_safeMemes_bought",
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
        name: "safeMeme",
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
    name: "safeMemeToSafeMemeSwapOutput",
    inputs: [
      {
        name: "safeMemes_bought",
        type: "uint256",
      },
      {
        name: "max_safeMemes_sold",
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
        name: "safeMeme",
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
    name: "safeMemeToSafeMemeTransferOutput",
    inputs: [
      {
        name: "safeMemes_bought",
        type: "uint256",
      },
      {
        name: "max_safeMemes_sold",
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
        name: "safeMeme",
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
    name: "safeMemeToExchangeSwapInput",
    inputs: [
      {
        name: "safeMemes_sold",
        type: "uint256",
      },
      {
        name: "min_safeMemes_bought",
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
        name: "dex_addr",
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
    name: "safeMemeToExchangeTransferInput",
    inputs: [
      {
        name: "safeMemes_sold",
        type: "uint256",
      },
      {
        name: "min_safeMemes_bought",
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
        name: "dex_addr",
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
    name: "safeMemeToExchangeSwapOutput",
    inputs: [
      {
        name: "safeMemes_bought",
        type: "uint256",
      },
      {
        name: "max_safeMemes_sold",
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
        name: "dex_addr",
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
    name: "safeMemeToExchangeTransferOutput",
    inputs: [
      {
        name: "safeMemes_bought",
        type: "uint256",
      },
      {
        name: "max_safeMemes_sold",
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
        name: "dex_addr",
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
    name: "gettokenBToSafeMemeInputPrice",
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
    name: "gettokenBToSafeMemeOutputPrice",
    inputs: [
      {
        name: "safeMemes_bought",
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
    name: "getSafeMemeTotokenBInputPrice",
    inputs: [
      {
        name: "safeMemes_sold",
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
    name: "getSafeMemeTotokenBOutputPrice",
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
    name: "exchangeFactory",
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
    name: "stagetokenBAmounts",
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
    name: "safeMemePrices",
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
    name: "soldsafeMeme",
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
    name: "stagetokenBReceived",
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
    name: "lockedsafeMeme",
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
  {
    stateMutability: "view",
    type: "function",
    name: "safeMeme",
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
    name: "salesafeMeme",
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
    name: "releasedTokens",
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
    name: "stages",
    inputs: [
      {
        name: "arg0",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          {
            name: "status",
            type: "uint256",
          },
          {
            name: "tokenBRequired",
            type: "uint256",
          },
          {
            name: "safeMemePrice",
            type: "uint256",
          },
          {
            name: "safeMemeAvailable",
            type: "uint256",
          },
          {
            name: "tokenBReceived",
            type: "uint256",
          },
          {
            name: "soldsafeMeme",
            type: "uint256",
          },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "safeLaunchComplete",
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
    name: "safeMemeReserve",
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
    name: "lpToken",
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
    name: "ownerFeePercentage",
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
    name: "dexActive",
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
    name: "initialSafeMemeReserve",
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
    name: "tokenBReserve",
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
    name: "dexAddress",
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
    name: "lpTokenBalance",
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
    name: "isInSafeLaunchMode",
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
    name: "isInDEXMode",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
  },
] as const
