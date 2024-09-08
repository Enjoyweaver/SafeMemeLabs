export const InsurancePoolABI = [
  {
    name: "FeesCollected",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        indexed: false,
      },
      {
        name: "contractCaller",
        type: "address",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "FeesWithdrawn",
    inputs: [
      {
        name: "amountWithdrawn",
        type: "uint256",
        indexed: false,
      },
      {
        name: "totalAccumulated",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "constructor",
    inputs: [
      {
        name: "insurance_pool",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    name: "collectFees",
    inputs: [
      {
        name: "contractCaller",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    name: "getAccumulatedFees",
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
    name: "withdrawFees",
    inputs: [],
    outputs: [],
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
