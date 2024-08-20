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
    name: "AddLiquidity",
    inputs: [
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
      {
        name: "deadline",
        type: "uint256",
        indexed: false,
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
        name: "safeMemesSoldThisStage",
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
    name: "LogTotalTokenBReceived",
    inputs: [
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
    name: "LogUnlockedSafeMeme",
    inputs: [
      {
        name: "unlocked_safeMeme",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "BuyTokensStarted",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
      },
      {
        name: "tokenBAmount",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "CurrentStageStatus",
    inputs: [
      {
        name: "stage",
        type: "uint256",
        indexed: false,
      },
      {
        name: "status",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "SafeMemeAmountCalculated",
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
    name: "CurrentSafeMemeRemaining",
    inputs: [
      {
        name: "remaining",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "AmountsAdjusted",
    inputs: [
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
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "MaxTransferLimit",
    inputs: [
      {
        name: "limit",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "AttemptingTokenBTransfer",
    inputs: [
      {
        name: "sender",
        type: "address",
        indexed: true,
      },
      {
        name: "receiver",
        type: "address",
        indexed: true,
      },
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
    name: "TokenBTransferSuccessful",
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
    name: "CurrentStageInfoBeforeUpdate",
    inputs: [
      {
        name: "stage",
        type: "uint256",
        indexed: false,
      },
      {
        name: "safeMemeRemaining",
        type: "uint256",
        indexed: false,
      },
      {
        name: "tokenBReceived",
        type: "uint256",
        indexed: false,
      },
      {
        name: "safeMemesSoldThisStage",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "UpdatedStageInfo",
    inputs: [
      {
        name: "stage",
        type: "uint256",
        indexed: false,
      },
      {
        name: "safeMemeRemaining",
        type: "uint256",
        indexed: false,
      },
      {
        name: "tokenBReceived",
        type: "uint256",
        indexed: false,
      },
      {
        name: "safeMemesSoldThisStage",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "AttemptingSafeMemeTransfer",
    inputs: [
      {
        name: "receiver",
        type: "address",
        indexed: true,
      },
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
    name: "SafeMemeTransferSuccessful",
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
    name: "ExcessTokenBAmount",
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
    name: "AttemptingExcessTokenBReturn",
    inputs: [
      {
        name: "receiver",
        type: "address",
        indexed: true,
      },
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
    name: "ExcessTokenBReturnSuccessful",
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
    name: "ProgressedToNextStage",
    inputs: [
      {
        name: "newStage",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "BuyTokensCompleted",
    inputs: [
      {
        name: "buyer",
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
    stateMutability: "payable",
    type: "fallback",
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "tokenBTosafeMemeSwapInput",
    inputs: [
      {
        name: "tokenB_sold",
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
    name: "totalSafeMemesSoldPercentage",
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
    name: "lockedSafeMemeLiquidity",
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
    name: "lockedTokenBLiquidity",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
] as const
