export const ExchangeABI = [
  {
    name: "DEXTokenPurchase",
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
        name: "safememes_bought",
        type: "uint256",
        indexed: true,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "tokenBPurchase",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
      },
      {
        name: "soldsafeMemeThisTX",
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
        name: "safeMemesSoldThisStage",
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
        name: "soldsafeMemeThisTX",
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
    name: "CurrentStageCompleted",
    inputs: [
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
    name: "HouseFeesWithdrawn",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "OwnerFeesWithdrawn",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "FeeCharged",
    inputs: [
      {
        name: "fee",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "InsurancePoolFeesWithdrawn",
    inputs: [
      {
        name: "amount",
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
      {
        name: "_safeMemeLabs",
        type: "address",
      },
      {
        name: "_insurancePoolAddress",
        type: "address",
      },
      {
        name: "_insurancePoolContract",
        type: "address",
      },
      {
        name: "_houseFeesContract",
        type: "address",
      },
      {
        name: "_maxWalletAmount",
        type: "uint256",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "getAddresses",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
      },
      {
        name: "",
        type: "address",
      },
      {
        name: "",
        type: "address",
      },
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
    name: "activateSafeLaunch",
    inputs: [],
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "getStageDetails",
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
      {
        name: "",
        type: "uint256[5]",
      },
      {
        name: "",
        type: "uint256[5]",
      },
      {
        name: "",
        type: "uint256[5]",
      },
      {
        name: "",
        type: "uint256[5]",
      },
      {
        name: "",
        type: "uint256[5]",
      },
      {
        name: "",
        type: "uint256[5]",
      },
      {
        name: "",
        type: "bool[5]",
      },
      {
        name: "",
        type: "bool[5]",
      },
      {
        name: "",
        type: "bool[5]",
      },
      {
        name: "",
        type: "bool[5]",
      },
    ],
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
    name: "safeLaunchTXCount",
    inputs: [],
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
    name: "withdrawHouseFees",
    inputs: [],
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
    name: "withdrawInsurancePoolFees",
    inputs: [],
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
    name: "withdrawOwnerFees",
    inputs: [],
    outputs: [],
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
        name: "min_safememes",
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
    stateMutability: "payable",
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
    name: "safeMemeToSafeMemeSwapInput",
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
        name: "dexAddress",
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
        name: "dexAddress",
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
        name: "dexAddress",
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
        name: "dexAddress",
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
    name: "getTransactionByIndex",
    inputs: [
      {
        name: "index",
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
      {
        name: "",
        type: "address",
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
    name: "getLastFee",
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
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "getAllFees",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256[100]",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "getFees",
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
    ],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "setTransactionThreshold",
    inputs: [
      {
        name: "newThreshold",
        type: "uint256",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "getWhitelist",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address[10]",
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
    name: "totalTransactionsPerStage",
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
    name: "soldsafeMemeThisTX",
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
    name: "safeMemesSoldThisStage",
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
    name: "whitelistedAddresses",
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
    name: "whitelistCount",
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
    name: "dex",
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
            name: "safeMemeInitialStageAmount",
            type: "uint256",
          },
          {
            name: "safeMemeRemaining",
            type: "uint256",
          },
          {
            name: "tokenBReceived",
            type: "uint256",
          },
          {
            name: "safeMemesSoldThisStage",
            type: "uint256",
          },
          {
            name: "soldsafeMemeThisTX",
            type: "uint256",
          },
          {
            name: "safeLaunchTransactions",
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
    name: "isInDEXMode",
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
    name: "totalSafeMemesSold",
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
    name: "stage_statuses",
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
            name: "is_open",
            type: "bool",
          },
          {
            name: "tokenBRequired_set",
            type: "bool",
          },
          {
            name: "tokenBReceived_met",
            type: "bool",
          },
          {
            name: "stage_completed",
            type: "bool",
          },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "safeMemeRemaining",
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
    name: "totalTokenBReceived",
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
    name: "lastFee",
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
    name: "allFees",
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
    name: "feeCount",
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
    name: "safeLaunchActive",
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
    name: "accumulatedOwnerFees",
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
    name: "accumulatedHouseFees",
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
    name: "insurancePoolAddress",
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
    name: "accumulatedInsurancePoolFees",
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
    name: "safeMemeLabs",
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
    name: "transactionCounter",
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
    name: "transactionCount",
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
    name: "insurancePoolContract",
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
    name: "safeLaunchTransactions",
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
    name: "totalTransactions",
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
    name: "houseFeesContract",
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
    name: "transactionThreshold",
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
    name: "maxWalletAmount",
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
    name: "pastTransactions",
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
            name: "safememeAmount",
            type: "uint256",
          },
          {
            name: "tokenBAmount",
            type: "uint256",
          },
          {
            name: "gasUsed",
            type: "uint256",
          },
          {
            name: "swapFee",
            type: "uint256",
          },
          {
            name: "ownerFee",
            type: "uint256",
          },
          {
            name: "houseFee",
            type: "uint256",
          },
          {
            name: "wallet",
            type: "address",
          },
          {
            name: "txtimestamp",
            type: "uint256",
          },
        ],
      },
    ],
  },
] as const
